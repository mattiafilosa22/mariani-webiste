<?php
/**
 * Repository: accesso in lettura al CPT "auto".
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Repositories;

use Mariani\Core\I18n\Language;
use Mariani\Core\Support\Schema;
use WP_Post;
use WP_Query;

defined( 'ABSPATH' ) || exit;

/**
 * Incapsula le query WP per le auto, isolando lo storage dall'API.
 */
final class AutoRepository {

	/**
	 * Tipi veicolo ammessi per il filtro.
	 *
	 * @var string[]
	 */
	private const ALLOWED_TYPES = array( 'nuova', 'usata', 'km0' );

	/**
	 * Restituisce le auto pubblicate, eventualmente filtrate per tipo.
	 *
	 * @param string      $lang Codice lingua normalizzato.
	 * @param string|null $type Tipo veicolo (nuova|usata|km0) oppure null.
	 * @return WP_Post[]
	 */
	public function find_all( string $lang, ?string $type = null ): array {
		$args = array(
			'post_type'      => Schema::CPT_AUTO,
			'post_status'    => 'publish',
			// Il catalogo e volutamente limitato (<300 auto, cfr. spec §2.4) e
			// l'export statico consuma l'intera lista in un'unica chiamata.
			'posts_per_page' => 200, // phpcs:ignore WordPress.WP.PostsPerPage.posts_per_page_posts_per_page -- catalogo limitato per il front-end statico.
			'orderby'        => 'date',
			'order'          => 'DESC',
			'no_found_rows'  => true,
		);

		if ( null !== $type && in_array( $type, self::ALLOWED_TYPES, true ) ) {
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- filtro necessario su un dataset ridotto e indicizzato.
			$args['meta_query'] = array(
				array(
					'key'     => Schema::meta( 'tipo_veicolo' ),
					'value'   => $type,
					'compare' => '=',
				),
			);
		}

		$args  = Language::constrain_query( $args, $lang );
		$query = new WP_Query( $args );

		return $query->posts;
	}

	/**
	 * Trova una auto pubblicata dal suo slug.
	 *
	 * @param string $slug Slug del post.
	 * @param string $lang Codice lingua normalizzato.
	 */
	public function find_by_slug( string $slug, string $lang ): ?WP_Post {
		$args = array(
			'post_type'      => Schema::CPT_AUTO,
			'post_status'    => 'publish',
			'name'           => $slug,
			'posts_per_page' => 1,
			'no_found_rows'  => true,
		);

		$args  = Language::constrain_query( $args, $lang );
		$query = new WP_Query( $args );

		return array() === $query->posts ? null : $query->posts[0];
	}
}
