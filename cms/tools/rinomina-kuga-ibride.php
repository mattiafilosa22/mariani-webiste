<?php
/**
 * Correzione una tantum: scambia i suffissi fhev/phev delle Kuga ibride.
 *
 * Il foglio Vantaggio Cliente etichettava come FHEV il blocco che il listino
 * ufficiale Ford dichiara Plug-In Hybrid, e viceversa. Il suffisso finisce nel
 * ref e quindi nello slug pubblico, percio' non basta reimportare: i post
 * esistenti vanno rinominati, altrimenti l'import ne creerebbe di nuovi
 * lasciando online quelli con lo slug sbagliato.
 *
 * Lo scambio avviene in due fasi perche' i nomi si incrociano e WordPress
 * accoderebbe un "-2" agli slug in collisione.
 *
 * Uso: wp eval-file cms/tools/rinomina-kuga-ibride.php [apply]
 *
 * @package Mariani\Core
 */

use Mariani\Core\Support\Schema;

defined( 'WP_CLI' ) || exit;

require_once __DIR__ . '/lib/kuga-ref-mapping.php';

$apply = in_array( 'apply', (array) $args, true );

$mariani_kuga_posts = get_posts(
	array(
		'post_type'        => Schema::CPT_AUTO,
		'post_status'      => 'any',
		'numberposts'      => -1,
		'suppress_filters' => true,
		'lang'             => '',
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- migrazione una tantum su un catalogo ridotto.
		'meta_key'         => '_mariani_import_ref',
	)
);

$mariani_kuga_targets = array();

foreach ( $mariani_kuga_posts as $mariani_kuga_post ) {
	$ref = (string) get_post_meta( $mariani_kuga_post->ID, '_mariani_import_ref', true );

	$target_ref = mariani_kuga_target_ref( $ref );

	if ( null === $target_ref ) {
		continue;
	}

	$mariani_kuga_targets[] = array(
		'id'      => $mariani_kuga_post->ID,
		'da'      => $ref,
		'a'       => $target_ref,
		'slug_da' => $mariani_kuga_post->post_name,
		'slug_a'  => explode( ':', $target_ref )[0]
			. ( str_ends_with( $target_ref, ':en' ) ? '-en' : '' ),
	);
}

WP_CLI::log( $apply ? 'RINOMINA' : 'ANTEPRIMA (aggiungi "apply" per scrivere)' );

foreach ( $mariani_kuga_targets as $t ) {
	WP_CLI::log( sprintf( '#%-5d %-42s -> %s', $t['id'], $t['da'], $t['a'] ) );
}

if ( ! $apply ) {
	WP_CLI::success( sprintf( '%d post da rinominare.', count( $mariani_kuga_targets ) ) );
	return;
}

// Fase 1: slug temporanei, cosi' lo scambio non collide con se stesso.
foreach ( $mariani_kuga_targets as $t ) {
	wp_update_post(
		array(
			'ID'          => $t['id'],
			'post_name'   => 'tmp-' . $t['slug_da'],
			'post_status' => get_post_status( $t['id'] ),
		)
	);
}

// Fase 2: nomi definitivi.
foreach ( $mariani_kuga_targets as $t ) {
	wp_update_post(
		array(
			'ID'          => $t['id'],
			'post_name'   => $t['slug_a'],
			'post_status' => get_post_status( $t['id'] ),
		)
	);
	update_post_meta( $t['id'], '_mariani_import_ref', $t['a'] );
}

WP_CLI::success( sprintf( '%d post rinominati.', count( $mariani_kuga_targets ) ) );
