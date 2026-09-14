<?php
/** Test isolato del modulo di retention, senza bootstrap WordPress. */

declare( strict_types=1 );

define( 'ABSPATH', __DIR__ );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['mariani_test_actions']   = array();
$GLOBALS['mariani_test_scheduled'] = array();
$GLOBALS['mariani_test_deleted']   = array();

function add_action( string $hook, $callback ): void {
	$GLOBALS['mariani_test_actions'][ $hook ] = $callback;
}

function wp_next_scheduled( string $hook ) {
	return $GLOBALS['mariani_test_scheduled'][ $hook ] ?? false;
}

function wp_schedule_event( int $timestamp, string $recurrence, string $hook ): bool {
	$GLOBALS['mariani_test_scheduled'][ $hook ] = array( $timestamp, $recurrence );
	return true;
}

function wp_delete_post( int $post_id, bool $force_delete ): bool {
	$GLOBALS['mariani_test_deleted'][] = array( $post_id, $force_delete );
	return true;
}

function get_option( string $name, $default = false ) {
	return $default;
}

final class WP_Query {
	/** @var int[] */
	public array $posts = array( 10, 20 );

	/** @param array<string,mixed> $args */
	public function __construct( array $args ) {
		if ( 'lead' !== $args['post_type'] || 200 !== $args['posts_per_page'] ) {
			throw new RuntimeException( 'Query retention non limitata al batch lead.' );
		}
	}
}

require_once dirname( __DIR__, 2 ) . '/mu-plugins/mariani-core/src/Module.php';
require_once dirname( __DIR__, 2 ) . '/mu-plugins/mariani-core/src/Support/Schema.php';
require_once dirname( __DIR__, 2 ) . '/mu-plugins/mariani-core/forms/FluentFormsGateway.php';
require_once dirname( __DIR__, 2 ) . '/mu-plugins/mariani-core/forms/LeadFormProvisioner.php';
require_once dirname( __DIR__, 2 ) . '/mu-plugins/mariani-core/privacy/LeadRetention.php';

$module = new Mariani\Core\Privacy\LeadRetention( new Mariani\Core\Forms\FluentFormsGateway() );
$module->register();

if ( ! isset( $GLOBALS['mariani_test_actions']['mariani_purge_expired_leads'] ) ) {
	throw new RuntimeException( 'Hook di purge non registrato.' );
}

$module->schedule();
$scheduled = $GLOBALS['mariani_test_scheduled']['mariani_purge_expired_leads'] ?? null;
if ( ! is_array( $scheduled ) || 'daily' !== $scheduled[1] ) {
	throw new RuntimeException( 'Evento daily non schedulato.' );
}

$result = $module->purge();
if ( array( 'posts' => 2, 'submissions' => 0 ) !== $result ) {
	throw new RuntimeException( 'Conteggi purge errati.' );
}

if ( array( array( 10, true ), array( 20, true ) ) !== $GLOBALS['mariani_test_deleted'] ) {
	throw new RuntimeException( 'Lead non eliminati in modo definitivo.' );
}

echo "PASS lead retention\n";
