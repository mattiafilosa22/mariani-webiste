<?php
/**
 * Registrazione dei Custom Post Type del plugin.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\PostTypes;

use Mariani\Core\Module;
use Mariani\Core\Support\Schema;

defined( 'ABSPATH' ) || exit;

/**
 * Registra i CPT "auto" (vetrina) e "lead" (contatti privati).
 */
final class PostTypes implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_post_types' ) );
		( new Taxonomies() )->register();
	}

	/**
	 * Registra tutti i CPT.
	 */
	public function register_post_types(): void {
		$this->register_auto();
		$this->register_lead();
	}

	/**
	 * CPT "auto": pubblico in front-office ma senza REST core (usiamo mariani/v1).
	 */
	private function register_auto(): void {
		$labels = array(
			'name'               => _x( 'Auto', 'post type general name', 'mariani-core' ),
			'singular_name'      => _x( 'Auto', 'post type singular name', 'mariani-core' ),
			'menu_name'          => _x( 'Auto', 'admin menu', 'mariani-core' ),
			'add_new'            => __( 'Aggiungi auto', 'mariani-core' ),
			'add_new_item'       => __( 'Aggiungi nuova auto', 'mariani-core' ),
			'edit_item'          => __( 'Modifica auto', 'mariani-core' ),
			'new_item'           => __( 'Nuova auto', 'mariani-core' ),
			'view_item'          => __( 'Vedi auto', 'mariani-core' ),
			'search_items'       => __( 'Cerca auto', 'mariani-core' ),
			'not_found'          => __( 'Nessuna auto trovata', 'mariani-core' ),
			'not_found_in_trash' => __( 'Nessuna auto nel cestino', 'mariani-core' ),
			'all_items'          => __( 'Tutte le auto', 'mariani-core' ),
		);

		register_post_type(
			Schema::CPT_AUTO,
			array(
				'labels'              => $labels,
				'public'              => true,
				'publicly_queryable'  => true,
				'exclude_from_search' => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				// Endpoint core disattivati: i dati passano dalle rotte custom mariani/v1.
				'show_in_rest'        => false,
				'menu_icon'           => 'dashicons-car',
				'menu_position'       => 20,
				'hierarchical'        => false,
				'has_archive'         => false,
				'supports'            => array( 'title', 'editor', 'thumbnail' ),
				'rewrite'             => array(
					'slug'       => 'auto',
					'with_front' => false,
				),
			)
		);
	}

	/**
	 * CPT "lead": privato, raccoglie i contatti dei form. Mai pubblico.
	 */
	private function register_lead(): void {
		$labels = array(
			'name'          => _x( 'Lead', 'post type general name', 'mariani-core' ),
			'singular_name' => _x( 'Lead', 'post type singular name', 'mariani-core' ),
			'menu_name'     => _x( 'Lead', 'admin menu', 'mariani-core' ),
			'edit_item'     => __( 'Dettaglio lead', 'mariani-core' ),
			'view_item'     => __( 'Vedi lead', 'mariani-core' ),
			'search_items'  => __( 'Cerca lead', 'mariani-core' ),
			'not_found'     => __( 'Nessun lead', 'mariani-core' ),
			'all_items'     => __( 'Tutti i lead', 'mariani-core' ),
		);

		register_post_type(
			Schema::CPT_LEAD,
			array(
				'labels'              => $labels,
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'show_in_rest'        => false,
				'menu_icon'           => 'dashicons-email',
				'menu_position'       => 21,
				'hierarchical'        => false,
				'has_archive'         => false,
				'rewrite'             => false,
				'capability_type'     => 'post',
				'supports'            => array( 'title', 'custom-fields' ),
			)
		);
	}
}
