<?php
/**
 * Plugin Name:  Mariani Core
 * Description:  Back-office headless per Mariani Concessionaria Ford: CPT auto/lead, campi Meta Box, REST API mariani/v1, multilingua, sicurezza e webhook di deploy.
 * Version:      1.0.0
 * Author:       Romiltec Srl
 * Text Domain:  mariani-core
 * Requires PHP: 8.1
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

defined( 'ABSPATH' ) || exit;

if ( defined( 'MARIANI_CORE_VERSION' ) ) {
	return;
}

define( 'MARIANI_CORE_VERSION', '1.0.0' );
define( 'MARIANI_CORE_DIR', __DIR__ );
define( 'MARIANI_CORE_FILE', __FILE__ );
define( 'MARIANI_CORE_TEXTDOMAIN', 'mariani-core' );
define( 'MARIANI_CORE_REST_NAMESPACE', 'mariani/v1' );

require_once __DIR__ . '/autoload.php';

/*
 * Avvio del plugin. L'autoloader PSR-4 personalizzato risolve i namespace
 * Mariani\Core\* verso i moduli su disco.
 */
\Mariani\Core\Plugin::instance()->boot();
