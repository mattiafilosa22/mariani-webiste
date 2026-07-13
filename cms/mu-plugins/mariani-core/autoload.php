<?php
/**
 * Autoloader PSR-4 personalizzato per il namespace Mariani\Core.
 *
 * I moduli vivono in cartelle "kebab-case" (post-types, security, ...), mentre
 * le classi usano sotto-namespace PascalCase. La mappa sotto associa ogni
 * prefisso di namespace alla propria cartella, mantenendo i segmenti annidati
 * (Presenters, Repositories, ...) invariati.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

defined( 'ABSPATH' ) || exit;

spl_autoload_register(
	static function ( string $class_name ): void {
		$prefix_to_dir = array(
			'Mariani\\Core\\PostTypes\\' => 'post-types/',
			'Mariani\\Core\\Fields\\'    => 'fields/',
			'Mariani\\Core\\Rest\\'      => 'rest/',
			'Mariani\\Core\\I18n\\'      => 'i18n/',
			'Mariani\\Core\\Security\\'  => 'security/',
			'Mariani\\Core\\Webhook\\'   => 'webhook/',
			'Mariani\\Core\\Mail\\'      => 'mail/',
			'Mariani\\Core\\Forms\\'     => 'forms/',
			'Mariani\\Core\\Seed\\'      => 'seed/',
			'Mariani\\Core\\'            => 'src/',
		);

		foreach ( $prefix_to_dir as $prefix => $dir ) {
			if ( 0 !== strpos( $class_name, $prefix ) ) {
				continue;
			}

			$relative = substr( $class_name, strlen( $prefix ) );
			$path     = MARIANI_CORE_DIR . '/' . $dir . str_replace( '\\', '/', $relative ) . '.php';

			if ( is_readable( $path ) ) {
				require_once $path;
			}

			return;
		}
	}
);
