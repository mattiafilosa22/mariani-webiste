<?php
/**
 * Schema dei campi Meta Box per le impostazioni globali del sito.
 *
 * Sono ospitati sulla pagina con slug definito da Schema::SETTINGS_PAGE_SLUG e
 * letti dal front-end tramite l'endpoint /settings.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Fields;

defined( 'ABSPATH' ) || exit;

/**
 * Definisce contatti, orari, social e testi legali globali.
 */
final class SettingsFields {

	/**
	 * Restituisce il meta box delle impostazioni globali.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public function meta_boxes(): array {
		return array(
			array(
				'id'         => 'mariani_settings',
				'title'      => __( 'Impostazioni globali sito', 'mariani-core' ),
				'post_types' => array( 'page' ),
				'context'    => 'normal',
				'priority'   => 'default',
				'fields'     => array(
					$this->heading( __( 'Anagrafica', 'mariani-core' ) ),
					$this->text( 'mariani_set_nome_azienda', __( 'Nome azienda (brand)', 'mariani-core' ) ),
					$this->text( 'mariani_set_ragione_sociale', __( 'Ragione sociale', 'mariani-core' ) ),

					$this->heading( __( 'Contatti', 'mariani-core' ) ),
					$this->textarea( 'mariani_set_indirizzo', __( 'Indirizzo', 'mariani-core' ) ),
					$this->text( 'mariani_set_tel_vendita', __( 'Telefono vendita', 'mariani-core' ) ),
					$this->text( 'mariani_set_tel_assistenza', __( 'Telefono assistenza', 'mariani-core' ) ),
					$this->text( 'mariani_set_whatsapp', __( 'Numero WhatsApp (formato internazionale)', 'mariani-core' ) ),
					array(
						'id'   => 'mariani_set_email',
						'name' => __( 'Email', 'mariani-core' ),
						'type' => 'email',
					),
					$this->text( 'mariani_set_piva', __( 'Partita IVA', 'mariani-core' ) ),
					$this->text( 'mariani_set_rea', __( 'REA', 'mariani-core' ) ),
					$this->url( 'mariani_set_maps_url', __( 'URL Google Maps', 'mariani-core' ) ),
					$this->text( 'mariani_set_map_lat', __( 'Mappa — Latitudine', 'mariani-core' ) ),
					$this->text( 'mariani_set_map_lng', __( 'Mappa — Longitudine', 'mariani-core' ) ),

					$this->heading( __( 'Orari', 'mariani-core' ) ),
					$this->textarea( 'mariani_set_orari_vendita', __( 'Orari vendita', 'mariani-core' ) ),
					$this->textarea( 'mariani_set_orari_officina', __( 'Orari officina', 'mariani-core' ) ),

					$this->heading( __( 'Social', 'mariani-core' ) ),
					$this->url( 'mariani_set_facebook', __( 'Facebook (URL)', 'mariani-core' ) ),
					$this->url( 'mariani_set_instagram', __( 'Instagram (URL)', 'mariani-core' ) ),
					$this->url( 'mariani_set_messenger', __( 'Facebook Messenger (m.me URL)', 'mariani-core' ) ),

					$this->heading( __( 'Hero e credito foto', 'mariani-core' ) ),
					$this->image( 'mariani_set_hero_image', __( 'Immagine hero (home)', 'mariani-core' ) ),
					$this->textarea( 'mariani_set_foto_credit', __( 'Credito foto (hero e footer)', 'mariani-core' ) ),

					$this->heading( __( 'Footer e testi legali', 'mariani-core' ) ),
					$this->text( 'mariani_set_slogan', __( 'Slogan', 'mariani-core' ) ),
					$this->text( 'mariani_set_copyright', __( 'Testo copyright', 'mariani-core' ) ),
					$this->url( 'mariani_set_privacy_url', __( 'Privacy policy (URL)', 'mariani-core' ) ),
					$this->url( 'mariani_set_cookie_url', __( 'Cookie policy (URL)', 'mariani-core' ) ),
				),
			),
		);
	}

	/**
	 * Intestazione visiva (divider) tra gruppi di campi.
	 *
	 * @param string $label Testo dell'intestazione.
	 * @return array<string,string>
	 */
	private function heading( string $label ): array {
		return array(
			'type' => 'heading',
			'name' => $label,
		);
	}

	/**
	 * Campo testo.
	 *
	 * @param string $id   Meta key.
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
	 * @param string $id   Meta key.
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
	 * Campo immagine singola (attachment ID).
	 *
	 * @param string $id   Meta key.
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
	 * @param string $id   Meta key.
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
}
