<?php
/**
 * Modulo seeder: registra il comando WP-CLI "wp mariani seed".
 *
 * Il comando popola marche/modelli, auto di demo, impostazioni globali e
 * pagine editoriali in modo idempotente, allineati ai mock del front-end.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed;

use Mariani\Core\Module;
use Mariani\Core\Rest\Support\ImageTransformer;
use Mariani\Core\Seed\Support\Placeholders;

defined( 'ABSPATH' ) || exit;

/**
 * Espone il seeder solo in contesto WP-CLI; inerte via web.
 */
final class SeedModule implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		if ( ! ( defined( 'WP_CLI' ) && \WP_CLI ) ) {
			return;
		}

		\WP_CLI::add_command( 'mariani seed', $this->command() );
	}

	/**
	 * Compone il comando iniettando i seeder collaboratori.
	 */
	private function command(): SeedCommand {
		$language = new LanguageSeeder();

		return new SeedCommand(
			$language,
			new TaxonomySeeder(),
			new MediaSeeder( new Placeholders(), new ImageTransformer() ),
			new AutoSeeder( $language ),
			new PageSeeder( $language )
		);
	}
}
