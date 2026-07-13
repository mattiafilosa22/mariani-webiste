<?php
/**
 * Loader must-use per il plugin Mariani Core.
 *
 * WordPress carica automaticamente solo i file PHP nella radice di mu-plugins,
 * non nelle sottocartelle. Questo loader richiede il bootstrap reale del plugin.
 *
 * @package Mariani\Core
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/mariani-core/mariani-core.php';
