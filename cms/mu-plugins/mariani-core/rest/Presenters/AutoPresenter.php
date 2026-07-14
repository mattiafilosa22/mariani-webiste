<?php
/**
 * Presenter: trasforma un post "auto" nel DTO atteso dal front-end.
 *
 * Il contratto canonico e quello degli schemi zod in web/src/domain/auto.ts:
 * chiavi camelCase, enum normalizzati, prezzo finale calcolato, badge derivati
 * e immagini nella forma AutoImage (src/srcset/width/height/alt).
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Presenters;

use Mariani\Core\I18n\Language;
use Mariani\Core\Rest\Support\ImageTransformer;
use Mariani\Core\Rest\Support\MetaReader;
use Mariani\Core\Support\Schema;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Costruisce DTO auto conformi al contratto del front-end.
 */
final class AutoPresenter {

	/**
	 * Trasformatore immagini condiviso.
	 *
	 * @var ImageTransformer
	 */
	private ImageTransformer $images;

	/**
	 * Inietta il trasformatore immagini.
	 *
	 * @param ImageTransformer $images Trasformatore immagini.
	 */
	public function __construct( ImageTransformer $images ) {
		$this->images = $images;
	}

	/**
	 * DTO ridotto (AutoSummary) per le liste di catalogo e le card.
	 *
	 * @param WP_Post $post Post auto.
	 * @return array<string,mixed>
	 */
	public function to_summary( WP_Post $post ): array {
		$meta = new MetaReader( $post->ID );

		$tipo          = $this->normalize_tipo( $meta->string( Schema::meta( 'tipo_veicolo' ) ) );
		$alimentazione = $this->normalize_alimentazione( $this->primary_term_slug( $post->ID, Schema::TAX_ALIMENTAZIONE ) );
		$listino       = (float) ( $meta->int_or_null( Schema::meta( 'prezzo_listino' ) ) ?? 0 );
		$sconto        = (float) ( $meta->int_or_null( Schema::meta( 'sconto' ) ) ?? 0 );
		$promo         = $meta->int_or_null( Schema::meta( 'prezzo_promo' ) );
		$finale        = $this->final_price( $listino, $sconto, $promo );
		$scadenza      = $meta->string( Schema::meta( 'data_scadenza_offerta' ) );

		$dto = array(
			'id'            => (string) $post->ID,
			'slug'          => $post->post_name,
			'traduzioni'    => $this->translations( $post ),
			'tipo'          => $tipo,
			'categoria'     => $this->normalize_categoria( $meta->string( Schema::meta( 'categoria' ) ) ),
			'marca'         => $this->primary_term_name( $post->ID, Schema::TAX_MARCA ),
			'modello'       => $this->primary_term_name( $post->ID, Schema::TAX_MODELLO ),
			'versione'      => $meta->string( Schema::meta( 'versione' ) ),
			'anno'          => $this->year_from_date( $meta->string( Schema::meta( 'anno_immatricolazione' ) ) ),
			'km'            => max( 0, (int) ( $meta->int_or_null( Schema::meta( 'km' ) ) ?? 0 ) ),
			'prezzoListino' => $listino,
			'prezzoFinale'  => $finale,
			'alimentazione' => $alimentazione,
			'cambio'        => $this->normalize_cambio( $meta->string( Schema::meta( 'cambio' ) ) ),
			'trazione'      => $this->normalize_trazione( $meta->string( Schema::meta( 'trazione' ) ) ),
			'carrozzeria'   => $this->primary_term_name( $post->ID, Schema::TAX_CARROZZERIA ),
			'potenzaCv'     => $this->non_negative_int( $meta->int_or_null( Schema::meta( 'potenza_cv' ) ) ),
			'colore'        => $this->normalize_colore( $meta->string( Schema::meta( 'colore_esterno' ) ) ),
			'badge'         => $this->badges( $meta, $tipo, $alimentazione, $finale < $listino ),
			'inEvidenza'    => $meta->bool( Schema::meta( 'in_evidenza' ) ),
			'copertina'     => $this->cover( $post->ID, $meta ),
		);

		if ( $sconto > 0.0 ) {
			$dto['sconto'] = $sconto;
		}

		if ( '' !== $scadenza ) {
			$dto['scadenzaOfferta'] = $scadenza;
		}

		return $dto;
	}

	/**
	 * DTO completo (Auto) per la scheda dettaglio.
	 *
	 * @param WP_Post $post Post auto.
	 * @return array<string,mixed>
	 */
	public function to_detail( WP_Post $post ): array {
		$meta = new MetaReader( $post->ID );
		$dto  = $this->to_summary( $post );

		$galleria = $this->images->to_front_many( $meta->attachment_ids( Schema::meta( 'galleria' ) ) );

		if ( array() === $galleria && isset( $dto['copertina'] ) ) {
			$galleria = array( $dto['copertina'] );
		}

		$dto['galleria']   = $galleria;
		$dto['dotazioni']  = $meta->string_list( Schema::meta( 'dotazioni_serie' ) );
		$dto['optional']   = $meta->string_list( Schema::meta( 'optional' ) );
		$dto['specifiche'] = $this->specifiche( $post->ID, $meta );

		return $dto;
	}

	/**
	 * Prezzo finale: promo se valorizzata, altrimenti listino meno sconto.
	 *
	 * @param float    $listino Prezzo di listino.
	 * @param float    $sconto  Sconto in euro.
	 * @param int|null $promo   Prezzo promozionale, se presente.
	 */
	private function final_price( float $listino, float $sconto, ?int $promo ): float {
		if ( null !== $promo && $promo > 0 ) {
			return (float) $promo;
		}

		return max( 0.0, $listino - $sconto );
	}

	/**
	 * Mappa delle traduzioni Polylang: codice lingua => slug reale del post.
	 *
	 * Espone il legame esatto tra le schede IT/EN, cosi il front-end costruisce
	 * hreflang reciproci e language switcher senza euristiche sul contenuto. Se
	 * Polylang non e attivo (o il post non ha traduzioni) ritorna almeno la
	 * lingua corrente del post con il suo slug.
	 *
	 * @param WP_Post $post Post auto.
	 * @return array<string,string>
	 */
	private function translations( WP_Post $post ): array {
		$map = array();

		if ( function_exists( 'pll_get_post_translations' ) ) {
			$translations = pll_get_post_translations( $post->ID );

			if ( is_array( $translations ) ) {
				foreach ( $translations as $lang => $translated_id ) {
					$slug = get_post_field( 'post_name', (int) $translated_id );

					if ( is_string( $slug ) && '' !== $slug ) {
						$map[ (string) $lang ] = $slug;
					}
				}
			}
		}

		if ( array() === $map ) {
			$lang = function_exists( 'pll_get_post_language' )
				? (string) pll_get_post_language( $post->ID )
				: Language::DEFAULT;

			$map[ '' !== $lang ? $lang : Language::DEFAULT ] = $post->post_name;
		}

		return $map;
	}

	/**
	 * Badge derivati da flag e dati del veicolo.
	 *
	 * @param MetaReader $meta          Lettore meta.
	 * @param string     $tipo          Tipo veicolo normalizzato.
	 * @param string     $alimentazione Alimentazione normalizzata.
	 * @param bool       $is_promo      Se il prezzo finale e inferiore al listino.
	 * @return string[]
	 */
	private function badges( MetaReader $meta, string $tipo, string $alimentazione, bool $is_promo ): array {
		$badges = array();

		if ( $meta->bool( Schema::meta( 'pronta_consegna' ) ) ) {
			$badges[] = 'pronta';
		}

		if ( $is_promo ) {
			$badges[] = 'promo';
		}

		if ( 'km0' === $tipo ) {
			$badges[] = 'km0';
		}

		if ( 'ibrido' === $alimentazione ) {
			$badges[] = 'ibrido';
		}

		if ( 'elettrico' === $alimentazione ) {
			$badges[] = 'elettrico';
		}

		if ( $meta->bool( Schema::meta( 'neopatentati' ) ) ) {
			$badges[] = 'neopatentati';
		}

		return $badges;
	}

	/**
	 * Immagine di copertina (AutoImage) dalla galleria o dalla thumbnail.
	 *
	 * @param int        $post_id ID auto.
	 * @param MetaReader $meta    Lettore meta.
	 * @return array<string,mixed>|null
	 */
	private function cover( int $post_id, MetaReader $meta ): ?array {
		$ids = $meta->attachment_ids( Schema::meta( 'galleria' ) );

		if ( array() !== $ids ) {
			$front = $this->images->to_front( (int) $ids[0] );

			if ( null !== $front ) {
				return $front;
			}
		}

		$thumb_id = get_post_thumbnail_id( $post_id );

		return $thumb_id ? $this->images->to_front( (int) $thumb_id ) : null;
	}

	/**
	 * Scheda tecnica sintetica: mappa etichetta => valore (solo stringhe).
	 *
	 * @param int        $post_id ID auto.
	 * @param MetaReader $meta    Lettore meta.
	 * @return array<string,string>
	 */
	private function specifiche( int $post_id, MetaReader $meta ): array {
		$specs = array();

		$this->add_spec( $specs, __( 'Alimentazione', 'mariani-core' ), $this->primary_term_name( $post_id, Schema::TAX_ALIMENTAZIONE ) );
		$this->add_spec( $specs, __( 'Cambio', 'mariani-core' ), $meta->string( Schema::meta( 'cambio' ) ) );
		$this->add_spec( $specs, __( 'Trazione', 'mariani-core' ), $meta->string( Schema::meta( 'trazione' ) ) );

		$cilindrata = $meta->int_or_null( Schema::meta( 'cilindrata' ) );
		if ( null !== $cilindrata && $cilindrata > 0 ) {
			$this->add_spec( $specs, __( 'Cilindrata', 'mariani-core' ), $cilindrata . ' cm³' );
		}

		$potenza = $meta->int_or_null( Schema::meta( 'potenza_cv' ) );
		if ( null !== $potenza && $potenza > 0 ) {
			$this->add_spec( $specs, __( 'Potenza', 'mariani-core' ), $potenza . ' CV' );
		}

		$co2 = $meta->int_or_null( Schema::meta( 'co2' ) );
		if ( null !== $co2 ) {
			$this->add_spec( $specs, __( 'Emissioni CO₂', 'mariani-core' ), $co2 . ' g/km' );
		}

		$consumo = $meta->float_or_null( Schema::meta( 'consumo_wltp' ) );
		if ( null !== $consumo && $consumo > 0.0 ) {
			$this->add_spec( $specs, __( 'Consumo WLTP', 'mariani-core' ), $consumo . ' l/100km' );
		}

		$autonomia = $meta->int_or_null( Schema::meta( 'autonomia_elettrica' ) );
		if ( null !== $autonomia && $autonomia > 0 ) {
			$this->add_spec( $specs, __( 'Autonomia elettrica', 'mariani-core' ), $autonomia . ' km' );
		}

		$posti = $meta->int_or_null( Schema::meta( 'posti' ) );
		if ( null !== $posti && $posti > 0 ) {
			$this->add_spec( $specs, __( 'Posti', 'mariani-core' ), (string) $posti );
		}

		$this->add_spec( $specs, __( 'Colore', 'mariani-core' ), $meta->string( Schema::meta( 'colore_esterno' ) ) );
		$this->add_spec( $specs, __( 'Garanzia', 'mariani-core' ), $meta->string( Schema::meta( 'garanzia' ) ) );

		return $specs;
	}

	/**
	 * Aggiunge una voce di specifica solo se il valore non e vuoto.
	 *
	 * @param array<string,string> $specs Mappa specifiche (per riferimento).
	 * @param string               $label Etichetta.
	 * @param string               $value Valore.
	 */
	private function add_spec( array &$specs, string $label, string $value ): void {
		if ( '' !== trim( $value ) ) {
			$specs[ $label ] = trim( $value );
		}
	}

	/**
	 * Nome del termine primario (o vuoto) di una tassonomia.
	 *
	 * @param int    $post_id  ID auto.
	 * @param string $taxonomy Tassonomia.
	 */
	private function primary_term_name( int $post_id, string $taxonomy ): string {
		$term = $this->primary_term( $post_id, $taxonomy );

		return null === $term ? '' : $term->name;
	}

	/**
	 * Slug del termine primario (o vuoto) di una tassonomia.
	 *
	 * @param int    $post_id  ID auto.
	 * @param string $taxonomy Tassonomia.
	 */
	private function primary_term_slug( int $post_id, string $taxonomy ): string {
		$term = $this->primary_term( $post_id, $taxonomy );

		return null === $term ? '' : $term->slug;
	}

	/**
	 * Primo termine assegnato per la tassonomia (un'auto ha una sola marca/modello).
	 *
	 * @param int    $post_id  ID auto.
	 * @param string $taxonomy Tassonomia.
	 * @return \WP_Term|null
	 */
	private function primary_term( int $post_id, string $taxonomy ): ?\WP_Term {
		$terms = get_the_terms( $post_id, $taxonomy );

		if ( ! is_array( $terms ) || array() === $terms ) {
			return null;
		}

		$first = $terms[0];

		return $first instanceof \WP_Term ? $first : null;
	}

	/**
	 * Estrae l'anno (intero) da una data ISO come "2024-03-01".
	 *
	 * @param string $date Data in formato Y-m-d (o vuota).
	 */
	private function year_from_date( string $date ): int {
		return (int) substr( $date, 0, 4 );
	}

	/**
	 * Intero non negativo per la potenza: 0 = non definito (reso "n.d." dalla UI).
	 *
	 * @param int|null $value Valore letto dalle meta.
	 */
	private function non_negative_int( ?int $value ): int {
		return ( null !== $value && $value > 0 ) ? $value : 0;
	}

	/**
	 * Normalizza il tipo veicolo sull'enum del front-end.
	 *
	 * @param string $value Valore grezzo.
	 */
	private function normalize_tipo( string $value ): string {
		$allowed = array( 'nuova', 'usata', 'km0' );

		return in_array( $value, $allowed, true ) ? $value : 'usata';
	}

	/**
	 * Normalizza la categoria sull'enum del front-end.
	 *
	 * @param string $value Valore grezzo.
	 */
	private function normalize_categoria( string $value ): string {
		return 'commerciale' === $value ? 'commerciale' : 'auto';
	}

	/**
	 * Normalizza l'alimentazione sull'enum del front-end.
	 *
	 * @param string $slug Slug del termine.
	 */
	private function normalize_alimentazione( string $slug ): string {
		$allowed = array( 'benzina', 'diesel', 'ibrido', 'elettrico', 'gpl', 'metano' );

		return in_array( $slug, $allowed, true ) ? $slug : 'benzina';
	}

	/**
	 * Normalizza il cambio sull'enum del front-end (cvt trattato come automatico).
	 *
	 * @param string $value Valore grezzo.
	 */
	private function normalize_cambio( string $value ): string {
		if ( 'automatico' === $value || 'cvt' === $value ) {
			return 'automatico';
		}

		return 'manuale';
	}

	/**
	 * Normalizza la trazione sull'enum del front-end (4x4 trattato come integrale).
	 *
	 * @param string $value Valore grezzo.
	 */
	private function normalize_trazione( string $value ): string {
		if ( 'posteriore' === $value ) {
			return 'posteriore';
		}

		if ( 'integrale' === $value || '4x4' === $value ) {
			return 'integrale';
		}

		return 'anteriore';
	}

	/**
	 * Normalizza il colore libero (es. "Grigio Magnetic") sul token canonico.
	 * Riconosce sia le etichette italiane sia quelle inglesi.
	 *
	 * @param string $value Colore esterno (testo libero).
	 */
	private function normalize_colore( string $value ): string {
		$haystack = strtolower( $value );

		$map = array(
			'bianco'  => array( 'bianco', 'white' ),
			'nero'    => array( 'nero', 'black' ),
			'grigio'  => array( 'grigio', 'grey', 'gray' ),
			'argento' => array( 'argento', 'silver' ),
			'blu'     => array( 'blu', 'blue' ),
			'rosso'   => array( 'rosso', 'red' ),
			'verde'   => array( 'verde', 'green' ),
		);

		foreach ( $map as $token => $needles ) {
			foreach ( $needles as $needle ) {
				if ( str_contains( $haystack, $needle ) ) {
					return $token;
				}
			}
		}

		return 'grigio';
	}
}
