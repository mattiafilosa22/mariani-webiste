<?php
/**
 * Operazioni WordPress comuni agli import del catalogo (listino e stock):
 * ritrovare una scheda dal suo riferimento stabile e assegnarle i termini.
 *
 * @package Mariani\Core
 */

// Niente declare(strict_types): il file viene incluso da script `wp eval-file`.
use Mariani\Core\Support\Schema;

const IMPORT_REF_META = '_mariani_import_ref';

/**
 * Trova il post gia' importato con quel riferimento.
 *
 * @param string $ref Riferimento stabile del record.
 * @return int|null ID del post, null se non esiste.
 */
function mariani_import_find( string $ref ): ?int {
	$found = get_posts(
		array(
			'post_type'        => Schema::CPT_AUTO,
			'post_status'      => 'any',
			'posts_per_page'   => 1,
			'fields'           => 'ids',
			'suppress_filters' => true,
			'lang'             => '',
			'meta_query'       => array(
				array(
					'key'   => IMPORT_REF_META,
					'value' => $ref,
				),
			),
		)
	);

	return $found ? (int) $found[0] : null;
}

/**
 * Assegna un termine alla tassonomia riusando lo slug se esiste gia'.
 *
 * @param int    $post_id  ID del post.
 * @param string $taxonomy Tassonomia.
 * @param string $name     Nome del termine.
 */
function mariani_import_term( int $post_id, string $taxonomy, string $name ): void {
	if ( '' === $name ) {
		return;
	}

	$term = term_exists( sanitize_title( $name ), $taxonomy );

	if ( ! $term ) {
		$term = term_exists( $name, $taxonomy );
	}

	if ( ! $term ) {
		$term = wp_insert_term( $name, $taxonomy );
	}

	if ( is_wp_error( $term ) ) {
		WP_CLI::warning( sprintf( '%s "%s": %s', $taxonomy, $name, $term->get_error_message() ) );
		return;
	}

	wp_set_object_terms( $post_id, array( (int) $term['term_id'] ), $taxonomy, false );
}
