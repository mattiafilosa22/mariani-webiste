<?php
/**
 * Regression test for deterministic list-price import presentation rules.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

require_once dirname( __DIR__ ) . '/lib/import-rules.php';

$featured = array(
	'puma-titanium-1-0-mhev-125cv',
	'kuga-titanium-2-5-auto-phev',
	'puma-gen-e-gen-e-168-cv-43-kwh',
	'explorer-explorer-er-286-cv-77-kwh',
);

foreach ( $featured as $ref ) {
	if ( ! mariani_import_is_featured( $ref ) ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CLI-only diagnostics from controlled fixtures.
		echo "FAIL featured: {$ref}\n";
		exit( 1 );
	}
}

if ( mariani_import_is_featured( 'bronco-badlands-2-7-v6-ecoboost-biturbo' ) ) {
	echo "FAIL unexpected featured vehicle\n";
	exit( 1 );
}

$media_cases = array(
	'puma-titanium-1-0-mhev-125cv'                    => 'ford-puma-st-line-x',
	'puma-gen-e-premium-168-cv-43-kwh'                => 'ford-puma-e',
	'kuga-titanium-2-5-auto-fhev'                     => 'ford-kuga-phev',
	'explorer-explorer-er-286-cv-77-kwh'              => 'ford-explorer',
	'tourneo-connect-plus-swb-man-1-5-ecoboost-115cv' => 'ford-tourneo',
	'bronco-badlands-2-7-v6-ecoboost-biturbo'         => null,
	'capri-capri-er-286-cv-77-kwh'                    => null,
	'e-courier-titanium-168-cv-43-kwh'                => null,
);

foreach ( $media_cases as $ref => $expected ) {
	$actual = mariani_import_media_gallery_ref( $ref );
	if ( $actual !== $expected ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CLI-only diagnostics from controlled fixtures.
		printf( "FAIL media %s: expected %s, got %s\n", $ref, $expected ?? 'null', $actual ?? 'null' );
		exit( 1 );
	}
}

echo "OK: import presentation rules.\n";
