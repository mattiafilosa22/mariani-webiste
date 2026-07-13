<?php
/**
 * Controller REST per le auto: lista e dettaglio.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Rest\Controllers;

use Mariani\Core\Rest\Presenters\AutoPresenter;
use Mariani\Core\Rest\Repositories\AutoRepository;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Espone GET /autos e GET /autos/{slug}.
 */
final class AutosController extends Controller {

	/**
	 * Repository auto.
	 *
	 * @var AutoRepository
	 */
	private AutoRepository $repository;

	/**
	 * Presenter auto.
	 *
	 * @var AutoPresenter
	 */
	private AutoPresenter $presenter;

	/**
	 * Inietta repository e presenter delle auto.
	 *
	 * @param AutoRepository $repository Repository auto.
	 * @param AutoPresenter  $presenter  Presenter auto.
	 */
	public function __construct( AutoRepository $repository, AutoPresenter $presenter ) {
		$this->repository = $repository;
		$this->presenter  = $presenter;
	}

	/**
	 * {@inheritDoc}
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace(),
			'/autos',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'public_access' ),
				'args'                => array(
					'lang' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
					'type' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
						'enum'              => array( 'nuova', 'usata', 'km0' ),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace(),
			'/autos/(?P<slug>[a-z0-9-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'public_access' ),
				'args'                => array(
					'slug' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_title',
						'required'          => true,
					),
					'lang' => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
	}

	/**
	 * GET /autos — lista DTO ridotti.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 */
	public function get_items( WP_REST_Request $request ): WP_REST_Response {
		$type  = $request->get_param( 'type' );
		$type  = is_string( $type ) && '' !== $type ? $type : null;
		$autos = $this->repository->find_all( $this->lang( $request ), $type );

		$data = array_map(
			fn ( $post ): array => $this->presenter->to_summary( $post ),
			$autos
		);

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * GET /autos/{slug} — DTO completo.
	 *
	 * @param WP_REST_Request $request Richiesta.
	 */
	public function get_item( WP_REST_Request $request ): WP_REST_Response {
		$slug = (string) $request->get_param( 'slug' );
		$auto = $this->repository->find_by_slug( $slug, $this->lang( $request ) );

		if ( null === $auto ) {
			return new WP_REST_Response(
				array( 'message' => __( 'Auto non trovata.', 'mariani-core' ) ),
				404
			);
		}

		return new WP_REST_Response( $this->presenter->to_detail( $auto ), 200 );
	}
}
