<?php
/**
 * Presenter: trasforma la pagina impostazioni nel DTO SiteSettings del front-end.
 *
 * Il contratto canonico e lo schema zod in web/src/domain/settings.ts.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Presenters;

use Mariani\Core\Rest\Support\MetaReader;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Costruisce anagrafica, contatti, orari e social globali del sito.
 */
final class SettingsPresenter {

	/**
	 * Trasforma la pagina impostazioni (o null) in un DTO SiteSettings valido.
	 *
	 * @param WP_Post|null $post Pagina impostazioni oppure null.
	 * @return array<string,mixed>
	 */
	public function to_dto( ?WP_Post $post ): array {
		if ( null === $post ) {
			return $this->empty_dto();
		}

		$meta     = new MetaReader( $post->ID );
		$whatsapp = $meta->string( 'mariani_set_whatsapp' );

		$dto = array(
			'nomeAzienda'    => $this->fallback( $meta->string( 'mariani_set_nome_azienda' ), 'Mariani' ),
			'ragioneSociale' => $this->fallback( $meta->string( 'mariani_set_ragione_sociale' ), 'Mariani' ),
			'partitaIva'     => $this->fallback( $meta->string( 'mariani_set_piva' ), '-' ),
			'indirizzo'      => $this->fallback( $meta->string( 'mariani_set_indirizzo' ), '-' ),
			'telefono'       => $this->fallback( $meta->string( 'mariani_set_tel_vendita' ), '-' ),
			'whatsapp'       => $this->fallback( $whatsapp, '-' ),
			'email'          => $this->fallback( $meta->string( 'mariani_set_email' ), 'info@example.com' ),
			'orari'          => $this->orari( $meta->string( 'mariani_set_orari_vendita' ) ),
			'orariOfficina'  => $this->orari( $meta->string( 'mariani_set_orari_officina' ) ),
			'social'         => $this->social( $meta, $whatsapp ),
		);

		$assistenza = $meta->string( 'mariani_set_tel_assistenza' );
		if ( '' !== $assistenza ) {
			$dto['telefonoAssistenza'] = $assistenza;
		}

		$maps_url = $meta->string( 'mariani_set_maps_url' );
		if ( '' !== $maps_url ) {
			$dto['mapsUrl'] = $maps_url;
		}

		$mappa = $this->mappa( $meta );
		if ( null !== $mappa ) {
			$dto['mappa'] = $mappa;
		}

		return $dto;
	}

	/**
	 * Coordinate mappa { lat, lng } se entrambe valorizzate e numeriche.
	 *
	 * @param MetaReader $meta Lettore meta.
	 * @return array<string,float>|null
	 */
	private function mappa( MetaReader $meta ): ?array {
		$lat = $meta->string( 'mariani_set_map_lat' );
		$lng = $meta->string( 'mariani_set_map_lng' );

		if ( ! is_numeric( $lat ) || ! is_numeric( $lng ) ) {
			return null;
		}

		return array(
			'lat' => (float) $lat,
			'lng' => (float) $lng,
		);
	}

	/**
	 * Converte l'orario multi-riga in una lista { giorni, apertura }.
	 *
	 * Ogni riga ha forma "Giorni: Apertura"; lo split avviene sul primo ":".
	 *
	 * @param string $raw Testo orari (una fascia per riga).
	 * @return array<int,array<string,string>>
	 */
	private function orari( string $raw ): array {
		if ( '' === trim( $raw ) ) {
			return array();
		}

		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		$lines = is_array( $lines ) ? $lines : array();
		$orari = array();

		foreach ( $lines as $line ) {
			$line = trim( (string) $line );

			if ( '' === $line ) {
				continue;
			}

			$parts    = explode( ':', $line, 2 );
			$giorni   = trim( $parts[0] );
			$apertura = isset( $parts[1] ) ? trim( $parts[1] ) : '';

			if ( '' === $giorni ) {
				continue;
			}

			$orari[] = array(
				'giorni'   => $giorni,
				'apertura' => $apertura,
			);
		}

		return $orari;
	}

	/**
	 * Blocco social: include solo i canali valorizzati.
	 *
	 * @param MetaReader $meta     Lettore meta.
	 * @param string     $whatsapp Numero WhatsApp internazionale (senza +).
	 * @return array<string,string>
	 */
	private function social( MetaReader $meta, string $whatsapp ): array {
		$social    = array();
		$facebook  = $meta->string( 'mariani_set_facebook' );
		$instagram = $meta->string( 'mariani_set_instagram' );

		if ( '' !== $facebook ) {
			$social['facebook'] = $facebook;
		}

		if ( '' !== $instagram ) {
			$social['instagram'] = $instagram;
		}

		if ( '' !== $whatsapp ) {
			$social['whatsapp'] = 'https://wa.me/' . preg_replace( '/\D+/', '', $whatsapp );
		}

		return $social;
	}

	/**
	 * Restituisce il valore se non vuoto, altrimenti il fallback indicato.
	 *
	 * @param string $value    Valore letto.
	 * @param string $fallback Valore di riserva.
	 */
	private function fallback( string $value, string $fallback ): string {
		return '' !== trim( $value ) ? $value : $fallback;
	}

	/**
	 * DTO minimo ma valido quando la pagina impostazioni non esiste ancora.
	 *
	 * @return array<string,mixed>
	 */
	private function empty_dto(): array {
		return array(
			'nomeAzienda'    => 'Mariani',
			'ragioneSociale' => 'Mariani',
			'partitaIva'     => '-',
			'indirizzo'      => '-',
			'telefono'       => '-',
			'whatsapp'       => '-',
			'email'          => 'info@example.com',
			'orari'          => array(),
			'orariOfficina'  => array(),
			'social'         => array(),
		);
	}
}
