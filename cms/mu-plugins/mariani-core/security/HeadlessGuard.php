<?php
/**
 * Chiude il frontend pubblico del CMS: resta solo back-office e API.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Security;

use Mariani\Core\Module;

defined( 'ABSPATH' ) || exit;

/**
 * Impedisce la navigazione del sito WordPress su cms.<dominio>.
 *
 * In un'architettura headless il tema di WordPress non e mai il sito pubblico:
 * lasciarlo raggiungibile significa esporre pagine duplicate (danno SEO),
 * l'anagrafica degli autori e una superficie di attacco inutile. Qui ogni
 * richiesta di frontend viene rimandata al sito vero; restano raggiungibili
 * wp-admin, il login, la REST API, wp-cron e i file caricati.
 *
 * L'URL del sito pubblico si dichiara in wp-config.php con MARIANI_SITE_URL;
 * senza costante la richiesta riceve un 403, mai una pagina renderizzata.
 */
final class HeadlessGuard implements Module {

	/**
	 * Costante di wp-config.php con l'URL del sito pubblico.
	 *
	 * @var string
	 */
	private const SITE_URL_CONSTANT = 'MARIANI_SITE_URL';

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'template_redirect', array( $this, 'block_frontend' ), 0 );
		add_action( 'send_headers', array( $this, 'send_noindex_header' ) );
		add_filter( 'robots_txt', array( $this, 'filter_robots' ), 10, 1 );
		add_filter( 'allowed_redirect_hosts', array( $this, 'allow_site_host' ) );
	}

	/**
	 * Autorizza il sito pubblico come destinazione di wp_safe_redirect().
	 *
	 * Senza questo, WordPress considera esterno l'host del frontend e ripiega
	 * su wp-admin: il visitatore finirebbe sulla schermata di login invece che
	 * sul sito.
	 *
	 * @param string[] $hosts Host gia consentiti.
	 * @return string[]
	 */
	public function allow_site_host( array $hosts ): array {
		$site_url = $this->public_site_url();

		if ( null === $site_url ) {
			return $hosts;
		}

		$host = wp_parse_url( $site_url, PHP_URL_HOST );

		if ( ! is_string( $host ) || '' === $host ) {
			return $hosts;
		}

		$hosts[] = $host;

		return array_values( array_unique( $hosts ) );
	}

	/**
	 * Devia ogni richiesta di frontend verso il sito pubblico.
	 */
	public function block_frontend(): void {
		if ( $this->is_allowed_request() ) {
			return;
		}

		$site_url = $this->public_site_url();

		if ( null === $site_url ) {
			wp_die(
				esc_html__( 'Questo indirizzo ospita solo il back-office.', 'mariani-core' ),
				esc_html__( 'Accesso non disponibile', 'mariani-core' ),
				array( 'response' => 403 )
			);
		}

		wp_safe_redirect( $site_url, 302 );
		exit;
	}

	/**
	 * Marca l'intero host come non indicizzabile.
	 */
	public function send_noindex_header(): void {
		if ( headers_sent() ) {
			return;
		}

		header( 'X-Robots-Tag: noindex, nofollow', true );
	}

	/**
	 * Sostituisce il robots.txt con un divieto totale.
	 *
	 * @param string $output Contenuto generato da WordPress.
	 * @return string
	 */
	public function filter_robots( $output ): string {
		unset( $output );

		return "User-agent: *\nDisallow: /\n";
	}

	/**
	 * Stabilisce se la richiesta corrente deve poter proseguire.
	 *
	 * Back-office, login, REST API, cron e AJAX restano sempre disponibili:
	 * sono i canali su cui il CMS lavora davvero.
	 */
	private function is_allowed_request(): bool {
		return is_admin()
			|| ( defined( 'REST_REQUEST' ) && REST_REQUEST )
			|| ( defined( 'DOING_CRON' ) && DOING_CRON )
			|| ( defined( 'DOING_AJAX' ) && DOING_AJAX )
			|| ( defined( 'WP_CLI' ) && WP_CLI )
			|| is_user_logged_in()
			|| $this->is_login_page();
	}

	/**
	 * Riconosce le pagine di login/registrazione servite da wp-login.php.
	 */
	private function is_login_page(): bool {
		$script = isset( $_SERVER['SCRIPT_NAME'] )
			? sanitize_text_field( wp_unslash( $_SERVER['SCRIPT_NAME'] ) )
			: '';

		return '' !== $script && in_array(
			basename( $script ),
			array( 'wp-login.php', 'wp-register.php', 'wp-signup.php' ),
			true
		);
	}

	/**
	 * URL del sito pubblico verso cui deviare, se configurato.
	 */
	private function public_site_url(): ?string {
		if ( ! defined( self::SITE_URL_CONSTANT ) ) {
			return null;
		}

		$value = constant( self::SITE_URL_CONSTANT );

		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return null;
		}

		$url = esc_url_raw( trim( $value ) );

		return '' === $url ? null : $url;
	}
}
