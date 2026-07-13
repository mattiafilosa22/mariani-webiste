<?php
/**
 * Presenter: trasforma una pagina editoriale nel DTO PageContent del front-end.
 *
 * Il contratto canonico e lo schema zod in web/src/domain/page.ts. La home
 * espone i blocchi hero/bento/service; le altre pagine key + title + body.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Presenters;

use Mariani\Core\Rest\Support\MetaReader;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Costruisce il contenuto editoriale tipizzato di ciascuna pagina chiave.
 */
final class PagePresenter {

	/**
	 * Lettore meta della pagina corrente.
	 *
	 * @var MetaReader
	 */
	private MetaReader $meta;

	/**
	 * Trasforma la pagina nel DTO PageContent per la chiave indicata.
	 *
	 * @param WP_Post $post Pagina.
	 * @param string  $key  Chiave/slug pagina.
	 * @return array<string,mixed>
	 */
	public function to_dto( WP_Post $post, string $key ): array {
		$this->meta = new MetaReader( $post->ID );

		$dto = array(
			'key'   => $key,
			'title' => get_the_title( $post ),
		);

		switch ( $key ) {
			case 'home':
				$dto['hero']    = $this->hero();
				$dto['bento']   = $this->bento();
				$dto['service'] = $this->service();
				break;

			case 'noleggio':
				$dto['pageHero'] = $this->page_hero( 'mariani_noleggio' );
				$dto['noleggio'] = $this->noleggio();
				break;

			case 'officina':
				$dto['pageHero'] = $this->page_hero( 'mariani_officina' );
				$dto['officina'] = $this->officina();
				break;

			case 'chi-siamo':
				$dto['pageHero'] = $this->page_hero( 'mariani_chisiamo' );
				$dto['chiSiamo'] = $this->chi_siamo();
				break;

			case 'contatti':
				$dto['pageHero'] = $this->page_hero( 'mariani_contatti' );
				break;

			case 'privacy-policy':
				$dto['legal'] = $this->legal( 'mariani_privacy' );
				break;

			case 'cookie-policy':
				$dto['legal'] = $this->legal( 'mariani_cookie' );
				break;
		}

		return $dto;
	}

	/**
	 * Hero interno { eyebrow?, title, subtitle } dalla convenzione di prefisso:
	 * "{prefix}_hero_eyebrow", "{prefix}_titolo", "{prefix}_sottotitolo".
	 *
	 * @param string $prefix Prefisso dei meta della pagina.
	 * @return array<string,string>
	 */
	private function page_hero( string $prefix ): array {
		$hero = array(
			'title'    => $this->meta->string( $prefix . '_titolo' ),
			'subtitle' => $this->meta->string( $prefix . '_sottotitolo' ),
		);

		$this->maybe( $hero, 'eyebrow', $this->meta->string( $prefix . '_hero_eyebrow' ) );

		return $hero;
	}

	/**
	 * Blocco Noleggio.
	 *
	 * @return array<string,mixed>
	 */
	private function noleggio(): array {
		$noleggio = array(
			'vantaggi'       => $this->cards( 'mariani_noleggio_vantaggi' ),
			'serviziInclusi' => $this->meta->string_list( 'mariani_noleggio_servizi' ),
			'steps'          => $this->cards( 'mariani_noleggio_step' ),
			'durataMin'      => (int) ( $this->meta->int_or_null( 'mariani_noleggio_durata_min' ) ?? 12 ),
			'durataMax'      => (int) ( $this->meta->int_or_null( 'mariani_noleggio_durata_max' ) ?? 72 ),
		);

		$this->maybe( $noleggio, 'ctaLabel', $this->meta->string( 'mariani_noleggio_cta_label' ) );
		$this->maybe( $noleggio, 'ctaUrl', $this->meta->string( 'mariani_noleggio_cta_url' ) );

		return $noleggio;
	}

	/**
	 * Blocco Officina.
	 *
	 * @return array<string,mixed>
	 */
	private function officina(): array {
		$officina = array(
			'servizi' => $this->cards( 'mariani_officina_servizi' ),
			'steps'   => $this->cards( 'mariani_officina_step' ),
		);

		$this->maybe( $officina, 'ctaLabel', $this->meta->string( 'mariani_officina_cta_label' ) );
		$this->maybe( $officina, 'ctaUrl', $this->meta->string( 'mariani_officina_cta_url' ) );

		return $officina;
	}

	/**
	 * Blocco Chi Siamo.
	 *
	 * @return array<string,mixed>
	 */
	private function chi_siamo(): array {
		$chi_siamo = array(
			'storia' => $this->html( 'mariani_chisiamo_storia' ),
			'stats'  => $this->stats( 'mariani_chisiamo_stats' ),
		);

		$this->maybe( $chi_siamo, 'comeRaggiungerci', $this->meta->string( 'mariani_chisiamo_come_raggiungerci' ) );

		return $chi_siamo;
	}

	/**
	 * Blocco legale { body, updatedAt? }.
	 *
	 * @param string $prefix Prefisso dei meta (mariani_privacy / mariani_cookie).
	 * @return array<string,string>
	 */
	private function legal( string $prefix ): array {
		$legal = array(
			'body' => $this->html( $prefix . '_body' ),
		);

		$this->maybe( $legal, 'updatedAt', $this->meta->string( $prefix . '_updated' ) );

		return $legal;
	}

	/**
	 * Legge un campo WYSIWYG e lo sanifica (wp_kses_post) per l'output REST,
	 * come difesa in profondità contro HTML non attendibile.
	 *
	 * @param string $key Meta key completa.
	 */
	private function html( string $key ): string {
		return wp_kses_post( $this->meta->string( $key ) );
	}

	/**
	 * Lista di card { title, text } da un campo clonabile "titolo|testo".
	 *
	 * @param string $key Meta key.
	 * @return array<int,array<string,string>>
	 */
	private function cards( string $key ): array {
		$cards = array();

		foreach ( $this->meta->string_list( $key ) as $line ) {
			$parts = explode( '|', $line, 2 );
			$title = trim( $parts[0] );
			$text  = isset( $parts[1] ) ? trim( $parts[1] ) : '';

			if ( '' === $title || '' === $text ) {
				continue;
			}

			$cards[] = array(
				'title' => $title,
				'text'  => $text,
			);
		}

		return $cards;
	}

	/**
	 * Blocco hero della home.
	 *
	 * @return array<string,mixed>
	 */
	private function hero(): array {
		$hero = array(
			'title'    => $this->meta->string( 'mariani_home_hero_titolo' ),
			'subtitle' => $this->meta->string( 'mariani_home_hero_sottotitolo' ),
			'stats'    => $this->stats( 'mariani_home_hero_stats' ),
		);

		$this->maybe( $hero, 'eyebrow', $this->meta->string( 'mariani_home_hero_eyebrow' ) );
		$this->maybe( $hero, 'titleAccent', $this->meta->string( 'mariani_home_hero_titolo_accent' ) );

		return $hero;
	}

	/**
	 * Blocco bento della home.
	 *
	 * @return array<string,mixed>
	 */
	private function bento(): array {
		$bento = array(
			'title'     => $this->meta->string( 'mariani_home_bento_titolo' ),
			'feature'   => array(
				'title' => $this->meta->string( 'mariani_home_bento_feature_titolo' ),
				'text'  => $this->meta->string( 'mariani_home_bento_feature_testo' ),
			),
			'highlight' => array(
				'title' => $this->meta->string( 'mariani_home_bento_highlight_titolo' ),
				'text'  => $this->meta->string( 'mariani_home_bento_highlight_testo' ),
			),
			'stats'     => $this->stats( 'mariani_home_bento_stats' ),
		);

		$this->maybe( $bento, 'eyebrow', $this->meta->string( 'mariani_home_bento_eyebrow' ) );
		$this->maybe( $bento, 'subtitle', $this->meta->string( 'mariani_home_bento_sottotitolo' ) );

		return $bento;
	}

	/**
	 * Blocco service (officina) della home.
	 *
	 * @return array<string,mixed>
	 */
	private function service(): array {
		$service = array(
			'title'     => $this->meta->string( 'mariani_home_service_titolo' ),
			'lead'      => $this->meta->string( 'mariani_home_service_lead' ),
			'checklist' => $this->meta->string_list( 'mariani_home_service_checklist' ),
		);

		$this->maybe( $service, 'eyebrow', $this->meta->string( 'mariani_home_service_eyebrow' ) );

		return $service;
	}

	/**
	 * Statistiche { value, label } da un campo clonabile "valore|etichetta".
	 *
	 * @param string $key Meta key.
	 * @return array<int,array<string,string>>
	 */
	private function stats( string $key ): array {
		$stats = array();

		foreach ( $this->meta->string_list( $key ) as $line ) {
			$parts = explode( '|', $line, 2 );
			$value = trim( $parts[0] );
			$label = isset( $parts[1] ) ? trim( $parts[1] ) : '';

			if ( '' === $value || '' === $label ) {
				continue;
			}

			$stats[] = array(
				'value' => $value,
				'label' => $label,
			);
		}

		return $stats;
	}

	/**
	 * Aggiunge una chiave opzionale solo se il valore non e vuoto.
	 *
	 * @param array<string,mixed> $target Struttura da arricchire (per riferimento).
	 * @param string              $key    Chiave da impostare.
	 * @param string              $value  Valore candidato.
	 */
	private function maybe( array &$target, string $key, string $value ): void {
		if ( '' !== trim( $value ) ) {
			$target[ $key ] = $value;
		}
	}
}
