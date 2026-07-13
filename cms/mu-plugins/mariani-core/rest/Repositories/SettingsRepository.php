<?php
/**
 * Repository: accesso alla pagina delle impostazioni globali.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Repositories;

use Mariani\Core\I18n\Language;
use Mariani\Core\Support\Schema;
use WP_Post;

defined( 'ABSPATH' ) || exit;

/**
 * Recupera la pagina che ospita le impostazioni globali del sito.
 */
final class SettingsRepository {

	/**
	 * Trova la pagina impostazioni nella lingua richiesta.
	 *
	 * @param string $lang Codice lingua normalizzato.
	 */
	public function find( string $lang ): ?WP_Post {
		$page = get_page_by_path( Schema::SETTINGS_PAGE_SLUG, OBJECT, 'page' );

		if ( ! $page instanceof WP_Post ) {
			return null;
		}

		$translated_id = Language::translated_post_id( $page->ID, $lang );
		$resolved      = get_post( $translated_id );

		return $resolved instanceof WP_Post ? $resolved : null;
	}
}
