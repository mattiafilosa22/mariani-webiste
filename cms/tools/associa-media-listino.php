<?php
/**
 * Associates imported vehicles with compatible galleries from the media archive.
 *
 * Usage from the WordPress root:
 *   wp eval-file cms/tools/associa-media-listino.php
 *   wp eval-file cms/tools/associa-media-listino.php apply
 *
 * @package Mariani\Core
 */

use Mariani\Core\Seed\Support\SeedMeta;
use Mariani\Core\Support\Schema;

defined( 'WP_CLI' ) || exit;

require_once __DIR__ . '/lib/import-rules.php';

const MARIANI_IMPORT_REF_META = '_mariani_import_ref';

/**
 * Builds gallery-name to attachment-ID lists from seeded media metadata.
 *
 * @return array<string,array<int,int>>
 */
function mariani_import_media_archive(): array {
	$archive = array();

	foreach ( SeedMeta::all_of_type( 'attachment' ) as $attachment_id ) {
		$seed_ref = (string) get_post_meta( $attachment_id, SeedMeta::META_KEY, true );

		if ( ! preg_match( '/^media:car:([^:]+):/', $seed_ref, $matches ) ) {
			continue;
		}

		$archive[ $matches[1] ][ $seed_ref ] = (int) $attachment_id;
	}

	foreach ( $archive as $gallery => $by_ref ) {
		ksort( $by_ref, SORT_NATURAL );
		$archive[ $gallery ] = array_values( $by_ref );
	}

	return $archive;
}

$apply       = in_array( 'apply', (array) $args, true );
$archive     = mariani_import_media_archive();
$vehicle_ids = get_posts(
	array(
		'post_type'        => Schema::CPT_AUTO,
		'post_status'      => 'any',
		'posts_per_page'   => -1,
		'fields'           => 'ids',
		'suppress_filters' => true,
		'lang'             => '',
		'meta_key'         => MARIANI_IMPORT_REF_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- one-off CLI maintenance over a small catalog.
	)
);

$with_media = 0;
$without    = 0;
$featured   = 0;

foreach ( $vehicle_ids as $vehicle_id ) {
	$import_ref  = (string) get_post_meta( $vehicle_id, MARIANI_IMPORT_REF_META, true );
	$base_ref    = preg_replace( '/:(it|en)$/', '', $import_ref );
	$gallery_ref = mariani_import_media_gallery_ref( (string) $base_ref );
	$gallery     = null === $gallery_ref ? array() : ( $archive[ $gallery_ref ] ?? array() );
	$is_featured = mariani_import_is_featured( (string) $base_ref );

	$with_media += array() === $gallery ? 0 : 1;
	$without    += array() === $gallery ? 1 : 0;
	$featured   += $is_featured ? 1 : 0;

	WP_CLI::log(
		sprintf(
			'%s %-58s media=%-24s foto=%2d evidenza=%s',
			$apply ? 'APPLICA' : 'ANTEPRIMA',
			$import_ref,
			$gallery_ref ?? 'su richiesta',
			count( $gallery ),
			$is_featured ? 'si' : 'no'
		)
	);

	if ( ! $apply ) {
		continue;
	}

	$gallery_key = Schema::meta( 'galleria' );
	delete_post_meta( $vehicle_id, $gallery_key );
	delete_post_thumbnail( $vehicle_id );

	foreach ( $gallery as $attachment_id ) {
		add_post_meta( $vehicle_id, $gallery_key, $attachment_id );
	}

	if ( array() !== $gallery ) {
		set_post_thumbnail( $vehicle_id, $gallery[0] );
	}

	update_post_meta(
		$vehicle_id,
		Schema::meta( 'in_evidenza' ),
		$is_featured ? '1' : '0'
	);
}

WP_CLI::success(
	sprintf(
		'%s: %d schede con foto, %d su richiesta, %d schede in evidenza.',
		$apply ? 'Aggiornamento completato' : 'Anteprima completata',
		$with_media,
		$without,
		$featured
	)
);
