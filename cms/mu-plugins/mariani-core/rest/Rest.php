<?php
/**
 * Modulo REST: compone repository/presenter/controller e registra le rotte.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest;

use Mariani\Core\Module;
use Mariani\Core\Rest\Controllers\AutosController;
use Mariani\Core\Rest\Controllers\Controller;
use Mariani\Core\Rest\Controllers\LeadController;
use Mariani\Core\Rest\Controllers\PagesController;
use Mariani\Core\Rest\Controllers\SettingsController;
use Mariani\Core\Rest\Presenters\AutoPresenter;
use Mariani\Core\Rest\Presenters\PagePresenter;
use Mariani\Core\Rest\Presenters\SettingsPresenter;
use Mariani\Core\Rest\Repositories\AutoRepository;
use Mariani\Core\Rest\Repositories\LeadRepository;
use Mariani\Core\Rest\Repositories\PageRepository;
use Mariani\Core\Rest\Repositories\SettingsRepository;
use Mariani\Core\Rest\Support\ImageTransformer;

defined( 'ABSPATH' ) || exit;

/**
 * Radice di composizione del layer API (namespace mariani/v1).
 */
final class Rest implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Istanzia i controller con le loro dipendenze e ne registra le rotte.
	 */
	public function register_routes(): void {
		foreach ( $this->controllers() as $controller ) {
			$controller->register_routes();
		}
	}

	/**
	 * Costruisce i controller iniettando repository e presenter.
	 *
	 * @return Controller[]
	 */
	private function controllers(): array {
		$images = new ImageTransformer();

		return array(
			new AutosController(
				new AutoRepository(),
				new AutoPresenter( $images )
			),
			new PagesController(
				new PageRepository(),
				new PagePresenter()
			),
			new SettingsController(
				new SettingsRepository(),
				new SettingsPresenter( $images )
			),
			new LeadController(
				new LeadRepository()
			),
		);
	}
}
