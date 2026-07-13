<?php
/**
 * Costanti condivise: nomi di CPT, tassonomie, prefisso meta e chiavi pagina.
 *
 * Centralizzare queste stringhe evita duplicazione e "magic string" sparse.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Nomi canonici delle entita del plugin.
 */
final class Schema {

	public const CPT_AUTO = 'auto';
	public const CPT_LEAD = 'lead';

	public const TAX_MARCA         = 'marca';
	public const TAX_MODELLO       = 'modello';
	public const TAX_CARROZZERIA   = 'carrozzeria';
	public const TAX_ALIMENTAZIONE = 'alimentazione';

	/**
	 * Prefisso applicato a tutte le meta key.
	 *
	 * @var string
	 */
	public const META_PREFIX = 'mariani_';

	/**
	 * Slug della pagina che ospita le impostazioni globali del sito.
	 *
	 * @var string
	 */
	public const SETTINGS_PAGE_SLUG = 'impostazioni';

	/**
	 * Slug/chiavi delle pagine editoriali gestite dal front-end.
	 *
	 * @var string[]
	 */
	public const PAGE_KEYS = array(
		'home',
		'officina',
		'noleggio',
		'chi-siamo',
		'contatti',
		'privacy-policy',
		'cookie-policy',
	);

	/**
	 * Restituisce una meta key completa di prefisso.
	 *
	 * @param string $name Nome del campo senza prefisso.
	 */
	public static function meta( string $name ): string {
		return self::META_PREFIX . $name;
	}
}
