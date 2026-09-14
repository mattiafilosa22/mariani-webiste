<?php
/**
 * Applica al CMS esistente i soli contenuti del rilascio, senza eseguire il seeder.
 *
 * Uso: wp eval-file apply-release-readiness.php <catalogo_attachment_id> <officina_attachment_id>
 *
 * @package Mariani\Core
 */

use Mariani\Core\Seed\Data\Catalog;
use Mariani\Core\Seed\Support\SeedMeta;

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	return;
}

$catalogo_id = isset( $args[0] ) ? (int) $args[0] : 0;
$officina_id = isset( $args[1] ) ? (int) $args[1] : 0;

if ( $catalogo_id <= 0 || $officina_id <= 0 ) {
	WP_CLI::error( 'Servono entrambi gli ID allegato.' );
}

SeedMeta::mark( $catalogo_id, 'media:home-catalogo' );
SeedMeta::mark( $officina_id, 'media:home-officina' );

$settings_id = SeedMeta::find( 'settings:impostazioni:it' );
if ( null === $settings_id ) {
	WP_CLI::error( 'Pagina impostazioni non trovata.' );
}
update_post_meta( $settings_id, 'mariani_set_piva', '01300000492' );

$wanted_pages = array( 'home', 'privacy-policy', 'cookie-policy' );
$updated      = 0;

foreach ( Catalog::pages() as $record ) {
	$key = (string) $record['key'];
	if ( ! in_array( $key, $wanted_pages, true ) ) {
		continue;
	}

	foreach ( array( 'it', 'en' ) as $language ) {
		$page_id = SeedMeta::find( 'page:' . $key . ':' . $language );
		if ( null === $page_id ) {
			WP_CLI::warning( 'Pagina non trovata: ' . $key . ':' . $language );
			continue;
		}

		$meta = 'en' === $language
			? array_merge( $record['meta'], $record['meta_en'] )
			: $record['meta'];

		if ( 'home' === $key ) {
			update_post_meta( $page_id, 'mariani_home_hero_titolo', $meta['mariani_home_hero_titolo'] );
			update_post_meta( $page_id, 'mariani_home_bento_feature_img', $catalogo_id );
			update_post_meta( $page_id, 'mariani_home_service_img', $officina_id );
			wp_update_post(
				array(
					'ID'         => $page_id,
					'post_title' => 'en' === $language ? $record['title_en'] : $record['title'],
				)
			);
		} else {
			foreach ( $meta as $meta_key => $value ) {
				update_post_meta( $page_id, (string) $meta_key, $value );
			}
		}

		++$updated;
	}
}

do_action( 'mariani_purge_expired_leads' );

$published = get_posts(
	array(
		'post_type'        => 'auto',
		'post_status'      => 'publish',
		'posts_per_page'   => -1,
		'fields'           => 'ids',
		'suppress_filters' => true,
	)
);
$featured  = array_filter(
	$published,
	static fn( int $post_id ): bool => (bool) get_post_meta( $post_id, 'mariani_in_evidenza', true )
);

WP_CLI::success(
	sprintf(
		'Aggiornate %d varianti pagina; PIVA, media e retention applicati. Auto pubblicate: %d; in evidenza: %d.',
		$updated,
		count( $published ),
		count( $featured )
	)
);
