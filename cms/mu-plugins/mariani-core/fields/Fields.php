<?php
/**
 * Modulo campi: registra tutti i meta box via Meta Box.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Fields;

use Mariani\Core\Module;

defined( 'ABSPATH' ) || exit;

/**
 * Aggrega i meta box di auto, pagine e impostazioni e li registra su Meta Box.
 *
 * Se il plugin Meta Box non e attivo, il filtro rwmb_meta_boxes non viene mai
 * invocato: il modulo degrada silenziosamente senza errori.
 */
final class Fields implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_filter( 'rwmb_meta_boxes', array( $this, 'register_meta_boxes' ) );
	}

	/**
	 * Unisce i meta box del plugin a quelli gia registrati.
	 *
	 * @param array<int,array<string,mixed>> $meta_boxes Meta box esistenti.
	 * @return array<int,array<string,mixed>>
	 */
	public function register_meta_boxes( array $meta_boxes ): array {
		return array_merge(
			$meta_boxes,
			( new AutoFields() )->meta_boxes(),
			( new PageFields() )->meta_boxes(),
			( new SettingsFields() )->meta_boxes()
		);
	}
}
