<?php
/**
 * Registrazione delle tassonomie associate al CPT "auto".
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\PostTypes;

use Mariani\Core\Support\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Registra marca, modello (gerarchica), carrozzeria e alimentazione.
 */
final class Taxonomies {

	/**
	 * Aggancia la registrazione all'hook init.
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_taxonomies' ) );
	}

	/**
	 * Registra tutte le tassonomie.
	 */
	public function register_taxonomies(): void {
		$this->register_taxonomy( Schema::TAX_MARCA, __( 'Marca', 'mariani-core' ), __( 'Marche', 'mariani-core' ), false );
		$this->register_taxonomy( Schema::TAX_MODELLO, __( 'Modello', 'mariani-core' ), __( 'Modelli', 'mariani-core' ), true );
		$this->register_taxonomy( Schema::TAX_CARROZZERIA, __( 'Carrozzeria', 'mariani-core' ), __( 'Carrozzerie', 'mariani-core' ), false );
		$this->register_taxonomy( Schema::TAX_ALIMENTAZIONE, __( 'Alimentazione', 'mariani-core' ), __( 'Alimentazioni', 'mariani-core' ), false );
	}

	/**
	 * Registra una singola tassonomia sul CPT auto.
	 *
	 * @param string $taxonomy     Slug della tassonomia.
	 * @param string $singular     Etichetta singolare.
	 * @param string $plural       Etichetta plurale.
	 * @param bool   $hierarchical Se la tassonomia e gerarchica.
	 */
	private function register_taxonomy( string $taxonomy, string $singular, string $plural, bool $hierarchical ): void {
		$labels = array(
			'name'          => $plural,
			'singular_name' => $singular,
			'search_items'  => sprintf(
				/* translators: %s: nome plurale della tassonomia. */
				__( 'Cerca %s', 'mariani-core' ),
				$plural
			),
			'all_items'     => sprintf(
				/* translators: %s: nome plurale della tassonomia. */
				__( 'Tutte le %s', 'mariani-core' ),
				$plural
			),
			'edit_item'     => sprintf(
				/* translators: %s: nome singolare della tassonomia. */
				__( 'Modifica %s', 'mariani-core' ),
				$singular
			),
			'add_new_item'  => sprintf(
				/* translators: %s: nome singolare della tassonomia. */
				__( 'Aggiungi %s', 'mariani-core' ),
				$singular
			),
		);

		register_taxonomy(
			$taxonomy,
			array( Schema::CPT_AUTO ),
			array(
				'labels'             => $labels,
				'hierarchical'       => $hierarchical,
				'public'             => true,
				'publicly_queryable' => false,
				'show_ui'            => true,
				'show_admin_column'  => true,
				'show_in_nav_menus'  => false,
				// Esposta solo tramite le rotte custom mariani/v1.
				'show_in_rest'       => false,
				'rewrite'            => false,
			)
		);
	}
}
