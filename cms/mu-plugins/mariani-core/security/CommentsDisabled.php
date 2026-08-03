<?php
/**
 * Disattiva completamente i commenti: in un CMS headless non hanno senso.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Security;

use Mariani\Core\Module;

defined( 'ABSPATH' ) || exit;

/**
 * Rimuove commenti e trackback da interfaccia, API e contenuti.
 *
 * Il frontend e un export statico: un commento non verrebbe mai mostrato, ma
 * la superficie resterebbe aperta a spam e pingback usati come vettore di
 * attacco. Qui si chiude tutto: niente form, niente voci di menu, niente
 * endpoint REST, e i post type non dichiarano piu il supporto.
 */
final class CommentsDisabled implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_filter( 'comments_open', '__return_false', PHP_INT_MAX );
		add_filter( 'pings_open', '__return_false', PHP_INT_MAX );
		add_filter( 'comments_array', '__return_empty_array', PHP_INT_MAX );

		add_action( 'init', array( $this, 'drop_post_type_support' ), 100 );
		add_action( 'admin_menu', array( $this, 'hide_admin_menu' ) );
		add_action( 'wp_dashboard_setup', array( $this, 'hide_dashboard_widget' ) );
		add_action( 'admin_bar_menu', array( $this, 'hide_admin_bar_node' ), 999 );

		add_filter( 'rest_endpoints', array( $this, 'remove_rest_endpoints' ) );
		add_filter( 'xmlrpc_methods', array( $this, 'remove_xmlrpc_methods' ) );
	}

	/**
	 * Toglie il supporto ai commenti da tutti i post type registrati.
	 */
	public function drop_post_type_support(): void {
		foreach ( get_post_types() as $post_type ) {
			if ( post_type_supports( $post_type, 'comments' ) ) {
				remove_post_type_support( $post_type, 'comments' );
			}

			if ( post_type_supports( $post_type, 'trackbacks' ) ) {
				remove_post_type_support( $post_type, 'trackbacks' );
			}
		}
	}

	/**
	 * Nasconde la voce "Commenti" dal menu di amministrazione.
	 */
	public function hide_admin_menu(): void {
		remove_menu_page( 'edit-comments.php' );
		remove_submenu_page( 'options-general.php', 'options-discussion.php' );
	}

	/**
	 * Rimuove il widget "Commenti recenti" dalla bacheca.
	 */
	public function hide_dashboard_widget(): void {
		remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
	}

	/**
	 * Rimuove il contatore commenti dalla barra di amministrazione.
	 *
	 * @param \WP_Admin_Bar $admin_bar Barra corrente.
	 */
	public function hide_admin_bar_node( $admin_bar ): void {
		if ( $admin_bar instanceof \WP_Admin_Bar ) {
			$admin_bar->remove_node( 'comments' );
		}
	}

	/**
	 * Elimina le rotte REST dei commenti.
	 *
	 * @param array<string, mixed> $endpoints Rotte registrate.
	 * @return array<string, mixed>
	 */
	public function remove_rest_endpoints( array $endpoints ): array {
		foreach ( array_keys( $endpoints ) as $route ) {
			if ( is_string( $route ) && str_starts_with( $route, '/wp/v2/comments' ) ) {
				unset( $endpoints[ $route ] );
			}
		}

		return $endpoints;
	}

	/**
	 * Disattiva i metodi XML-RPC legati a commenti e pingback.
	 *
	 * @param array<string, mixed> $methods Metodi esposti.
	 * @return array<string, mixed>
	 */
	public function remove_xmlrpc_methods( array $methods ): array {
		unset(
			$methods['pingback.ping'],
			$methods['pingback.extensions.getPingbacks'],
			$methods['wp.newComment']
		);

		return $methods;
	}
}
