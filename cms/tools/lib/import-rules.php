<?php
/**
 * Presentation rules shared by the list-price importer and maintenance tools.
 *
 * @package Mariani\Core
 */

/**
 * Whether an imported vehicle appears in the homepage featured carousel.
 *
 * @param string $ref Stable import reference without language suffix.
 */
function mariani_import_is_featured( string $ref ): bool {
	return in_array(
		$ref,
		array(
			'puma-titanium-1-0-mhev-125cv',
			'puma-st-line-1-0-mhev-125cv',
			'puma-st-line-x-1-0-mhev-125cv',
			'puma-gen-e-gen-e-168-cv-43-kwh',
			'puma-gen-e-premium-168-cv-43-kwh',
			'kuga-titanium-2-5-auto-phev',
			'kuga-titanium-2-5-auto-fhev',
			'explorer-explorer-er-286-cv-77-kwh',
		),
		true
	);
}

/**
 * Maps a list-price vehicle to a compatible gallery already in the media archive.
 *
 * Null deliberately means that no sufficiently close model photo is available.
 *
 * @param string $ref Stable import reference without language suffix.
 */
function mariani_import_media_gallery_ref( string $ref ): ?string {
	if ( str_starts_with( $ref, 'puma-gen-e-' ) ) {
		return 'ford-puma-e';
	}

	if ( str_starts_with( $ref, 'puma-' ) ) {
		return 'ford-puma-st-line-x';
	}

	if ( str_starts_with( $ref, 'kuga-' ) ) {
		return 'ford-kuga-phev';
	}

	if ( str_starts_with( $ref, 'explorer-explorer-' ) ) {
		return 'ford-explorer';
	}

	if ( str_starts_with( $ref, 'tourneo-' ) ) {
		return 'ford-tourneo';
	}

	if ( str_starts_with( $ref, 'focus-' ) ) {
		return 'ford-focus-grigia-scuro';
	}

	if ( str_starts_with( $ref, 'mach-e-' ) ) {
		return 'ford-mustang-mach-e';
	}

	return null;
}
