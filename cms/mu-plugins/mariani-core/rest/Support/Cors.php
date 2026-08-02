<?php
/**
 * Whitelist delle origini autorizzate a chiamare la REST API da browser.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Support;

use Mariani\Core\Module;

defined( 'ABSPATH' ) || exit;

/**
 * Abilita il CORS per il frontend headless.
 *
 * Il frontend statico vive su un host diverso dal CMS (es. mariani-auto.it
 * contro cms.mariani-auto.it): senza whitelist il browser blocca il POST del
 * form contatti verso /lead. Le origini si dichiarano nella costante
 * MARIANI_ALLOWED_ORIGINS di wp-config.php (mai in repo): estendendo il filtro
 * allowed_http_origins e WordPress stesso a emettere gli header
 * Access-Control-* e a gestire la preflight OPTIONS.
 *
 * Nessun wildcard: un "*" su un endpoint che scrive lead aprirebbe la porta
 * allo spam cross-site.
 */
final class Cors implements Module {

	/**
	 * Costante di wp-config.php con le origini separate da virgola.
	 *
	 * @var string
	 */
	private const CONFIG_CONSTANT = 'MARIANI_ALLOWED_ORIGINS';

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_filter( 'allowed_http_origins', array( $this, 'filter_allowed_origins' ) );
	}

	/**
	 * Aggiunge le origini configurate a quelle riconosciute da WordPress.
	 *
	 * @param string[] $origins Origini gia consentite.
	 * @return string[]
	 */
	public function filter_allowed_origins( array $origins ): array {
		return array_values( array_unique( array_merge( $origins, $this->configured_origins() ) ) );
	}

	/**
	 * Legge e normalizza le origini dichiarate in configurazione.
	 *
	 * @return string[]
	 */
	private function configured_origins(): array {
		if ( ! defined( self::CONFIG_CONSTANT ) ) {
			return array();
		}

		$raw = constant( self::CONFIG_CONSTANT );

		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return array();
		}

		$origins = array();

		foreach ( explode( ',', $raw ) as $candidate ) {
			$origin = $this->normalize( $candidate );

			if ( null !== $origin ) {
				$origins[] = $origin;
			}
		}

		return $origins;
	}

	/**
	 * Riduce un URL alla forma "schema://host[:porta]" usata da get_http_origin().
	 *
	 * @param string $candidate Valore grezzo da configurazione.
	 * @return string|null Origine normalizzata, null se non valida.
	 */
	private function normalize( string $candidate ): ?string {
		$parts = wp_parse_url( trim( $candidate ) );

		if ( ! is_array( $parts ) || empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			return null;
		}

		$origin = strtolower( $parts['scheme'] ) . '://' . strtolower( $parts['host'] );

		if ( ! empty( $parts['port'] ) ) {
			$origin .= ':' . (int) $parts['port'];
		}

		return $origin;
	}
}
