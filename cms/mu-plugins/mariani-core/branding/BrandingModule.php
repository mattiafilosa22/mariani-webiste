<?php
/**
 * Branding wp-admin: logo Mariani nella schermata di accesso e favicon.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Branding;

use Mariani\Core\Module;

defined( 'ABSPATH' ) || exit;

/**
 * Sostituisce il logo WordPress nella pagina di login e imposta la favicon
 * del back-office (login + wp-admin) con gli asset del brand Mariani.
 */
final class BrandingModule implements Module {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'login_enqueue_scripts', array( $this, 'login_styles' ) );
		add_filter( 'login_headerurl', array( $this, 'login_url' ) );
		add_filter( 'login_headertext', array( $this, 'login_text' ) );
		add_action( 'login_head', array( $this, 'favicon' ) );
		add_action( 'admin_head', array( $this, 'favicon' ) );
	}

	/**
	 * Inietta il CSS che sostituisce il logo di default con quello Mariani.
	 */
	public function login_styles(): void {
		$logo = esc_url( $this->asset_url( 'logo.png' ) );
		?>
		<style>
			/* !important: questo blocco e' stampato prima del foglio di stile core
				(wp-admin/css/login.min.css), che altrimenti vince a parita' di
				specificita' essendo dichiarato dopo. */
			.login h1 a {
				background-image: url('<?php echo esc_url( $logo ); ?>') !important;
				background-size: contain !important;
				background-position: center !important;
				background-repeat: no-repeat !important;
				width: 280px !important;
				height: 130px !important;
				margin-bottom: 8px !important;
			}
		</style>
		<?php
	}

	/**
	 * Punta il link del logo alla home del sito invece che a wordpress.org.
	 */
	public function login_url(): string {
		return home_url( '/' );
	}

	/**
	 * Testo accessibile del link del logo (nome del sito al posto di "WordPress").
	 */
	public function login_text(): string {
		return get_bloginfo( 'name' );
	}

	/**
	 * Favicon del back-office (login + wp-admin), coerente con quella del sito.
	 */
	public function favicon(): void {
		$icon = esc_url( $this->asset_url( 'favicon.png' ) );
		echo '<link rel="icon" href="' . esc_url( $icon ) . '" sizes="192x192">' . "\n";
	}

	/**
	 * URL di un asset statico della cartella branding/assets del plugin.
	 *
	 * @param string $filename Nome del file in branding/assets/.
	 */
	private function asset_url( string $filename ): string {
		return plugins_url( 'assets/' . $filename, __FILE__ );
	}
}
