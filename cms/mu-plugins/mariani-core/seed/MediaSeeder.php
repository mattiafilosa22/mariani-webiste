<?php
/**
 * Importa i JPEG segnaposto nella libreria media in modo idempotente.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed;

use Mariani\Core\Rest\Support\ImageTransformer;
use Mariani\Core\Seed\Support\Placeholders;
use Mariani\Core\Seed\Support\SeedMeta;

defined( 'ABSPATH' ) || exit;

/**
 * Crea gli allegati segnaposto e ne restituisce gli ID riutilizzabili.
 */
final class MediaSeeder {

	/**
	 * Generatore dei file segnaposto.
	 *
	 * @var Placeholders
	 */
	private Placeholders $placeholders;

	/**
	 * Trasformatore immagini, usato per validare il DTO risultante.
	 *
	 * @var ImageTransformer
	 */
	private ImageTransformer $images;

	/**
	 * Inietta le dipendenze del seeder media.
	 *
	 * @param Placeholders     $placeholders Generatore file segnaposto.
	 * @param ImageTransformer $images       Trasformatore immagini.
	 */
	public function __construct( Placeholders $placeholders, ImageTransformer $images ) {
		$this->placeholders = $placeholders;
		$this->images       = $images;
	}

	/**
	 * Garantisce gli allegati segnaposto e restituisce la mappa chiave => ID.
	 *
	 * @return array<string,int>
	 */
	public function seed(): array {
		$this->load_dependencies();

		$library = array();

		foreach ( $this->placeholders->ensure() as $key => $path ) {
			$attachment_id = $this->ensure_attachment( $key, $path );

			if ( null !== $attachment_id ) {
				$library[ $key ] = $attachment_id;
			}
		}

		return $library;
	}

	/**
	 * Rimuove gli allegati generati dal seeder (usato con --fresh).
	 *
	 * @return int Numero di allegati eliminati.
	 */
	public function purge(): int {
		$deleted = 0;

		foreach ( SeedMeta::all_of_type( 'attachment' ) as $attachment_id ) {
			if ( wp_delete_attachment( $attachment_id, true ) ) {
				++$deleted;
			}
		}

		return $deleted;
	}

	/**
	 * Restituisce l'ID dell'allegato per la chiave, creandolo se assente.
	 *
	 * @param string $key  Chiave logica del segnaposto.
	 * @param string $path Percorso del file sorgente.
	 */
	private function ensure_attachment( string $key, string $path ): ?int {
		$ref      = 'media:' . $key;
		$existing = SeedMeta::find( $ref );

		if ( null !== $existing && 'attachment' === get_post_type( $existing ) ) {
			return $existing;
		}

		return $this->create_attachment( $ref, $key, $path );
	}

	/**
	 * Copia il file negli upload e crea l'allegato con i metadati immagine.
	 *
	 * @param string $ref  Impronta seeder.
	 * @param string $key  Chiave logica del segnaposto.
	 * @param string $path Percorso del file sorgente.
	 */
	private function create_attachment( string $ref, string $key, string $path ): ?int {
		$bytes = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- file locale del repository, non remoto.

		if ( false === $bytes ) {
			return null;
		}

		$upload = wp_upload_bits( basename( $path ), null, $bytes );

		if ( ! empty( $upload['error'] ) || empty( $upload['file'] ) ) {
			return null;
		}

		$file = (string) $upload['file'];

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => 'image/jpeg',
				'post_title'     => $this->title( $key ),
				'post_status'    => 'inherit',
				'guid'           => (string) $upload['url'],
			),
			$file,
			0,
			true
		);

		if ( is_wp_error( $attachment_id ) ) {
			return null;
		}

		$attachment_id = (int) $attachment_id;

		$metadata = wp_generate_attachment_metadata( $attachment_id, $file );
		wp_update_attachment_metadata( $attachment_id, $metadata );

		update_post_meta( $attachment_id, '_wp_attachment_image_alt', $this->title( $key ) );
		SeedMeta::mark( $attachment_id, $ref );

		// Validazione difensiva: l'allegato deve produrre un DTO immagine valido.
		if ( null === $this->images->transform( $attachment_id ) ) {
			return null;
		}

		return $attachment_id;
	}

	/**
	 * Etichetta descrittiva (e alt) del segnaposto.
	 *
	 * @param string $key Chiave logica.
	 */
	private function title( string $key ): string {
		$labels = array(
			'esterno-fronte' => __( 'Mariani — vista anteriore (immagine dimostrativa)', 'mariani-core' ),
			'esterno-lato'   => __( 'Mariani — vista laterale (immagine dimostrativa)', 'mariani-core' ),
			'abitacolo'      => __( 'Mariani — abitacolo (immagine dimostrativa)', 'mariani-core' ),
		);

		return $labels[ $key ] ?? __( 'Mariani — immagine dimostrativa', 'mariani-core' );
	}

	/**
	 * Carica le funzioni di wp-admin necessarie a generare i metadati immagine.
	 */
	private function load_dependencies(): void {
		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}

		if ( ! function_exists( 'wp_read_image_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}
	}
}
