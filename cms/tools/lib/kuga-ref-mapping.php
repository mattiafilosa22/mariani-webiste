<?php
/**
 * Pure mapping used by the one-off Kuga FHEV/PHEV migration.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

/**
 * Returns the corrected import reference, preserving the locale suffix.
 *
 * @param string $ref Current import reference.
 * @return string|null Corrected reference, or null when it is not a migration target.
 */
function mariani_kuga_target_ref( string $ref ): ?string {
	if ( ! preg_match( '/^(.+):(it|en)$/', $ref, $matches ) ) {
		return null;
	}

	$targets = array(
		'kuga-titanium-2-5-auto-fhev'           => 'kuga-titanium-2-5-auto-phev',
		'kuga-st-line-active-2-5-auto-fhev'     => 'kuga-st-line-2-5-auto-phev',
		'kuga-st-line-x-active-x-2-5-auto-fhev' => 'kuga-st-line-x-active-x-2-5-auto-phev',
		'kuga-titanium-2-5-auto-phev'           => 'kuga-titanium-2-5-auto-fhev',
		'kuga-st-line-2-5-auto-phev'            => 'kuga-st-line-active-2-5-auto-fhev',
		'kuga-st-line-x-active-x-2-5-auto-phev' => 'kuga-st-line-x-active-x-2-5-auto-fhev',
	);

	$target = $targets[ $matches[1] ] ?? null;

	return null === $target ? null : $target . ':' . $matches[2];
}
