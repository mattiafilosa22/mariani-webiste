<?php
/**
 * Popola il CPT "auto" con i veicoli di demo, in italiano e inglese.
 *
 * Idempotente: ogni variante linguistica e ritrovata tramite la sua impronta
 * seeder e aggiornata al posto di essere duplicata.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed;

use Mariani\Core\Seed\Data\Catalog;
use Mariani\Core\Seed\Support\MediaLibrary;
use Mariani\Core\Seed\Support\SeedMeta;
use Mariani\Core\Support\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Crea/aggiorna le auto e ne collega le traduzioni via Polylang.
 */
final class AutoSeeder {

	/**
	 * Servizio multilingua.
	 *
	 * @var LanguageSeeder
	 */
	private LanguageSeeder $language;

	/**
	 * Inietta il servizio multilingua.
	 *
	 * @param LanguageSeeder $language Servizio multilingua.
	 */
	public function __construct( LanguageSeeder $language ) {
		$this->language = $language;
	}

	/**
	 * Seeda tutte le auto del catalogo collegando le traduzioni.
	 *
	 * @param MediaLibrary $media_library Libreria immagini seedata.
	 * @return int Numero di auto (record base) processate.
	 */
	public function seed( MediaLibrary $media_library ): int {
		$count = 0;

		foreach ( Catalog::autos() as $record ) {
			$this->seed_record( $record, $media_library );
			++$count;
		}

		return $count;
	}

	/**
	 * Elimina tutte le auto generate dal seeder (usato con --fresh).
	 *
	 * @return int Numero di auto eliminate.
	 */
	public function purge(): int {
		$deleted = 0;

		foreach ( SeedMeta::all_of_type( Schema::CPT_AUTO ) as $post_id ) {
			if ( wp_delete_post( $post_id, true ) ) {
				++$deleted;
			}
		}

		return $deleted;
	}

	/**
	 * Seeda un singolo record (IT + EN) e collega le traduzioni.
	 *
	 * @param array<string,mixed> $record        Dati del veicolo.
	 * @param MediaLibrary        $media_library Libreria immagini seedata.
	 */
	private function seed_record( array $record, MediaLibrary $media_library ): void {
		$default = $this->language->default_language();

		$translations = array(
			$default => $this->upsert( $record, $default, $media_library ),
		);

		if ( $this->language->is_active() ) {
			foreach ( $this->language->secondary_languages() as $lang ) {
				$translations[ $lang ] = $this->upsert( $record, $lang, $media_library );
			}

			$this->language->link( $translations );
		}
	}

	/**
	 * Crea o aggiorna la variante linguistica di un'auto.
	 *
	 * @param array<string,mixed> $record        Dati del veicolo.
	 * @param string              $lang          Slug lingua.
	 * @param MediaLibrary        $media_library Libreria immagini seedata.
	 * @return int ID del post.
	 */
	private function upsert( array $record, string $lang, MediaLibrary $media_library ): int {
		$ref      = 'auto:' . $record['ref'] . ':' . $lang;
		$existing = SeedMeta::find( $ref );
		$content  = $this->localized( $record, $lang, 'content', (string) $record['content'] );

		$postarr = array(
			'post_type'    => Schema::CPT_AUTO,
			'post_status'  => 'publish',
			'post_title'   => (string) $record['title'],
			'post_content' => $content,
			'post_name'    => (string) $record['ref'],
		);

		if ( null !== $existing ) {
			$postarr['ID'] = $existing;
			wp_update_post( $postarr );
			$post_id = $existing;
		} else {
			$post_id = (int) wp_insert_post( $postarr, true );
		}

		if ( $post_id <= 0 ) {
			return 0;
		}

		$this->language->assign( $post_id, $lang );
		$this->normalize_slug( $post_id, (string) $record['ref'] );
		$this->assign_terms( $post_id, $record );
		$this->write_meta( $post_id, $record, $lang );
		$this->write_gallery( $post_id, $record, $media_library );
		SeedMeta::mark( $post_id, $ref );

		return $post_id;
	}

	/**
	 * Reimposta lo slug canonico (Polylang consente slug uguali per lingua).
	 *
	 * @param int    $post_id ID del post.
	 * @param string $slug    Slug desiderato.
	 */
	private function normalize_slug( int $post_id, string $slug ): void {
		$post = get_post( $post_id );

		if ( $post instanceof \WP_Post && $post->post_name !== $slug ) {
			wp_update_post(
				array(
					'ID'        => $post_id,
					'post_name' => $slug,
				)
			);
		}
	}

	/**
	 * Assegna marca, modello, carrozzeria e alimentazione.
	 *
	 * @param int                 $post_id ID del post.
	 * @param array<string,mixed> $record  Dati del veicolo.
	 */
	private function assign_terms( int $post_id, array $record ): void {
		$map = array(
			Schema::TAX_MARCA         => (string) $record['marca'],
			Schema::TAX_MODELLO       => (string) $record['modello'],
			Schema::TAX_CARROZZERIA   => (string) $record['carrozzeria'],
			Schema::TAX_ALIMENTAZIONE => (string) $record['alimentazione'],
		);

		foreach ( $map as $taxonomy => $slug ) {
			$term = get_term_by( 'slug', $slug, $taxonomy );

			if ( $term instanceof \WP_Term ) {
				wp_set_object_terms( $post_id, array( $term->term_id ), $taxonomy, false );
			}
		}
	}

	/**
	 * Scrive tutte le meta del veicolo per la lingua indicata.
	 *
	 * @param int                 $post_id ID del post.
	 * @param array<string,mixed> $record  Dati del veicolo.
	 * @param string              $lang    Slug lingua.
	 */
	private function write_meta( int $post_id, array $record, string $lang ): void {
		$potenza_kw = null !== $record['potenza_cv'] ? (int) round( ( (int) $record['potenza_cv'] ) * 0.7355 ) : null;

		$values = array(
			'tipo_veicolo'          => (string) $record['tipo'],
			'categoria'             => (string) $record['categoria'],
			'versione'              => (string) $record['versione'],
			'anno_immatricolazione' => (string) $record['anno'],
			'km'                    => (int) $record['km'],
			'cambio'                => (string) $record['cambio'],
			'trazione'              => (string) $record['trazione'],
			'prezzo_listino'        => (int) $record['listino'],
			'sconto'                => (int) $record['sconto'],
			'prezzo_promo'          => $record['promo'],
			'data_scadenza_offerta' => (string) $record['scadenza'],
			'in_evidenza'           => $this->flag( (bool) $record['in_evidenza'] ),
			'pronta_consegna'       => $this->flag( (bool) $record['pronta'] ),
			'neopatentati'          => $this->flag( (bool) $record['neopatentati'] ),
			'garanzia'              => $this->localized( $record, $lang, 'garanzia', (string) $record['garanzia'] ),
			'cilindrata'            => $record['cilindrata'],
			'potenza_cv'            => $record['potenza_cv'],
			'potenza_kw'            => $potenza_kw,
			'co2'                   => $record['co2'],
			'consumo_wltp'          => $record['consumo_wltp'],
			'autonomia_elettrica'   => $record['autonomia'],
			'classe_emissioni'      => (string) $record['classe'],
			'posti'                 => $record['posti'],
			'porte'                 => $record['porte'],
			'colore_esterno'        => $this->localized( $record, $lang, 'colore_est', (string) $record['colore_est'] ),
			'colore_esterno_hex'    => (string) $record['colore_hex'],
			'colore_interni'        => $this->localized( $record, $lang, 'colore_int', (string) $record['colore_int'] ),
			'dotazioni_serie'       => $this->lines( $this->localized_list( $record, $lang, 'dotazioni' ) ),
			'optional'              => $this->lines( $this->localized_list( $record, $lang, 'optional' ) ),
		);

		foreach ( $values as $key => $value ) {
			$this->set_meta( $post_id, Schema::meta( $key ), $value );
		}

		$this->write_commercial( $post_id, $record );
	}

	/**
	 * Scrive le meta dedicate ai veicoli commerciali (o le rimuove).
	 *
	 * @param int                 $post_id ID del post.
	 * @param array<string,mixed> $record  Dati del veicolo.
	 */
	private function write_commercial( int $post_id, array $record ): void {
		$keys = array( 'tipo_carrozzeria_comm', 'dimensione', 'portata_kg', 'volume_carico_m3', 'posti_cabina' );

		$commercial = is_array( $record['commerciale'] ) ? $record['commerciale'] : array();

		foreach ( $keys as $key ) {
			$this->set_meta( $post_id, Schema::meta( $key ), $commercial[ $key ] ?? null );
		}
	}

	/**
	 * Sostituisce la galleria con le foto reali del veicolo (o il segnaposto).
	 *
	 * @param int                 $post_id       ID del post.
	 * @param array<string,mixed> $record        Dati del veicolo.
	 * @param MediaLibrary        $media_library Libreria immagini seedata.
	 */
	private function write_gallery( int $post_id, array $record, MediaLibrary $media_library ): void {
		$key = Schema::meta( 'galleria' );
		delete_post_meta( $post_id, $key );

		$attachments = $media_library->gallery( (string) $record['ref'] );

		if ( array() === $attachments ) {
			$fallback    = $media_library->placeholder( 'esterno-fronte' );
			$attachments = null === $fallback ? array() : array( $fallback );
		}

		$first = null;

		foreach ( $attachments as $attachment_id ) {
			$attachment_id = (int) $attachment_id;
			add_post_meta( $post_id, $key, $attachment_id );
			$first ??= $attachment_id;
		}

		if ( null !== $first ) {
			set_post_thumbnail( $post_id, $first );
		}
	}

	/**
	 * Aggiorna una meta, oppure la elimina se il valore e nullo o stringa vuota.
	 *
	 * @param int    $post_id ID del post.
	 * @param string $key     Meta key completa.
	 * @param mixed  $value   Valore da scrivere.
	 */
	private function set_meta( int $post_id, string $key, $value ): void {
		if ( null === $value || '' === $value ) {
			delete_post_meta( $post_id, $key );

			return;
		}

		update_post_meta( $post_id, $key, $value );
	}

	/**
	 * Converte una lista di stringhe nel formato multi-riga atteso dalle textarea.
	 *
	 * @param string[] $items Voci.
	 */
	private function lines( array $items ): string {
		return implode( "\n", $items );
	}

	/**
	 * Rappresentazione di un flag checkbox Meta Box.
	 *
	 * @param bool $on Stato del flag.
	 */
	private function flag( bool $on ): string {
		return $on ? '1' : '0';
	}

	/**
	 * Restituisce il valore localizzato (override EN) o il default IT.
	 *
	 * @param array<string,mixed> $record   Dati del veicolo.
	 * @param string              $lang     Slug lingua.
	 * @param string              $key      Chiave override.
	 * @param string              $fallback Valore di default (IT).
	 */
	private function localized( array $record, string $lang, string $key, string $fallback ): string {
		if ( 'en' === $lang && isset( $record['en'][ $key ] ) && is_string( $record['en'][ $key ] ) ) {
			return (string) $record['en'][ $key ];
		}

		return $fallback;
	}

	/**
	 * Restituisce la lista localizzata (override EN) o quella di default IT.
	 *
	 * @param array<string,mixed> $record Dati del veicolo.
	 * @param string              $lang   Slug lingua.
	 * @param string              $key    Chiave (dotazioni|optional).
	 * @return string[]
	 */
	private function localized_list( array $record, string $lang, string $key ): array {
		if ( 'en' === $lang && isset( $record['en'][ $key ] ) && is_array( $record['en'][ $key ] ) ) {
			return array_map( 'strval', $record['en'][ $key ] );
		}

		$base = is_array( $record[ $key ] ) ? $record[ $key ] : array();

		return array_map( 'strval', $base );
	}
}
