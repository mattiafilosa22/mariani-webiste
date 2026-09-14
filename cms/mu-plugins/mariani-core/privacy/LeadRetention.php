<?php
/**
 * Conservazione limitata dei lead raccolti dal sito.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Privacy;

use Mariani\Core\Forms\FluentFormsGateway;
use Mariani\Core\Forms\LeadFormProvisioner;
use Mariani\Core\Module;
use Mariani\Core\Support\Schema;
use WP_Query;

defined( 'ABSPATH' ) || exit;

/** Pianifica e applica la cancellazione dei lead più vecchi di 12 mesi. */
final class LeadRetention implements Module {

	/** Hook WP-Cron pubblico per verifiche operative. */
	public const HOOK = 'mariani_purge_expired_leads';

	/** Massimo numero di record eliminati per singola esecuzione. */
	private const BATCH_SIZE = 200;

	/**
	 * Gateway opzionale verso le copie conservate da Fluent Forms.
	 *
	 * @var FluentFormsGateway
	 */
	private FluentFormsGateway $forms;

	/**
	 * Inietta il gateway verso Fluent Forms.
	 *
	 * @param FluentFormsGateway $forms Gateway Fluent Forms.
	 */
	public function __construct( FluentFormsGateway $forms ) {
		$this->forms = $forms;
	}

	/** {@inheritDoc} */
	public function register(): void {
		add_action( 'init', array( $this, 'schedule' ) );
		add_action( self::HOOK, array( $this, 'purge' ) );
	}

	/** Garantisce una sola esecuzione giornaliera. */
	public function schedule(): void {
		if ( ! wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::HOOK );
		}
	}

	/**
	 * Elimina in batch i lead e le submission anteriori al cutoff.
	 *
	 * @return array{posts:int,submissions:int} Conteggi privi di dati personali.
	 */
	public function purge(): array {
		$cutoff = gmdate( 'Y-m-d H:i:s', strtotime( '-12 months', time() ) );
		$query  = new WP_Query(
			array(
				'post_type'      => Schema::CPT_LEAD,
				'post_status'    => 'private',
				'fields'         => 'ids',
				'posts_per_page' => self::BATCH_SIZE,
				'orderby'        => 'ID',
				'order'          => 'ASC',
				'no_found_rows'  => true,
				'date_query'     => array(
					array(
						'column'    => 'post_date_gmt',
						'before'    => $cutoff,
						'inclusive' => false,
					),
				),
			)
		);

		$deleted = 0;
		foreach ( $query->posts as $post_id ) {
			if ( false !== wp_delete_post( (int) $post_id, true ) ) {
				++$deleted;
			}
		}

		$form_id     = (int) get_option( LeadFormProvisioner::OPTION_FORM_ID, 0 );
		$submissions = $this->forms->delete_submissions_before( $form_id, $cutoff, self::BATCH_SIZE );

		return array(
			'posts'       => $deleted,
			'submissions' => $submissions,
		);
	}
}
