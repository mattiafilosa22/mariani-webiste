<?php
/**
 * Schema dei campi Meta Box per il CPT "auto".
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Fields;

use Mariani\Core\Support\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Costruisce i meta box del CPT auto (dati, tecnica, prezzi, media, commerciale).
 *
 * Marca, modello, carrozzeria e alimentazione sono gestiti come tassonomie e
 * non vengono duplicati qui come meta.
 */
final class AutoFields {

	/**
	 * Restituisce l'elenco dei meta box per il CPT auto.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public function meta_boxes(): array {
		return array(
			$this->classification_box(),
			$this->engine_box(),
			$this->pricing_box(),
			$this->media_box(),
			$this->commercial_box(),
		);
	}

	/**
	 * Costruisce la struttura base di un meta box legato al CPT auto.
	 *
	 * @param string                         $id     Identificativo del box.
	 * @param string                         $title  Titolo mostrato in admin.
	 * @param array<int,array<string,mixed>> $fields Campi contenuti.
	 * @return array<string,mixed>
	 */
	private function box( string $id, string $title, array $fields ): array {
		return array(
			'id'         => $id,
			'title'      => $title,
			'post_types' => array( Schema::CPT_AUTO ),
			'context'    => 'normal',
			'priority'   => 'high',
			'fields'     => $fields,
		);
	}

	/**
	 * Dati di classificazione e identificazione del veicolo.
	 *
	 * @return array<string,mixed>
	 */
	private function classification_box(): array {
		return $this->box(
			'mariani_auto_classificazione',
			__( 'Classificazione e identificazione', 'mariani-core' ),
			array(
				array(
					'id'      => Schema::meta( 'tipo_veicolo' ),
					'name'    => __( 'Tipo veicolo', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'nuova' => __( 'Nuova', 'mariani-core' ),
						'usata' => __( 'Usata', 'mariani-core' ),
						'km0'   => __( 'Km 0', 'mariani-core' ),
					),
					'std'     => 'nuova',
				),
				array(
					'id'      => Schema::meta( 'categoria' ),
					'name'    => __( 'Categoria', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'auto'        => __( 'Auto', 'mariani-core' ),
						'commerciale' => __( 'Veicolo commerciale', 'mariani-core' ),
					),
					'std'     => 'auto',
				),
				array(
					'id'   => Schema::meta( 'versione' ),
					'name' => __( 'Versione / Allestimento', 'mariani-core' ),
					'type' => 'text',
				),
				array(
					'id'          => Schema::meta( 'anno_immatricolazione' ),
					'name'        => __( 'Anno immatricolazione', 'mariani-core' ),
					'type'        => 'date',
					'js_options'  => array(
						'dateFormat'      => 'yy-mm-dd',
						'changeMonth'     => true,
						'changeYear'      => true,
						'showButtonPanel' => true,
					),
					'save_format' => 'Y-m-d',
				),
				array(
					'id'   => Schema::meta( 'km' ),
					'name' => __( 'Chilometri', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'      => Schema::meta( 'porte' ),
					'name'    => __( 'Numero porte', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'2' => '2',
						'3' => '3',
						'4' => '4',
						'5' => '5',
					),
				),
				array(
					'id'   => Schema::meta( 'posti' ),
					'name' => __( 'Numero posti', 'mariani-core' ),
					'type' => 'number',
					'min'  => 1,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'colore_esterno' ),
					'name' => __( 'Colore esterno', 'mariani-core' ),
					'type' => 'text',
				),
				array(
					'id'   => Schema::meta( 'colore_esterno_hex' ),
					'name' => __( 'Colore esterno (campione)', 'mariani-core' ),
					'type' => 'color',
				),
				array(
					'id'   => Schema::meta( 'colore_interni' ),
					'name' => __( 'Colore interni', 'mariani-core' ),
					'type' => 'text',
				),
				array(
					'id'   => Schema::meta( 'codice_riferimento' ),
					'name' => __( 'Codice riferimento interno', 'mariani-core' ),
					'type' => 'text',
				),
			)
		);
	}

	/**
	 * Dati di motore e scheda tecnica.
	 *
	 * @return array<string,mixed>
	 */
	private function engine_box(): array {
		return $this->box(
			'mariani_auto_tecnica',
			__( 'Motore e scheda tecnica', 'mariani-core' ),
			array(
				array(
					'id'   => Schema::meta( 'cilindrata' ),
					'name' => __( 'Cilindrata (cm³)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'potenza_cv' ),
					'name' => __( 'Potenza (CV)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'potenza_kw' ),
					'name' => __( 'Potenza (kW)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'      => Schema::meta( 'cambio' ),
					'name'    => __( 'Cambio', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'manuale'    => __( 'Manuale', 'mariani-core' ),
						'automatico' => __( 'Automatico', 'mariani-core' ),
						'cvt'        => __( 'CVT', 'mariani-core' ),
					),
				),
				array(
					'id'      => Schema::meta( 'trazione' ),
					'name'    => __( 'Trazione', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'anteriore'  => __( 'Anteriore', 'mariani-core' ),
						'posteriore' => __( 'Posteriore', 'mariani-core' ),
						'integrale'  => __( 'Integrale', 'mariani-core' ),
						'4x4'        => __( '4x4', 'mariani-core' ),
					),
				),
				array(
					'id'   => Schema::meta( 'peso' ),
					'name' => __( 'Peso a vuoto (kg)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'co2' ),
					'name' => __( 'Emissioni CO₂ (g/km)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'consumo_wltp' ),
					'name' => __( 'Consumo misto WLTP (l/100km)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 0.1,
				),
				array(
					'id'   => Schema::meta( 'autonomia_elettrica' ),
					'name' => __( 'Autonomia elettrica (km)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'      => Schema::meta( 'classe_emissioni' ),
					'name'    => __( 'Classe emissioni', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'euro6d'      => 'Euro 6d',
						'euro6d-temp' => 'Euro 6d-temp',
						'euro6e'      => 'Euro 6e',
					),
				),
			)
		);
	}

	/**
	 * Prezzi, offerta e flag commerciali.
	 *
	 * @return array<string,mixed>
	 */
	private function pricing_box(): array {
		return $this->box(
			'mariani_auto_prezzi',
			__( 'Prezzi e offerta', 'mariani-core' ),
			array(
				array(
					'id'   => Schema::meta( 'prezzo_listino' ),
					'name' => __( 'Prezzo di listino (€)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'sconto' ),
					'name' => __( 'Sconto (€)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
					'std'  => 0,
				),
				array(
					'id'   => Schema::meta( 'prezzo_promo' ),
					'name' => __( 'Prezzo promozionale (€)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'testo_promo' ),
					'name' => __( 'Testo promozione / note legali', 'mariani-core' ),
					'type' => 'textarea',
				),
				array(
					'id'          => Schema::meta( 'data_scadenza_offerta' ),
					'name'        => __( 'Data scadenza offerta', 'mariani-core' ),
					'type'        => 'date',
					'js_options'  => array(
						'dateFormat' => 'yy-mm-dd',
					),
					'save_format' => 'Y-m-d',
				),
				array(
					'id'   => Schema::meta( 'neopatentati' ),
					'name' => __( 'Guidabile da neopatentati', 'mariani-core' ),
					'type' => 'checkbox',
					'std'  => 0,
				),
				array(
					'id'   => Schema::meta( 'garanzia' ),
					'name' => __( 'Garanzia', 'mariani-core' ),
					'type' => 'text',
				),
				array(
					'id'   => Schema::meta( 'pronta_consegna' ),
					'name' => __( 'Pronta consegna', 'mariani-core' ),
					'type' => 'checkbox',
					'std'  => 0,
				),
				array(
					'id'   => Schema::meta( 'in_evidenza' ),
					'name' => __( 'In evidenza (slider homepage)', 'mariani-core' ),
					'type' => 'checkbox',
					'std'  => 0,
					'desc' => __( 'Attiva la card nella sezione "Auto in offerta" della homepage.', 'mariani-core' ),
				),
			)
		);
	}

	/**
	 * Galleria e dotazioni.
	 *
	 * @return array<string,mixed>
	 */
	private function media_box(): array {
		return $this->box(
			'mariani_auto_media',
			__( 'Galleria e dotazioni', 'mariani-core' ),
			array(
				array(
					'id'               => Schema::meta( 'galleria' ),
					'name'             => __( 'Galleria foto', 'mariani-core' ),
					'type'             => 'image_advanced',
					'max_file_uploads' => 20,
					'desc'             => __( 'Da 1 a 20 immagini. La prima e la foto principale.', 'mariani-core' ),
				),
				array(
					'id'          => Schema::meta( 'dotazioni_serie' ),
					'name'        => __( 'Dotazioni di serie', 'mariani-core' ),
					'type'        => 'textarea',
					'desc'        => __( 'Una voce per riga.', 'mariani-core' ),
					'placeholder' => __( "Climatizzatore automatico\nCruise control\n...", 'mariani-core' ),
				),
				array(
					'id'   => Schema::meta( 'optional' ),
					'name' => __( 'Optional inclusi', 'mariani-core' ),
					'type' => 'textarea',
					'desc' => __( 'Una voce per riga.', 'mariani-core' ),
				),
			)
		);
	}

	/**
	 * Campi specifici per i veicoli commerciali.
	 *
	 * @return array<string,mixed>
	 */
	private function commercial_box(): array {
		return $this->box(
			'mariani_auto_commerciale',
			__( 'Veicolo commerciale', 'mariani-core' ),
			array(
				array(
					'id'      => Schema::meta( 'tipo_carrozzeria_comm' ),
					'name'    => __( 'Tipo carrozzeria commerciale', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'furgone'       => __( 'Furgone', 'mariani-core' ),
						'telaio'        => __( 'Telaio', 'mariani-core' ),
						'pickup'        => __( 'Pick-up', 'mariani-core' ),
						'doppia-cabina' => __( 'Doppia cabina', 'mariani-core' ),
					),
				),
				array(
					'id'      => Schema::meta( 'dimensione' ),
					'name'    => __( 'Dimensione (codice)', 'mariani-core' ),
					'type'    => 'select',
					'options' => array(
						'L1H1' => 'L1H1',
						'L2H1' => 'L2H1',
						'L2H2' => 'L2H2',
						'L3H2' => 'L3H2',
						'L4H3' => 'L4H3',
					),
				),
				array(
					'id'   => Schema::meta( 'portata_kg' ),
					'name' => __( 'Portata (kg)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 1,
				),
				array(
					'id'   => Schema::meta( 'volume_carico_m3' ),
					'name' => __( 'Volume di carico (m³)', 'mariani-core' ),
					'type' => 'number',
					'min'  => 0,
					'step' => 0.1,
				),
				array(
					'id'   => Schema::meta( 'posti_cabina' ),
					'name' => __( 'Posti in cabina', 'mariani-core' ),
					'type' => 'number',
					'min'  => 1,
					'step' => 1,
				),
			)
		);
	}
}
