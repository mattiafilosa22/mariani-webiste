<?php
/**
 * Webhook di deploy: notifica GitHub (repository_dispatch) sui cambi contenuto.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Webhook;

use Mariani\Core\Module;
use Mariani\Core\Support\Schema;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Invia un repository_dispatch a GitHub quando auto o pagine cambiano.
 *
 * Include un debounce (transient) per evitare rebuild a raffica ed e un no-op
 * silenzioso se le costanti di configurazione non sono definite.
 *
 * L'esito dell'ultima chiamata viene registrato e, in caso di errore, mostrato
 * in bacheca: senza, un token scaduto o revocato produrrebbe un guasto muto —
 * il redattore pubblica, WordPress dice "fatto", e il sito non si aggiorna piu.
 */
final class DeployWebhook implements Module {

	/**
	 * Chiave del transient di debounce.
	 *
	 * @var string
	 */
	private const DEBOUNCE_KEY = 'mariani_deploy_debounce';

	/**
	 * Opzione con l'esito dell'ultima notifica inviata.
	 *
	 * @var string
	 */
	private const STATUS_OPTION = 'mariani_deploy_last_status';

	/**
	 * Finestra di debounce in secondi.
	 *
	 * @var int
	 */
	private const DEBOUNCE_SECONDS = 120;

	/**
	 * Evento inviato a GitHub Actions.
	 *
	 * @var string
	 */
	private const EVENT_TYPE = 'wp-content-updated';

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'save_post_' . Schema::CPT_AUTO, array( $this, 'on_save' ), 10, 2 );
		add_action( 'save_post_page', array( $this, 'on_save' ), 10, 2 );
		add_action( 'transition_post_status', array( $this, 'on_transition' ), 10, 3 );
		add_action( 'admin_notices', array( $this, 'render_failure_notice' ) );
	}

	/**
	 * Avvisa in bacheca se l'ultima notifica a GitHub non e andata a buon fine.
	 */
	public function render_failure_notice(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		$status = get_option( self::STATUS_OPTION );

		if ( ! is_array( $status ) || ! empty( $status['ok'] ) ) {
			return;
		}

		printf(
			'<div class="notice notice-error"><p><strong>%s</strong> %s<br><em>%s</em></p></div>',
			esc_html__( 'Aggiornamento del sito non riuscito.', 'mariani-core' ),
			esc_html__( 'Le modifiche sono salvate, ma il sito pubblico non e stato ricostruito. Avvisa chi cura la manutenzione tecnica.', 'mariani-core' ),
			esc_html(
				sprintf(
					/* translators: 1: data e ora, 2: dettaglio errore */
					__( 'Ultimo tentativo: %1$s — %2$s', 'mariani-core' ),
					isset( $status['time'] ) ? wp_date( 'd/m/Y H:i', (int) $status['time'] ) : '?',
					isset( $status['message'] ) ? (string) $status['message'] : '?'
				)
			)
		);
	}

	/**
	 * Trigger al salvataggio di auto/pagine.
	 *
	 * @param int     $post_id ID del post.
	 * @param WP_Post $post    Oggetto post.
	 */
	public function on_save( int $post_id, WP_Post $post ): void {
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( 'publish' !== $post->post_status ) {
			return;
		}

		$this->dispatch();
	}

	/**
	 * Trigger alla pubblicazione (transizione verso publish).
	 *
	 * @param string  $new_status Nuovo stato.
	 * @param string  $old_status Stato precedente.
	 * @param WP_Post $post       Oggetto post.
	 */
	public function on_transition( string $new_status, string $old_status, WP_Post $post ): void {
		if ( 'publish' !== $new_status || $new_status === $old_status ) {
			return;
		}

		if ( ! in_array( $post->post_type, array( Schema::CPT_AUTO, 'page' ), true ) ) {
			return;
		}

		$this->dispatch();
	}

	/**
	 * Invia il dispatch a GitHub rispettando il debounce.
	 */
	private function dispatch(): void {
		if ( ! $this->is_configured() ) {
			return;
		}

		if ( false !== get_transient( self::DEBOUNCE_KEY ) ) {
			return;
		}

		set_transient( self::DEBOUNCE_KEY, time(), self::DEBOUNCE_SECONDS );

		$repo  = (string) constant( 'MARIANI_GH_REPO' );
		$token = (string) constant( 'MARIANI_GH_TOKEN' );

		// Chiamata bloccante, con timeout corto: l'API di GitHub risponde in
		// poche centinaia di millisecondi e in cambio sappiamo se il deploy e
		// stato accettato. Con "blocking => false" un 403 sarebbe invisibile.
		$response = wp_remote_post(
			'https://api.github.com/repos/' . $repo . '/dispatches',
			array(
				'timeout'  => 8,
				'blocking' => true,
				'headers'  => array(
					'Accept'        => 'application/vnd.github+json',
					'Authorization' => 'Bearer ' . $token,
					'Content-Type'  => 'application/json',
					'User-Agent'    => 'mariani-core/' . MARIANI_CORE_VERSION,
				),
				'body'     => wp_json_encode(
					array(
						'event_type'     => self::EVENT_TYPE,
						'client_payload' => array(
							'source' => 'wordpress',
							'time'   => time(),
						),
					)
				),
			)
		);

		$this->record_outcome( $response );
	}

	/**
	 * Registra l'esito della notifica per poterlo mostrare in bacheca.
	 *
	 * GitHub risponde 204 quando accetta il dispatch: qualunque altra cosa e
	 * un problema da segnalare (token scaduto, permessi revocati, rete giu).
	 *
	 * @param array<string, mixed>|\WP_Error $response Risposta di wp_remote_post.
	 */
	private function record_outcome( $response ): void {
		if ( is_wp_error( $response ) ) {
			$ok      = false;
			$code    = 0;
			$message = $response->get_error_message();
		} else {
			$code    = (int) wp_remote_retrieve_response_code( $response );
			$ok      = 204 === $code;
			$message = $ok
				? __( 'Ricostruzione del sito avviata.', 'mariani-core' )
				: sprintf(
					/* translators: 1: codice HTTP, 2: messaggio restituito da GitHub */
					__( 'GitHub ha risposto %1$d: %2$s', 'mariani-core' ),
					$code,
					wp_remote_retrieve_response_message( $response )
				);
		}

		update_option(
			self::STATUS_OPTION,
			array(
				'ok'      => $ok,
				'code'    => $code,
				'message' => $message,
				'time'    => time(),
			),
			false
		);

		// Un tentativo fallito non deve restare "coperto" dal debounce: cosi il
		// salvataggio successivo riprova subito invece di aspettare due minuti.
		if ( ! $ok ) {
			delete_transient( self::DEBOUNCE_KEY );
		}
	}

	/**
	 * Verifica che le costanti di configurazione siano presenti e valorizzate.
	 */
	private function is_configured(): bool {
		return defined( 'MARIANI_GH_REPO' )
			&& defined( 'MARIANI_GH_TOKEN' )
			&& '' !== (string) constant( 'MARIANI_GH_REPO' )
			&& '' !== (string) constant( 'MARIANI_GH_TOKEN' );
	}
}
