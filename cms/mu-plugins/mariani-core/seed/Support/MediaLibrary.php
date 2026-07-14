<?php
/**
 * Libreria media seedata: immagini segnaposto (pagine) e gallerie reali (auto).
 *
 * Struttura immutabile passata ad AutoSeeder e PageSeeder al posto della vecchia
 * mappa piatta chiave => ID: separa i segnaposto editoriali (una immagine per
 * chiave logica) dalle gallerie delle auto (piu immagini per slug veicolo).
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed\Support;

defined( 'ABSPATH' ) || exit;

/**
 * Contiene gli ID allegato risolti dal MediaSeeder, per chiave o per slug.
 */
final class MediaLibrary {

	/**
	 * Segnaposto editoriali: chiave logica (es. "esterno-fronte") => ID allegato.
	 *
	 * @var array<string,int>
	 */
	private array $placeholders;

	/**
	 * Gallerie reali delle auto: slug veicolo => lista ordinata di ID allegato.
	 *
	 * @var array<string,array<int,int>>
	 */
	private array $galleries;

	/**
	 * Costruisce la libreria a partire dai due insiemi risolti.
	 *
	 * @param array<string,int>            $placeholders Segnaposto editoriali.
	 * @param array<string,array<int,int>> $galleries    Gallerie per slug.
	 */
	public function __construct( array $placeholders, array $galleries ) {
		$this->placeholders = $placeholders;
		$this->galleries    = $galleries;
	}

	/**
	 * ID dell'immagine segnaposto per la chiave logica, oppure null.
	 *
	 * @param string $key Chiave logica (es. "esterno-fronte").
	 */
	public function placeholder( string $key ): ?int {
		return $this->placeholders[ $key ] ?? null;
	}

	/**
	 * Galleria (ID allegato ordinati) del veicolo con lo slug indicato.
	 *
	 * @param string $slug Slug del veicolo (cartella foto).
	 * @return array<int,int>
	 */
	public function gallery( string $slug ): array {
		return $this->galleries[ $slug ] ?? array();
	}

	/**
	 * Numero totale di allegati disponibili (segnaposto + gallerie).
	 */
	public function total(): int {
		$total = count( $this->placeholders );

		foreach ( $this->galleries as $ids ) {
			$total += count( $ids );
		}

		return $total;
	}
}
