<?php
/**
 * Import idempotente dello stock (nuove fuori listino, km0, usate) nel CPT "auto".
 *
 * Uso (dalla root di WordPress):
 *   wp eval-file cms/tools/import-stock.php <file.csv>            # anteprima
 *   wp eval-file cms/tools/import-stock.php <file.csv> apply      # scrive
 *
 * Gemello di import-listino.php per le auto che il listino Ford non copre: tipo,
 * anno, km e colore arrivano dal CSV, niente nota promo. Prezzo vuoto = "Prezzo
 * su richiesta" (la meta viene tolta, non scritta a 0).
 *
 * Colonna "titolo": facoltativa, per quando il nome del modello ripete la marca
 * (termine "Omoda 5" → titolo "Omoda 5 SHS FHEV", non "Omoda Omoda 5 …").
 *
 * Colonna "foto":
 *   - vuota: nessuna galleria (il front-end mostra "foto non disponibile");
 *   - "seed:<cartella>": le foto caricate dal MediaSeeder da cms/seed/media/cars/<cartella>;
 *   - "listino:<ref>": la stessa galleria della scheda di listino con quel ref.
 *
 * Identita', lingue IT/EN e stato di pubblicazione come nell'import del listino:
 * lo stato del CSV vale solo alla creazione.
 *
 * @package Mariani\Core
 */

// Niente declare(strict_types): il file viene eseguito via `wp eval-file`.
use Mariani\Core\Seed\Support\SeedMeta;
use Mariani\Core\Support\Schema;

defined( 'WP_CLI' ) || exit;

require_once __DIR__ . '/lib/import-wp.php';

const STOCK_LANGS = array( 'it', 'en' );

/**
 * Legge il CSV in una lista di record associativi.
 *
 * @param string $path Percorso del file.
 * @return array<int,array<string,string>>
 */
function mariani_stock_read_csv( string $path ): array {
	$handle = fopen( $path, 'rb' );

	if ( false === $handle ) {
		WP_CLI::error( sprintf( 'CSV non leggibile: %s', $path ) );
	}

	$header = fgetcsv( $handle );
	$rows   = array();

	while ( false !== ( $line = fgetcsv( $handle ) ) ) {
		if ( array( null ) !== $line ) {
			$rows[] = array_combine( $header, $line );
		}
	}

	fclose( $handle );

	return $rows;
}

/**
 * Intero da una cella, null se vuota.
 *
 * @param string $value Cella del CSV.
 */
function mariani_stock_int( string $value ): ?int {
	return '' === trim( $value ) ? null : (int) $value;
}

/**
 * Meta del veicolo a partire dalla riga del CSV.
 *
 * @param array<string,string> $row Riga del CSV.
 * @return array<string,mixed>
 */
function mariani_stock_meta( array $row ): array {
	$cv = mariani_stock_int( $row['potenza_cv'] );

	return array(
		'tipo_veicolo'          => $row['tipo'],
		'categoria'             => $row['categoria'],
		'versione'              => $row['versione'],
		'anno_immatricolazione' => $row['anno'],
		'km'                    => (int) $row['km'],
		'cambio'                => $row['cambio'],
		'trazione'              => $row['trazione'],
		'cilindrata'            => mariani_stock_int( $row['cilindrata'] ),
		'potenza_cv'            => $cv,
		'potenza_kw'            => null !== $cv ? (int) round( $cv * 0.7355 ) : null,
		'co2'                   => mariani_stock_int( $row['co2'] ),
		'porte'                 => $row['porte'],
		'colore_esterno'        => $row['colore'],
		'colore_esterno_hex'    => $row['colore_hex'],
		'prezzo_listino'        => mariani_stock_int( $row['prezzo_listino'] ),
		'sconto'                => null,
		'prezzo_promo'          => null,
		'testo_promo'           => null,
		'data_scadenza_offerta' => null,
		'neopatentati'          => '1' === $row['neopatentati'] ? '1' : null,
		'garanzia'              => $row['garanzia'],
		'in_evidenza'           => '1' === $row['in_evidenza'] ? '1' : null,
	);
}

/**
 * Allegati della galleria indicata dalla colonna "foto", in ordine.
 *
 * @param string $foto Valore della colonna.
 * @return array<int,int>
 */
function mariani_stock_gallery( string $foto ): array {
	if ( str_starts_with( $foto, 'listino:' ) ) {
		$source = mariani_import_find( substr( $foto, strlen( 'listino:' ) ) . ':it' );

		return null === $source ? array() : array_map( 'intval', get_post_meta( $source, Schema::meta( 'galleria' ) ) );
	}

	if ( ! str_starts_with( $foto, 'seed:' ) ) {
		return array();
	}

	$prefix = 'media:car:' . substr( $foto, strlen( 'seed:' ) ) . ':';
	$found  = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- import da CLI su poche decine di allegati.
			'meta_query'     => array(
				array(
					'key'     => SeedMeta::META_KEY,
					'value'   => $prefix,
					'compare' => 'LIKE',
				),
			),
		)
	);

	$by_ref = array();

	foreach ( $found as $id ) {
		$by_ref[ (string) get_post_meta( $id, SeedMeta::META_KEY, true ) ] = (int) $id;
	}

	ksort( $by_ref );

	return array_values( $by_ref );
}

/**
 * Sostituisce galleria e copertina della scheda.
 *
 * @param int            $post_id     ID del post.
 * @param array<int,int> $attachments Allegati in ordine.
 */
function mariani_stock_write_gallery( int $post_id, array $attachments ): void {
	$key = Schema::meta( 'galleria' );
	delete_post_meta( $post_id, $key );

	foreach ( $attachments as $attachment_id ) {
		add_post_meta( $post_id, $key, $attachment_id );
	}

	if ( array() === $attachments ) {
		delete_post_thumbnail( $post_id );

		return;
	}

	set_post_thumbnail( $post_id, $attachments[0] );
}

/**
 * Testo della scheda nella lingua indicata.
 *
 * @param array<string,string> $row   Riga del CSV.
 * @param string               $title Titolo della scheda.
 * @param string               $lang  Slug lingua.
 */
function mariani_stock_content( array $row, string $title, string $lang ): string {
	$used = 'nuova' !== $row['tipo'];

	if ( 'en' === $lang ) {
		$detail = $used ? sprintf( ' First registered %s, %s km.', $row['anno'], number_format( (int) $row['km'], 0, '.', ',' ) ) : '';

		return sprintf( '%s %s.%s Available at Mariani Concessionaria in Piombino: contact us for availability, a test drive and a tailored quote.', $title, $row['motorizzazione'], $detail );
	}

	$detail = $used ? sprintf( ' Immatricolata nel %s, %s km.', $row['anno'], number_format( (int) $row['km'], 0, ',', '.' ) ) : '';

	return sprintf( '%s %s.%s Disponibile presso Mariani Concessionaria a Piombino: contattaci per disponibilità, prova su strada e preventivo personalizzato.', $title, $row['motorizzazione'], $detail );
}

/**
 * Crea o aggiorna la variante linguistica di un veicolo.
 *
 * @param array<string,string> $row         Riga del CSV.
 * @param string               $title       Titolo della scheda.
 * @param string               $lang        Slug lingua.
 * @param array<int,int>       $attachments Galleria.
 * @return int|null ID del post, null in caso di errore.
 */
function mariani_stock_variant( array $row, string $title, string $lang, array $attachments ): ?int {
	$ref      = $row['ref'] . ':' . $lang;
	$existing = mariani_import_find( $ref );

	$postarr = array(
		'post_type'    => Schema::CPT_AUTO,
		'post_title'   => $title,
		'post_name'    => 'it' === $lang ? $row['ref'] : $row['ref'] . '-en',
		'post_content' => mariani_stock_content( $row, $title, $lang ),
	);

	if ( null !== $existing ) {
		// Senza post_status esplicito wp_insert_post riporterebbe il post a bozza.
		$postarr['ID']          = $existing;
		$postarr['post_status'] = get_post_status( $existing );
	} else {
		$postarr['post_status'] = 'pubblica' === $row['stato'] ? 'publish' : 'draft';
	}

	$post_id = wp_insert_post( $postarr, true );

	if ( is_wp_error( $post_id ) ) {
		WP_CLI::warning( sprintf( '%s: %s', $ref, $post_id->get_error_message() ) );

		return null;
	}

	if ( function_exists( 'pll_set_post_language' ) ) {
		pll_set_post_language( $post_id, $lang );
	}

	update_post_meta( $post_id, IMPORT_REF_META, $ref );

	foreach ( mariani_stock_meta( $row ) as $key => $value ) {
		$meta_key = Schema::meta( $key );

		if ( null === $value || '' === $value ) {
			delete_post_meta( $post_id, $meta_key );
			continue;
		}

		update_post_meta( $post_id, $meta_key, $value );
	}

	mariani_import_term( $post_id, Schema::TAX_MARCA, $row['marca'] );
	mariani_import_term( $post_id, Schema::TAX_MODELLO, $row['modello'] );
	mariani_import_term( $post_id, Schema::TAX_ALIMENTAZIONE, $row['alimentazione'] );
	mariani_import_term( $post_id, Schema::TAX_CARROZZERIA, $row['carrozzeria'] );
	mariani_stock_write_gallery( (int) $post_id, $attachments );

	return (int) $post_id;
}

/**
 * Crea o aggiorna la scheda (IT + EN) per una riga del CSV.
 *
 * @param array<string,string> $row   Riga del CSV.
 * @param bool                 $apply Se false esegue solo l'anteprima.
 * @return string Esito leggibile.
 */
function mariani_stock_row( array $row, bool $apply ): string {
	$title       = '' !== $row['titolo'] ? $row['titolo'] : trim( $row['marca'] . ' ' . $row['modello'] . ' ' . $row['versione'] );
	$existing    = mariani_import_find( $row['ref'] . ':it' );
	$action      = null === $existing ? 'CREA' : 'AGGIORNA';
	$attachments = mariani_stock_gallery( $row['foto'] );
	$price       = '' === $row['prezzo_listino'] ? 'su richiesta' : $row['prezzo_listino'] . ' €';

	if ( ! $apply ) {
		return sprintf(
			'%-9s %-6s %-40s %-13s %2d foto  %s',
			$action,
			$row['tipo'],
			$title,
			$price,
			count( $attachments ),
			null === $existing ? ( 'pubblica' === $row['stato'] ? 'pubblicata' : 'bozza' ) : 'stato invariato'
		);
	}

	$translations = array();

	foreach ( STOCK_LANGS as $lang ) {
		$id = mariani_stock_variant( $row, $title, $lang, $attachments );

		if ( null === $id ) {
			return sprintf( 'ERRORE    %s', $title );
		}

		$translations[ $lang ] = $id;
	}

	if ( function_exists( 'pll_save_post_translations' ) ) {
		pll_save_post_translations( $translations );
	}

	return sprintf( '%-9s #%-6d %s', $action, $translations['it'], $title );
}

$file  = $args[0] ?? '';
$apply = in_array( 'apply', (array) $args, true );

if ( '' === $file || ! file_exists( $file ) ) {
	WP_CLI::error( 'Indica il CSV: wp eval-file cms/tools/import-stock.php <file.csv> [apply]' );
}

$rows = mariani_stock_read_csv( $file );

WP_CLI::log( $apply ? 'IMPORT STOCK (scrittura)' : 'ANTEPRIMA (nessuna scrittura) — aggiungi "apply" per scrivere' );

foreach ( $rows as $row ) {
	WP_CLI::log( mariani_stock_row( $row, $apply ) );
}

WP_CLI::success( sprintf( '%d righe elaborate.', count( $rows ) ) );
