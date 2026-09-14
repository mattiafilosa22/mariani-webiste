<?php
/**
 * Regression test for the one-off Kuga FHEV/PHEV reference migration.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

$helper = dirname( __DIR__ ) . '/lib/kuga-ref-mapping.php';

if ( ! is_file( $helper ) ) {
	echo "FAIL: helper di mapping Kuga mancante.\n";
	exit( 1 );
}

require_once $helper;

$cases = array(
	'kuga-titanium-2-5-auto-fhev:it'           => 'kuga-titanium-2-5-auto-phev:it',
	'kuga-st-line-active-2-5-auto-fhev:it'     => 'kuga-st-line-2-5-auto-phev:it',
	'kuga-st-line-x-active-x-2-5-auto-fhev:en' => 'kuga-st-line-x-active-x-2-5-auto-phev:en',
	'kuga-titanium-2-5-auto-phev:en'           => 'kuga-titanium-2-5-auto-fhev:en',
	'kuga-st-line-2-5-auto-phev:it'            => 'kuga-st-line-active-2-5-auto-fhev:it',
	'kuga-st-line-x-active-x-2-5-auto-phev:en' => 'kuga-st-line-x-active-x-2-5-auto-fhev:en',
	'kuga-st-line-1-5-ecoboost:it'             => null,
);

foreach ( $cases as $source => $expected ) {
	$actual = mariani_kuga_target_ref( $source );

	if ( $expected !== $actual ) {
		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- CLI-only diagnostics from controlled fixtures.
		printf(
			"FAIL: %s: atteso %s, ottenuto %s.\n",
			$source,
			null === $expected ? 'null' : $expected,
			null === $actual ? 'null' : $actual
		);
		// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
		exit( 1 );
	}
}

echo 'OK: mapping Kuga corretto per ' . count( $cases ) . " casi.\n";
