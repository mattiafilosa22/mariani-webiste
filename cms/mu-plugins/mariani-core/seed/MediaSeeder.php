<?php
/**
 * Importa nella libreria media le foto reali delle auto e i segnaposto pagine.
 *
 * Per ogni veicolo del catalogo carica in modo idempotente le foto reali da
 * cms/seed/media/cars/<slug>/*.jpg (ordinate per nome) come galleria; la prima
 * e la copertina. I tre segnaposto editoriali (hero pagine) restano generati da
 * GD e servono anche come fallback per le auto senza foto.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed;

use Mariani\Core\Rest\Support\ImageTransformer;
use Mariani\Core\Seed\Data\Catalog;
use Mariani\Core\Seed\Support\MediaLibrary;
use Mariani\Core\Seed\Support\Placeholders;
use Mariani\Core\Seed\Support\SeedMeta;

defined( 'ABSPATH' ) || exit;

/**
 * Crea gli allegati (foto reali + segnaposto) e ne restituisce la libreria.
 */
final class MediaSeeder {

	/**
	 * Generatore dei file segnaposto (fallback per auto senza foto).
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
	 * Garantisce segnaposto e gallerie reali e restituisce la libreria media.
	 */
	public function seed(): MediaLibrary {
		$this->load_dependencies();

		return new MediaLibrary( $this->seed_placeholders(), $this->seed_galleries() );
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
	 * Garantisce i segnaposto editoriali (hero pagine) e ne mappa gli ID.
	 *
	 * @return array<string,int>
	 */
	private function seed_placeholders(): array {
		$library = array();

		foreach ( $this->placeholders->ensure() as $key => $path ) {
			$title = $this->placeholder_title( $key );
			$id    = $this->ensure_attachment( 'media:' . $key, $title, $title, $path );

			if ( null !== $id ) {
				$library[ $key ] = $id;
			}
		}

		return $this->seed_hero( $library );
	}

	/**
	 * Importa (idempotente) l'immagine hero della home come voce di libreria.
	 *
	 * La foto reale vive in cms/seed/media/hero-mache.jpg (stesso asset servito
	 * come fallback locale dal front-end); e risolta da MediaRef( 'hero-mache' ).
	 *
	 * @param array<string,int> $library Segnaposto gia risolti.
	 * @return array<string,int>
	 */
	private function seed_hero( array $library ): array {
		$path = $this->media_directory() . '/hero-mache.jpg';

		if ( ! is_file( $path ) ) {
			return $library;
		}

		$title = __( 'Ford Mustang Mach-E — showroom Mariani, Piombino', 'mariani-core' );
		$id    = $this->ensure_attachment( 'media:hero-mache', $title, $title, $path );

		if ( null !== $id ) {
			$library['hero-mache'] = $id;
		}

		return $library;
	}

	/**
	 * Importa le gallerie reali di tutte le auto del catalogo.
	 *
	 * @return array<string,array<int,int>>
	 */
	private function seed_galleries(): array {
		$galleries = array();

		foreach ( Catalog::autos() as $record ) {
			$slug               = (string) $record['ref'];
			$galleries[ $slug ] = $this->seed_car_gallery( $slug, (string) $record['title'] );
		}

		return $galleries;
	}

	/**
	 * Importa (idempotente) le foto reali di un veicolo come galleria ordinata.
	 *
	 * @param string $slug  Slug del veicolo (cartella foto).
	 * @param string $title Titolo del veicolo (per titolo/alt allegato).
	 * @return array<int,int> ID allegato in ordine.
	 */
	private function seed_car_gallery( string $slug, string $title ): array {
		$ids = array();
		$alt = $title . ' — Mariani Concessionaria, Piombino';

		foreach ( $this->car_files( $slug ) as $path ) {
			$ref = 'media:car:' . $slug . ':' . basename( $path );
			$id  = $this->ensure_attachment( $ref, $title, $alt, $path );

			if ( null !== $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * Elenca i file JPEG della cartella foto di un veicolo, ordinati per nome.
	 *
	 * @param string $slug Slug del veicolo.
	 * @return array<int,string> Percorsi assoluti.
	 */
	private function car_files( string $slug ): array {
		$dir = $this->cars_directory() . '/' . $slug;

		if ( ! is_dir( $dir ) ) {
			return array();
		}

		$files = glob( $dir . '/*.jpg' );

		if ( false === $files || array() === $files ) {
			return array();
		}

		sort( $files );

		return $files;
	}

	/**
	 * Directory radice delle cartelle foto per veicolo.
	 */
	private function cars_directory(): string {
		return $this->media_directory() . '/cars';
	}

	/**
	 * Directory radice degli asset seedati (segnaposto, hero, gallerie auto).
	 */
	private function media_directory(): string {
		return defined( 'MARIANI_SEED_MEDIA_DIR' ) ? (string) MARIANI_SEED_MEDIA_DIR : '/cms/seed/media';
	}

	/**
	 * Restituisce l'ID dell'allegato per l'impronta, creandolo se assente.
	 *
	 * @param string $ref   Impronta seeder univoca.
	 * @param string $title Titolo dell'allegato.
	 * @param string $alt   Testo alternativo.
	 * @param string $path  Percorso del file sorgente.
	 */
	private function ensure_attachment( string $ref, string $title, string $alt, string $path ): ?int {
		$existing = SeedMeta::find( $ref );

		if ( null !== $existing && 'attachment' === get_post_type( $existing ) ) {
			return $existing;
		}

		return $this->create_attachment( $ref, $title, $alt, $path );
	}

	/**
	 * Copia il file negli upload e crea l'allegato con i metadati immagine.
	 *
	 * @param string $ref   Impronta seeder.
	 * @param string $title Titolo dell'allegato.
	 * @param string $alt   Testo alternativo.
	 * @param string $path  Percorso del file sorgente.
	 */
	private function create_attachment( string $ref, string $title, string $alt, string $path ): ?int {
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
				'post_title'     => $title,
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

		update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt );
		SeedMeta::mark( $attachment_id, $ref );

		// Validazione difensiva: l'allegato deve produrre un DTO immagine valido.
		if ( null === $this->images->transform( $attachment_id ) ) {
			return null;
		}

		return $attachment_id;
	}

	/**
	 * Etichetta descrittiva (e alt) del segnaposto editoriale.
	 *
	 * @param string $key Chiave logica.
	 */
	private function placeholder_title( string $key ): string {
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
