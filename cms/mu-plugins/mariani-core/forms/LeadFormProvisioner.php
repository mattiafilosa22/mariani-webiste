<?php
/**
 * Provisioning idempotente del form Fluent Forms "Richieste Mariani".
 *
 * Costruisce la definizione del form (campi del lead + notifica email) e ne
 * garantisce l'esistenza salvando l'ID in un'option. La creazione avviene una
 * sola volta: se l'option punta a un form ancora esistente non fa nulla.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Forms;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Crea (una tantum) e mantiene il form dei lead in Fluent Forms.
 */
final class LeadFormProvisioner {

	/**
	 * Option che memorizza l'ID del form Fluent Forms dei lead.
	 *
	 * @var string
	 */
	public const OPTION_FORM_ID = 'mariani_ff_form_id';

	/**
	 * Titolo del form generato.
	 *
	 * @var string
	 */
	private const FORM_TITLE = 'Richieste Mariani';

	/**
	 * Email destinataria di default delle notifiche.
	 *
	 * @var string
	 */
	private const DEFAULT_RECIPIENT = 'info@marianiford.it';

	/**
	 * Gateway verso Fluent Forms.
	 *
	 * @var FluentFormsGateway
	 */
	private FluentFormsGateway $gateway;

	/**
	 * Inietta il gateway.
	 *
	 * @param FluentFormsGateway $gateway Gateway Fluent Forms.
	 */
	public function __construct( FluentFormsGateway $gateway ) {
		$this->gateway = $gateway;
	}

	/**
	 * Restituisce l'ID del form garantendone l'esistenza (crea se assente).
	 *
	 * @return int ID del form, oppure 0 se Fluent Forms non e disponibile.
	 */
	public function ensure_form(): int {
		if ( ! $this->gateway->is_available() ) {
			return 0;
		}

		$stored = (int) get_option( self::OPTION_FORM_ID, 0 );

		if ( $stored > 0 && $this->gateway->form_exists( $stored ) ) {
			return $stored;
		}

		$form_id = $this->gateway->create_form( $this->attributes(), $this->metas() );

		if ( $form_id instanceof WP_Error ) {
			return 0;
		}

		update_option( self::OPTION_FORM_ID, $form_id, false );

		return $form_id;
	}

	/**
	 * Attributi del form (title + struttura campi serializzata).
	 *
	 * @return array<string,mixed>
	 */
	private function attributes(): array {
		$now = current_time( 'mysql' );

		return array(
			'title'       => self::FORM_TITLE,
			'status'      => 'published',
			'form_fields' => (string) wp_json_encode( $this->form_fields() ),
			'type'        => 'form',
			'has_payment' => 0,
			'created_by'  => get_current_user_id(),
			'created_at'  => $now,
			'updated_at'  => $now,
		);
	}

	/**
	 * Meta del form: impostazioni base + feed di notifica email.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	private function metas(): array {
		return array(
			'formSettings'         => $this->form_settings(),
			'notifications'        => $this->notification(),
			'_primary_email_field' => 'email',
		);
	}

	/**
	 * Struttura dei campi del form: rispecchia i dati del lead.
	 *
	 * @return array<string,mixed>
	 */
	private function form_fields(): array {
		return array(
			'fields'       => array(
				$this->text_field( 'nome', __( 'Nome', 'mariani-core' ), true ),
				$this->text_field( 'cognome', __( 'Cognome', 'mariani-core' ), false ),
				$this->email_field(),
				$this->text_field( 'telefono', __( 'Telefono', 'mariani-core' ), false ),
				$this->text_field( 'tipo', __( 'Tipo richiesta', 'mariani-core' ), false ),
				$this->text_field( 'fonte', __( 'Fonte / Auto', 'mariani-core' ), false ),
				$this->textarea_field( 'messaggio', __( 'Messaggio', 'mariani-core' ), true ),
				$this->text_field( 'consenso', __( 'Consenso trattamento dati', 'mariani-core' ), false ),
			),
			'submitButton' => $this->submit_button(),
		);
	}

	/**
	 * Campo di testo a riga singola.
	 *
	 * @param string $name     Attributo name (chiave dell'entry).
	 * @param string $label    Etichetta visibile.
	 * @param bool   $required Se il campo e obbligatorio.
	 * @return array<string,mixed>
	 */
	private function text_field( string $name, string $label, bool $required ): array {
		return array(
			'element'        => 'input_text',
			'attributes'     => array(
				'type'  => 'text',
				'name'  => $name,
				'value' => '',
			),
			'settings'       => array(
				'container_class'    => '',
				'label'              => $label,
				'admin_field_label'  => $label,
				'validation_rules'   => $this->rules( $required ),
				'conditional_logics' => array(),
			),
			'editor_options' => array(
				'title'    => $label,
				'template' => 'inputText',
			),
		);
	}

	/**
	 * Campo email con validazione dedicata.
	 *
	 * @return array<string,mixed>
	 */
	private function email_field(): array {
		$rules          = $this->rules( true );
		$rules['email'] = array(
			'value'   => true,
			'message' => __( 'Indirizzo email non valido.', 'mariani-core' ),
			'global'  => true,
		);

		return array(
			'element'        => 'input_email',
			'attributes'     => array(
				'type'  => 'email',
				'name'  => 'email',
				'value' => '',
			),
			'settings'       => array(
				'container_class'    => '',
				'label'              => __( 'Email', 'mariani-core' ),
				'admin_field_label'  => __( 'Email', 'mariani-core' ),
				'validation_rules'   => $rules,
				'conditional_logics' => array(),
			),
			'editor_options' => array(
				'title'    => __( 'Email', 'mariani-core' ),
				'template' => 'inputText',
			),
		);
	}

	/**
	 * Campo testo multiriga.
	 *
	 * @param string $name     Attributo name.
	 * @param string $label    Etichetta.
	 * @param bool   $required Se obbligatorio.
	 * @return array<string,mixed>
	 */
	private function textarea_field( string $name, string $label, bool $required ): array {
		return array(
			'element'        => 'textarea',
			'attributes'     => array(
				'name'  => $name,
				'value' => '',
				'rows'  => 4,
				'cols'  => 2,
			),
			'settings'       => array(
				'container_class'    => '',
				'label'              => $label,
				'admin_field_label'  => $label,
				'validation_rules'   => $this->rules( $required ),
				'conditional_logics' => array(),
			),
			'editor_options' => array(
				'title'    => $label,
				'template' => 'inputTextarea',
			),
		);
	}

	/**
	 * Pulsante di invio standard.
	 *
	 * @return array<string,mixed>
	 */
	private function submit_button(): array {
		return array(
			'uniqElKey'      => 'el_mariani_submit',
			'element'        => 'button',
			'attributes'     => array(
				'type'  => 'submit',
				'class' => '',
			),
			'settings'       => array(
				'align'        => 'left',
				'button_style' => 'default',
				'button_size'  => 'md',
				'color'        => '#ffffff',
				'button_ui'    => array(
					'type' => 'default',
					'text' => __( 'Invia', 'mariani-core' ),
				),
			),
			'editor_options' => array(
				'title' => __( 'Invia', 'mariani-core' ),
			),
		);
	}

	/**
	 * Regole di validazione: solo "required" opzionale (la validazione forte
	 * e gia svolta dal controller REST /lead).
	 *
	 * @param bool $required Se il campo e obbligatorio.
	 * @return array<string,array<string,mixed>>
	 */
	private function rules( bool $required ): array {
		return array(
			'required' => array(
				'value'   => $required,
				'message' => __( 'Campo obbligatorio.', 'mariani-core' ),
				'global'  => true,
			),
		);
	}

	/**
	 * Impostazioni minime del form (conferma + layout).
	 *
	 * @return array<string,mixed>
	 */
	private function form_settings(): array {
		return array(
			'confirmation' => array(
				'redirectTo'           => 'samePage',
				'messageToShow'        => __( 'Richiesta registrata.', 'mariani-core' ),
				'samePageFormBehavior' => 'hide_form',
			),
			'layout'       => array(
				'labelPlacement'        => 'top',
				'helpMessagePlacement'  => 'with_label',
				'errorMessagePlacement' => 'inline',
			),
		);
	}

	/**
	 * Feed di notifica email: unica sorgente di notifica per i lead.
	 *
	 * @return array<string,mixed>
	 */
	private function notification(): array {
		return array(
			'name'         => __( 'Notifica Richieste Mariani', 'mariani-core' ),
			'sendTo'       => array(
				'type'    => 'email',
				'email'   => $this->recipient(),
				'field'   => 'email',
				'routing' => array(),
			),
			'fromName'     => '',
			'fromEmail'    => '',
			'replyTo'      => '{inputs.email}',
			'bcc'          => '',
			'subject'      => __( 'Nuova richiesta', 'mariani-core' ) . ': {inputs.tipo} - {inputs.fonte}',
			'message'      => '<p>{all_data}</p>',
			'conditionals' => array(
				'status'     => false,
				'type'       => 'all',
				'conditions' => array(),
			),
			'enabled'      => true,
		);
	}

	/**
	 * Email destinataria delle notifiche, filtrabile.
	 */
	private function recipient(): string {
		/**
		 * Filtra l'email destinataria delle notifiche Fluent Forms dei lead.
		 *
		 * @param string $recipient Email di destinazione.
		 */
		$recipient = apply_filters( 'mariani_ff_notification_email', self::DEFAULT_RECIPIENT );

		$sanitized = is_string( $recipient ) ? sanitize_email( $recipient ) : '';

		return '' !== $sanitized ? $sanitized : self::DEFAULT_RECIPIENT;
	}
}
