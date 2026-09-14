<?php
/**
 * Import idempotente del listino Ford nel CPT "auto".
 *
 * Uso (dalla root di WordPress):
 *   wp eval-file cms/tools/import-listino.php <file.csv>            # anteprima
 *   wp eval-file cms/tools/import-listino.php <file.csv> apply      # scrive
 *
 * CO2 e consumo arrivano dai listini ufficiali Ford come estremo superiore
 * dell'intervallo WLTP: e' il valore prudente da esporre al cliente.
 *
 * L'identita' del record e' il campo "ref" del CSV, salvato in
 * `_mariani_import_ref`: rilanciare l'import aggiorna le stesse schede
 * invece di duplicarle. Le auto create a mano restano intoccate.
 *
 * Lo stato di pubblicazione lo decide la colonna "stato" solo alla creazione:
 * sugli aggiornamenti non viene toccato, cosi' pubblicare o nascondere una
 * scheda dalla bacheca resta una decisione che l'import non ribalta.
 *
 * @package Mariani\Core
 */

// Niente declare(strict_types): il file viene eseguito via `wp eval-file`.
use Mariani\Core\Support\Schema;

defined( 'WP_CLI' ) || exit;

require_once __DIR__ . '/lib/import-rules.php';

const IMPORT_REF_META = '_mariani_import_ref';

// Senza lingua assegnata Polylang esclude il post dalle query del frontend:
// ogni veicolo viene creato in IT e EN e le due varianti vengono collegate.
const IMPORT_LANGS = array( 'it', 'en' );

// Condizioni commerciali comuni: senza queste il prezzo promo e' ingannevole.
const PROMO_NOTE     = 'Prezzo promozionale riservato a clienti privati, valido con permuta o rottamazione e finanziamento Ford Credit. Offerta valida per contratti entro il 30/09/2026 e immatricolazione entro il 31/10/2026. Immagini e dati a scopo illustrativo, salvo errori e variazioni di listino.';
const PROMO_SCADENZA = '2026-09-30';

/**
 * Legge il CSV in una lista di record associativi.
 *
 * @param string $path Percorso del file.
 * @return array<int,array<string,string>>
 */
function mariani_import_read_csv( string $path ): array {
	$handle = fopen( $path, 'rb' );

	if ( false === $handle ) {
		WP_CLI::error( sprintf( 'CSV non leggibile: %s', $path ) );
	}

	$header = fgetcsv( $handle );
	$rows   = array();

	while ( false !== ( $line = fgetcsv( $handle ) ) ) {
		if ( array( null ) === $line ) {
			continue;
		}
		$rows[] = array_combine( $header, $line );
	}

	fclose( $handle );

	return $rows;
}

/**
 * Trova il post gia' importato con quel riferimento.
 *
 * @param string $ref Riferimento stabile del record.
 * @return int|null ID del post, null se non esiste.
 */
function mariani_import_find( string $ref ): ?int {
	$found = get_posts(
		array(
			'post_type'        => Schema::CPT_AUTO,
			'post_status'      => 'any',
			'posts_per_page'   => 1,
			'fields'           => 'ids',
			'suppress_filters' => true,
			'lang'             => '',
			'meta_query'       => array(
				array(
					'key'   => IMPORT_REF_META,
					'value' => $ref,
				),
			),
		)
	);

	return $found ? (int) $found[0] : null;
}

/**
 * Assegna un termine alla tassonomia riusando lo slug se esiste gia'.
 *
 * @param int    $post_id  ID del post.
 * @param string $taxonomy Tassonomia.
 * @param string $name     Nome del termine.
 */
function mariani_import_term( int $post_id, string $taxonomy, string $name ): void {
	if ( '' === $name ) {
		return;
	}

	$term = term_exists( sanitize_title( $name ), $taxonomy );

	if ( ! $term ) {
		$term = term_exists( $name, $taxonomy );
	}

	if ( ! $term ) {
		$term = wp_insert_term( $name, $taxonomy );
	}

	if ( is_wp_error( $term ) ) {
		WP_CLI::warning( sprintf( '%s "%s": %s', $taxonomy, $name, $term->get_error_message() ) );
		return;
	}

	wp_set_object_terms( $post_id, array( (int) $term['term_id'] ), $taxonomy, false );
}

/**
 * Costruisce le meta del veicolo a partire dalla riga del CSV.
 *
 * @param array<string,string> $row Riga del CSV.
 * @return array<string,mixed>
 */
function mariani_import_meta( array $row ): array {
	$cv = '' !== $row['potenza_cv'] ? (int) $row['potenza_cv'] : null;

	$meta = array(
		'tipo_veicolo'          => 'nuova',
		'categoria'             => 'auto',
		'versione'              => $row['versione'],
		'codice_riferimento'    => $row['codice_riferimento'],
		'km'                    => 0,
		'porte'                 => $row['porte'],
		'cambio'                => $row['cambio'],
		'trazione'              => $row['trazione'],
		'cilindrata'            => '' !== $row['cilindrata'] ? (int) $row['cilindrata'] : null,
		'potenza_cv'            => $cv,
		'potenza_kw'            => null !== $cv ? (int) round( $cv * 0.7355 ) : null,
		'autonomia_elettrica'   => '' !== $row['autonomia_elettrica'] ? (int) $row['autonomia_elettrica'] : null,
		'co2'                   => '' !== $row['co2'] ? (int) $row['co2'] : null,
		'consumo_wltp'          => '' !== $row['consumo_wltp'] ? (float) $row['consumo_wltp'] : null,
		'prezzo_listino'        => (int) $row['prezzo_listino'],
		'sconto'                => '' !== $row['sconto'] ? (int) $row['sconto'] : null,
		'prezzo_promo'          => '' !== $row['prezzo_promo'] ? (int) $row['prezzo_promo'] : null,
		'testo_promo'           => PROMO_NOTE,
		'data_scadenza_offerta' => PROMO_SCADENZA,
		'pronta_consegna'       => '',
		'in_evidenza'           => mariani_import_is_featured( $row['ref'] ) ? '1' : '',
	);

	return $meta;
}

/**
 * Crea o aggiorna la scheda auto per una riga del CSV.
 *
 * @param array<string,string> $row   Riga del CSV.
 * @param bool                 $apply Se false esegue solo l'anteprima.
 * @return string Esito leggibile.
 */
function mariani_import_row( array $row, bool $apply ): string {
	$title    = trim( $row['marca'] . ' ' . $row['modello'] . ' ' . $row['versione'] );
	$existing = mariani_import_find( $row['ref'] . ':it' );
	$action   = null === $existing ? 'CREA' : 'AGGIORNA';

	$stato = 'pubblica' === ( $row['stato'] ?? '' ) ? 'pubblicata' : 'bozza';

	if ( ! $apply ) {
		return sprintf(
			'%-9s %-44s %7s -> %-7s %s',
			$action,
			$title,
			$row['prezzo_listino'],
			$row['prezzo_promo'],
			null === $existing ? $stato : 'stato invariato'
		);
	}

	$translations = array();

	foreach ( IMPORT_LANGS as $lang ) {
		$id = mariani_import_variant( $row, $title, $lang );

		if ( null === $id ) {
			return sprintf( 'ERRORE    %s', $title );
		}

		$translations[ $lang ] = $id;
	}

	if ( function_exists( 'pll_save_post_translations' ) && count( $translations ) > 1 ) {
		pll_save_post_translations( $translations );
	}

	return sprintf( '%-9s #%-6d %s', $action, $translations['it'], $title );
}

/**
 * Crea o aggiorna la variante linguistica di un veicolo.
 *
 * @param array<string,string> $row   Riga del CSV.
 * @param string               $title Titolo della scheda.
 * @param string               $lang  Slug lingua.
 * @return int|null ID del post, null in caso di errore.
 */
function mariani_import_variant( array $row, string $title, string $lang ) {
	$ref      = $row['ref'] . ':' . $lang;
	$existing = mariani_import_find( $ref );

	$content = 'en' === $lang
		? sprintf(
			'%s %s. Available at Mariani Concessionaria in Piombino: contact us for availability, a test drive and a tailored quote.',
			$title,
			$row['motorizzazione']
		)
		: sprintf(
			'%s %s. Disponibile presso Mariani Concessionaria a Piombino: contattaci per disponibilità, prova su strada e preventivo personalizzato.',
			$title,
			$row['motorizzazione']
		);

	$postarr = array(
		'post_type'    => Schema::CPT_AUTO,
		'post_title'   => $title,
		'post_name'    => 'it' === $lang ? $row['ref'] : $row['ref'] . '-en',
		'post_content' => $content,
	);

	if ( null !== $existing ) {
		// Senza post_status esplicito wp_insert_post riporterebbe il post a bozza.
		$postarr['ID']          = $existing;
		$postarr['post_status'] = get_post_status( $existing );
	} else {
		$postarr['post_status'] = 'pubblica' === ( $row['stato'] ?? '' ) ? 'publish' : 'draft';
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

	foreach ( mariani_import_meta( $row ) as $key => $value ) {
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

	return (int) $post_id;
}

$file  = $args[0] ?? '';
$apply = in_array( 'apply', (array) $args, true );

if ( '' === $file || ! file_exists( $file ) ) {
	WP_CLI::error( 'Indica il CSV: wp eval-file cms/tools/import-listino.php <file.csv> [apply]' );
}

$rows    = mariani_import_read_csv( $file );
$skipped = 0;

WP_CLI::log( $apply ? 'IMPORT (scrittura in bozza)' : 'ANTEPRIMA (nessuna scrittura) — aggiungi "apply" per scrivere' );

foreach ( $rows as $row ) {
	if ( '' === $row['prezzo_listino'] ) {
		++$skipped;
		continue;
	}

	WP_CLI::log( mariani_import_row( $row, $apply ) );
}

WP_CLI::success( sprintf( '%d righe elaborate, %d saltate.', count( $rows ) - $skipped, $skipped ) );
