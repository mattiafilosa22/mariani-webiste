<?php
/**
 * Genera immagini JPEG segnaposto per la galleria delle auto di demo.
 *
 * Gli asset reali (foto raccolte a mano) sostituiranno questi segnaposto in
 * seguito. I file vengono creati una sola volta e riusati: la generazione e
 * idempotente e non sovrascrive file esistenti.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Produce (se assenti) i JPEG segnaposto e ne restituisce i percorsi.
 */
final class Placeholders {

	/**
	 * Larghezza dei segnaposto in pixel (sufficiente per tutte le image-size).
	 *
	 * @var int
	 */
	private const WIDTH = 1200;

	/**
	 * Altezza dei segnaposto in pixel.
	 *
	 * @var int
	 */
	private const HEIGHT = 800;

	/**
	 * Definizione dei segnaposto: chiave => [etichetta, colore RGB di sfondo].
	 *
	 * @var array<string,array{0:string,1:array{0:int,1:int,2:int}}>
	 */
	private const ASSETS = array(
		'esterno-fronte' => array( 'Vista anteriore', array( 30, 58, 95 ) ),
		'esterno-lato'   => array( 'Vista laterale', array( 55, 65, 81 ) ),
		'abitacolo'      => array( 'Abitacolo', array( 24, 24, 27 ) ),
	);

	/**
	 * Directory di destinazione dei segnaposto.
	 *
	 * @var string
	 */
	private string $directory;

	/**
	 * Risolve la directory dei segnaposto (montaggio cms/seed/media o fallback).
	 */
	public function __construct() {
		$this->directory = $this->resolve_directory();
	}

	/**
	 * Garantisce l'esistenza dei file e ne restituisce i percorsi assoluti.
	 *
	 * @return array<string,string> Mappa chiave => percorso file JPEG.
	 */
	public function ensure(): array {
		$paths = array();

		foreach ( self::ASSETS as $key => $asset ) {
			$path = trailingslashit( $this->directory ) . 'placeholder-' . $key . '.jpg';

			if ( ! file_exists( $path ) ) {
				$this->render( $path, (string) $asset[0], $asset[1] );
			}

			if ( file_exists( $path ) ) {
				$paths[ $key ] = $path;
			}
		}

		return $paths;
	}

	/**
	 * Determina e crea (se necessario) la directory dei segnaposto.
	 */
	private function resolve_directory(): string {
		$preferred = defined( 'MARIANI_SEED_MEDIA_DIR' ) ? (string) MARIANI_SEED_MEDIA_DIR : '/cms/seed/media';

		if ( ! is_dir( $preferred ) ) {
			wp_mkdir_p( $preferred );
		}

		if ( is_dir( $preferred ) && wp_is_writable( $preferred ) ) {
			return $preferred;
		}

		$fallback = trailingslashit( get_temp_dir() ) . 'mariani-seed-media';
		wp_mkdir_p( $fallback );

		return $fallback;
	}

	/**
	 * Disegna un JPEG segnaposto con etichetta centrata.
	 *
	 * @param string                   $path  Percorso di destinazione.
	 * @param string                   $label Testo mostrato al centro.
	 * @param array{0:int,1:int,2:int} $rgb Colore di sfondo.
	 */
	private function render( string $path, string $label, array $rgb ): void {
		if ( ! function_exists( 'imagecreatetruecolor' ) ) {
			return;
		}

		$image = imagecreatetruecolor( self::WIDTH, self::HEIGHT );

		if ( false === $image ) {
			return;
		}

		$background = imagecolorallocate( $image, $rgb[0], $rgb[1], $rgb[2] );
		$foreground = imagecolorallocate( $image, 226, 232, 240 );
		imagefilledrectangle( $image, 0, 0, self::WIDTH, self::HEIGHT, $background );

		$brand = 'MARIANI';
		imagestring( $image, 5, $this->center_x( strlen( $brand ), 5 ), 320, $brand, $foreground );
		imagestring( $image, 5, $this->center_x( strlen( $label ), 5 ), 360, $label, $foreground );
		imagestring( $image, 3, $this->center_x( 22, 3 ), 400, 'immagine dimostrativa', $foreground );

		imagejpeg( $image, $path, 82 );
		imagedestroy( $image );
	}

	/**
	 * Calcola la X iniziale per centrare un testo a larghezza fissa GD.
	 *
	 * @param int $length    Numero di caratteri.
	 * @param int $font_size Indice del font GD integrato.
	 */
	private function center_x( int $length, int $font_size ): int {
		$char_width = imagefontwidth( $font_size );

		return (int) max( 0, ( self::WIDTH - ( $length * $char_width ) ) / 2 );
	}
}
