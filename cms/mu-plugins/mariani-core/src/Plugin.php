<?php
/**
 * Bootstrap principale del plugin: compone e avvia i moduli.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core;

use Mariani\Core\Fields\Fields;
use Mariani\Core\Forms\FormsModule;
use Mariani\Core\Mail\LeadNotifier;
use Mariani\Core\PostTypes\PostTypes;
use Mariani\Core\Rest\Rest;
use Mariani\Core\Seed\SeedModule;
use Mariani\Core\Security\Security;
use Mariani\Core\Webhook\DeployWebhook;

defined( 'ABSPATH' ) || exit;

/**
 * Contenitore di composizione (composition root) del plugin.
 *
 * Istanzia i moduli una sola volta e ne invoca la registrazione degli hook.
 */
final class Plugin {

	/**
	 * Istanza singleton.
	 *
	 * @var Plugin|null
	 */
	private static ?Plugin $instance = null;

	/**
	 * Moduli registrati.
	 *
	 * @var Module[]
	 */
	private array $modules = array();

	/**
	 * Indica se il plugin e stato avviato.
	 *
	 * @var bool
	 */
	private bool $booted = false;

	/**
	 * Costruttore privato: usare instance().
	 */
	private function __construct() {}

	/**
	 * Restituisce l'istanza singleton.
	 */
	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Avvia il plugin registrando tutti i moduli (idempotente).
	 */
	public function boot(): void {
		if ( $this->booted ) {
			return;
		}

		$this->modules = array(
			new PostTypes(),
			new Fields(),
			new Rest(),
			new Security(),
			new DeployWebhook(),
			new LeadNotifier(),
			new FormsModule(),
			new SeedModule(),
		);

		foreach ( $this->modules as $module ) {
			$module->register();
		}

		add_action( 'plugins_loaded', array( Installer::class, 'maybe_install' ) );

		$this->booted = true;
	}
}
