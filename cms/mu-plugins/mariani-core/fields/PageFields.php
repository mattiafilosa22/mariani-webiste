<?php
/**
 * Schema dei campi Meta Box per le pagine editoriali (home, officina, ecc.).
 *
 * Ogni pagina "chiave" (slug) ha un proprio meta box. I box restano registrati
 * su tutte le pagine per garantire il salvataggio; il front-end legge solo il
 * box pertinente alla pagina richiesta via /pages/{key}.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Fields;

defined( 'ABSPATH' ) || exit;

/**
 * Definisce i blocchi editoriali tipizzati delle pagine.
 */
final class PageFields {

	/**
	 * Restituisce i meta box delle pagine editoriali.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public function meta_boxes(): array {
		return array(
			$this->home_box(),
			$this->officina_box(),
			$this->noleggio_box(),
			$this->chi_siamo_box(),
			$this->contatti_box(),
			$this->privacy_box(),
			$this->cookie_box(),
		);
	}

	/**
	 * Campo WYSIWYG (contenuto ricco).
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,string>
	 */
	private function wysiwyg( string $id, string $name ): array {
		return array(
			'id'   => $id,
			'name' => $name,
			'type' => 'wysiwyg',
		);
	}

	/**
	 * Wrapper per un meta box legato al post type "page".
	 *
	 * @param string                         $id     Identificativo.
	 * @param string                         $title  Titolo in admin.
	 * @param array<int,array<string,mixed>> $fields Campi.
	 * @return array<string,mixed>
	 */
	private function box( string $id, string $title, array $fields ): array {
		return array(
			'id'         => $id,
			'title'      => $title,
			'post_types' => array( 'page' ),
			'context'    => 'normal',
			'priority'   => 'default',
			'fields'     => $fields,
		);
	}

	/**
	 * Campo testo semplice.
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,string>
	 */
	private function text( string $id, string $name ): array {
		return array(
			'id'   => $id,
			'name' => $name,
			'type' => 'text',
		);
	}

	/**
	 * Campo textarea.
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,string>
	 */
	private function textarea( string $id, string $name ): array {
		return array(
			'id'   => $id,
			'name' => $name,
			'type' => 'textarea',
		);
	}

	/**
	 * Campo immagine singola.
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,mixed>
	 */
	private function image( string $id, string $name ): array {
		return array(
			'id'               => $id,
			'name'             => $name,
			'type'             => 'single_image',
			'max_file_uploads' => 1,
		);
	}

	/**
	 * Campo URL.
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,string>
	 */
	private function url( string $id, string $name ): array {
		return array(
			'id'   => $id,
			'name' => $name,
			'type' => 'url',
		);
	}

	/**
	 * Lista clonabile di voci testuali.
	 *
	 * @param string $id   Meta key completa.
	 * @param string $name Etichetta.
	 * @return array<string,mixed>
	 */
	private function repeater_text( string $id, string $name ): array {
		return array(
			'id'         => $id,
			'name'       => $name,
			'type'       => 'text',
			'clone'      => true,
			'sort_clone' => true,
		);
	}

	/**
	 * Homepage: hero, bento e sezione service (officina), allineati al
	 * contratto PageContent del front-end.
	 *
	 * @return array<string,mixed>
	 */
	private function home_box(): array {
		$fields = array(
			$this->text( 'mariani_home_hero_eyebrow', __( 'Hero — Eyebrow', 'mariani-core' ) ),
			$this->text( 'mariani_home_hero_titolo', __( 'Hero — Titolo', 'mariani-core' ) ),
			$this->text( 'mariani_home_hero_titolo_accent', __( 'Hero — Titolo (accento)', 'mariani-core' ) ),
			$this->textarea( 'mariani_home_hero_sottotitolo', __( 'Hero — Sottotitolo', 'mariani-core' ) ),
			$this->image( 'mariani_home_hero_poster', __( 'Hero — Poster video', 'mariani-core' ) ),
			$this->url( 'mariani_home_hero_video_mp4', __( 'Hero — Video MP4 (URL)', 'mariani-core' ) ),
			$this->url( 'mariani_home_hero_video_webm', __( 'Hero — Video WebM (URL)', 'mariani-core' ) ),
			$this->repeater_text( 'mariani_home_hero_stats', __( 'Hero — Statistiche (formato "valore|etichetta")', 'mariani-core' ) ),

			$this->text( 'mariani_home_bento_eyebrow', __( 'Bento — Eyebrow', 'mariani-core' ) ),
			$this->text( 'mariani_home_bento_titolo', __( 'Bento — Titolo sezione', 'mariani-core' ) ),
			$this->textarea( 'mariani_home_bento_sottotitolo', __( 'Bento — Sottotitolo', 'mariani-core' ) ),
			$this->text( 'mariani_home_bento_feature_titolo', __( 'Bento — Cella principale: titolo', 'mariani-core' ) ),
			$this->textarea( 'mariani_home_bento_feature_testo', __( 'Bento — Cella principale: testo', 'mariani-core' ) ),
			$this->text( 'mariani_home_bento_highlight_titolo', __( 'Bento — Cella evidenza: titolo', 'mariani-core' ) ),
			$this->textarea( 'mariani_home_bento_highlight_testo', __( 'Bento — Cella evidenza: testo', 'mariani-core' ) ),
			$this->repeater_text( 'mariani_home_bento_stats', __( 'Bento — Statistiche (formato "valore|etichetta")', 'mariani-core' ) ),

			$this->text( 'mariani_home_service_eyebrow', __( 'Service — Eyebrow', 'mariani-core' ) ),
			$this->text( 'mariani_home_service_titolo', __( 'Service — Titolo', 'mariani-core' ) ),
			$this->textarea( 'mariani_home_service_lead', __( 'Service — Testo introduttivo', 'mariani-core' ) ),
			$this->repeater_text( 'mariani_home_service_checklist', __( 'Service — Checklist (una voce per riga)', 'mariani-core' ) ),
		);

		return $this->box( 'mariani_page_home', __( 'Contenuti: Homepage', 'mariani-core' ), $fields );
	}

	/**
	 * Pagina Officina / Assistenza. Hero + servizi (card "titolo|testo"),
	 * step "come funziona" e CTA. Gli orari arrivano dalle impostazioni.
	 *
	 * @return array<string,mixed>
	 */
	private function officina_box(): array {
		return $this->box(
			'mariani_page_officina',
			__( 'Contenuti: Officina', 'mariani-core' ),
			array(
				$this->image( 'mariani_officina_hero_img', __( 'Hero — Immagine', 'mariani-core' ) ),
				$this->text( 'mariani_officina_hero_eyebrow', __( 'Hero — Eyebrow', 'mariani-core' ) ),
				$this->text( 'mariani_officina_titolo', __( 'Hero — Titolo', 'mariani-core' ) ),
				$this->textarea( 'mariani_officina_sottotitolo', __( 'Hero — Sottotitolo', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_officina_servizi', __( 'Servizi (formato "titolo|testo")', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_officina_step', __( 'Come funziona (formato "titolo|testo")', 'mariani-core' ) ),
				$this->text( 'mariani_officina_cta_label', __( 'CTA (testo)', 'mariani-core' ) ),
				$this->url( 'mariani_officina_cta_url', __( 'CTA (URL)', 'mariani-core' ) ),
			)
		);
	}

	/**
	 * Pagina Noleggio a lungo termine. Hero + vantaggi/servizi/step + durata.
	 *
	 * @return array<string,mixed>
	 */
	private function noleggio_box(): array {
		return $this->box(
			'mariani_page_noleggio',
			__( 'Contenuti: Noleggio', 'mariani-core' ),
			array(
				$this->image( 'mariani_noleggio_hero_img', __( 'Hero — Immagine', 'mariani-core' ) ),
				$this->text( 'mariani_noleggio_hero_eyebrow', __( 'Hero — Eyebrow', 'mariani-core' ) ),
				$this->text( 'mariani_noleggio_titolo', __( 'Hero — Titolo', 'mariani-core' ) ),
				$this->textarea( 'mariani_noleggio_sottotitolo', __( 'Hero — Sottotitolo', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_noleggio_vantaggi', __( 'Vantaggi (formato "titolo|testo")', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_noleggio_servizi', __( 'Servizi inclusi (una voce per riga)', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_noleggio_step', __( 'Come funziona (formato "titolo|testo")', 'mariani-core' ) ),
				array(
					'id'   => 'mariani_noleggio_durata_min',
					'name' => __( 'Durata minima (mesi)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 1,
				),
				array(
					'id'   => 'mariani_noleggio_durata_max',
					'name' => __( 'Durata massima (mesi)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 1,
				),
				$this->text( 'mariani_noleggio_cta_label', __( 'CTA (testo)', 'mariani-core' ) ),
				$this->url( 'mariani_noleggio_cta_url', __( 'CTA (URL)', 'mariani-core' ) ),
			)
		);
	}

	/**
	 * Pagina Chi Siamo / Dove Siamo. Hero + storia + statistiche.
	 * Le coordinate mappa e gli orari arrivano dalle impostazioni globali.
	 *
	 * @return array<string,mixed>
	 */
	private function chi_siamo_box(): array {
		return $this->box(
			'mariani_page_chi_siamo',
			__( 'Contenuti: Chi Siamo', 'mariani-core' ),
			array(
				$this->text( 'mariani_chisiamo_hero_eyebrow', __( 'Hero — Eyebrow', 'mariani-core' ) ),
				$this->text( 'mariani_chisiamo_titolo', __( 'Hero — Titolo', 'mariani-core' ) ),
				$this->textarea( 'mariani_chisiamo_sottotitolo', __( 'Hero — Sottotitolo', 'mariani-core' ) ),
				$this->wysiwyg( 'mariani_chisiamo_storia', __( 'Storia aziendale', 'mariani-core' ) ),
				$this->image( 'mariani_chisiamo_img', __( 'Immagine sede / staff', 'mariani-core' ) ),
				$this->repeater_text( 'mariani_chisiamo_stats', __( 'Statistiche (formato "valore|etichetta")', 'mariani-core' ) ),
				$this->textarea( 'mariani_chisiamo_come_raggiungerci', __( 'Come raggiungerci', 'mariani-core' ) ),
			)
		);
	}

	/**
	 * Pagina Contatti. Solo hero editoriale: contatti, orari e mappa
	 * provengono dalle impostazioni globali.
	 *
	 * @return array<string,mixed>
	 */
	private function contatti_box(): array {
		return $this->box(
			'mariani_page_contatti',
			__( 'Contenuti: Contatti', 'mariani-core' ),
			array(
				$this->text( 'mariani_contatti_hero_eyebrow', __( 'Hero — Eyebrow', 'mariani-core' ) ),
				$this->text( 'mariani_contatti_titolo', __( 'Hero — Titolo', 'mariani-core' ) ),
				$this->textarea( 'mariani_contatti_sottotitolo', __( 'Hero — Sottotitolo', 'mariani-core' ) ),
			)
		);
	}

	/**
	 * Pagina Privacy Policy (testo legale editabile).
	 *
	 * @return array<string,mixed>
	 */
	private function privacy_box(): array {
		return $this->box(
			'mariani_page_privacy',
			__( 'Contenuti: Privacy Policy', 'mariani-core' ),
			array(
				$this->wysiwyg( 'mariani_privacy_body', __( 'Testo privacy', 'mariani-core' ) ),
				$this->text( 'mariani_privacy_updated', __( 'Ultimo aggiornamento (AAAA-MM-GG)', 'mariani-core' ) ),
			)
		);
	}

	/**
	 * Pagina Cookie Policy (testo legale editabile).
	 *
	 * @return array<string,mixed>
	 */
	private function cookie_box(): array {
		return $this->box(
			'mariani_page_cookie',
			__( 'Contenuti: Cookie Policy', 'mariani-core' ),
			array(
				$this->wysiwyg( 'mariani_cookie_body', __( 'Testo cookie', 'mariani-core' ) ),
				$this->text( 'mariani_cookie_updated', __( 'Ultimo aggiornamento (AAAA-MM-GG)', 'mariani-core' ) ),
			)
		);
	}
}
