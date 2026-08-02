<?php
/**
 * Snippet di configurazione consigliato per Mariani Core.
 *
 * Copiare queste costanti dentro wp-config.php (prima della riga
 * "That's all, stop editing!"). NON committare i valori reali dei token.
 *
 * @package Mariani\Core
 */

defined( 'ABSPATH' ) || exit;

/*
 * -------------------------------------------------------------------------
 * Aggiornamenti automatici — disattivati (gestione manuale controllata).
 * -------------------------------------------------------------------------
 */
if ( ! defined( 'WP_AUTO_UPDATE_CORE' ) ) {
	define( 'WP_AUTO_UPDATE_CORE', false );
}
if ( ! defined( 'AUTOMATIC_UPDATER_DISABLED' ) ) {
	define( 'AUTOMATIC_UPDATER_DISABLED', true );
}

/*
 * -------------------------------------------------------------------------
 * Hardening: blocco editor file e installazioni dalla dashboard.
 * -------------------------------------------------------------------------
 */
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

/*
 * Decommentare per bloccare anche installazioni/aggiornamenti dalla dashboard:
 * define( 'DISALLOW_FILE_MODS', true );
 */

/*
 * -------------------------------------------------------------------------
 * Webhook di deploy (GitHub repository_dispatch).
 * Impostare con i valori reali SOLO su questo file del server, mai in repo.
 * -------------------------------------------------------------------------
 */
if ( ! defined( 'MARIANI_GH_REPO' ) ) {
	// Formato: "owner/repository".
	define( 'MARIANI_GH_REPO', 'owner/repository' );
}
if ( ! defined( 'MARIANI_GH_TOKEN' ) ) {
	// Personal Access Token con scope "repo" (o fine-grained: Contents + Metadata).
	define( 'MARIANI_GH_TOKEN', '' );
}

/*
 * -------------------------------------------------------------------------
 * CORS — origini del frontend headless autorizzate a chiamare la REST API.
 *
 * Il frontend statico sta su un host diverso dal CMS, quindi il POST del form
 * contatti verso /lead e cross-origin: senza questa whitelist il browser lo
 * blocca. Elenco separato da virgole, senza slash finale. Niente wildcard.
 * -------------------------------------------------------------------------
 */
if ( ! defined( 'MARIANI_ALLOWED_ORIGINS' ) ) {
	// Produzione: 'https://mariani-auto.it,https://www.mariani-auto.it,https://preview.mariani-auto.it'.
	// Sviluppo locale: aggiungere 'http://localhost:3000'.
	define( 'MARIANI_ALLOWED_ORIGINS', '' );
}

/*
 * -------------------------------------------------------------------------
 * SMTP (placeholder) — usati da un plugin SMTP o dalla configurazione mail.
 * -------------------------------------------------------------------------
 */
if ( ! defined( 'MARIANI_SMTP_HOST' ) ) {
	define( 'MARIANI_SMTP_HOST', '' );
}
if ( ! defined( 'MARIANI_SMTP_PORT' ) ) {
	define( 'MARIANI_SMTP_PORT', 587 );
}
if ( ! defined( 'MARIANI_SMTP_USER' ) ) {
	define( 'MARIANI_SMTP_USER', '' );
}
if ( ! defined( 'MARIANI_SMTP_PASS' ) ) {
	define( 'MARIANI_SMTP_PASS', '' );
}
if ( ! defined( 'MARIANI_SMTP_FROM' ) ) {
	define( 'MARIANI_SMTP_FROM', 'no-reply@example.com' );
}
