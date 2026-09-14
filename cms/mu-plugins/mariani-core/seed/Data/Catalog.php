<?php
/**
 * Sorgente dati del seeder: tassonomie, auto, impostazioni e pagine.
 *
 * I valori sono allineati ai mock del front-end (web/src/lib/api/mock) cosi
 * che gli endpoint REST restituiscano gli stessi veicoli e contenuti.
 *
 * @package Mariani\Core
 */

declare( strict_types=1 );

namespace Mariani\Core\Seed\Data;

use Mariani\Core\Seed\Support\MediaRef;

defined( 'ABSPATH' ) || exit;

/**
 * Fornisce, in sola lettura, i dati statici da seedare.
 */
final class Catalog {

	/**
	 * Coordinate della sede (Piombino, LI).
	 *
	 * @var string
	 */
	private const LAT = '42.9250';

	/**
	 * Longitudine della sede.
	 *
	 * @var string
	 */
	private const LNG = '10.5210';

	/**
	 * Termini tassonomici da garantire (slug => nome).
	 *
	 * @return array<string,array<int,array{slug:string,name:string}>>
	 */
	public static function taxonomies(): array {
		return array(
			'marca'         => array(
				array(
					'slug' => 'ford',
					'name' => 'Ford',
				),
				array(
					'slug' => 'omoda',
					'name' => 'Omoda',
				),
				array(
					'slug' => 'jaecoo',
					'name' => 'Jaecoo',
				),
			),
			'modello'       => array(
				array(
					'slug' => 'explorer',
					'name' => 'Explorer',
				),
				array(
					'slug' => 'mustang-mach-e',
					'name' => 'Mustang Mach-E',
				),
				array(
					'slug' => 'puma',
					'name' => 'Puma',
				),
				array(
					'slug' => 'puma-gen-e',
					'name' => 'Puma Gen-E',
				),
				array(
					'slug' => 'focus',
					'name' => 'Focus',
				),
				array(
					'slug' => 'kuga',
					'name' => 'Kuga',
				),
				array(
					'slug' => 'tourneo',
					'name' => 'Tourneo',
				),
				array(
					'slug' => 'tourneo-custom',
					'name' => 'Tourneo Custom',
				),
				array(
					'slug' => 'omoda-5',
					'name' => '5',
				),
				array(
					'slug' => 'omoda-7',
					'name' => '7',
				),
				array(
					'slug' => 'jaecoo-7',
					'name' => '7',
				),
				array(
					'slug' => 'jaecoo-8',
					'name' => '8',
				),
			),
			'carrozzeria'   => array(
				array(
					'slug' => 'suv',
					'name' => 'SUV',
				),
				array(
					'slug' => 'suv-compatto',
					'name' => 'SUV compatto',
				),
				array(
					'slug' => 'berlina',
					'name' => 'Berlina',
				),
				array(
					'slug' => 'utilitaria',
					'name' => 'Utilitaria',
				),
				array(
					'slug' => 'furgone',
					'name' => 'Furgone',
				),
				array(
					'slug' => 'monovolume',
					'name' => 'Monovolume',
				),
			),
			'alimentazione' => array(
				array(
					'slug' => 'benzina',
					'name' => 'Benzina',
				),
				array(
					'slug' => 'diesel',
					'name' => 'Diesel',
				),
				array(
					'slug' => 'ibrido',
					'name' => 'Ibrido',
				),
				array(
					'slug' => 'elettrico',
					'name' => 'Elettrico',
				),
				array(
					'slug' => 'gpl',
					'name' => 'GPL',
				),
				array(
					'slug' => 'metano',
					'name' => 'Metano',
				),
			),
		);
	}

	/**
	 * Elenco delle 15 auto reali del concessionario: 11 Ford (5 in evidenza, 2
	 * commerciali) + 4 Omoda/Jaecoo (tutte in evidenza, nuove).
	 *
	 * I dati numerici (km, anno, prezzi, potenza) sono a 0/placeholder in attesa
	 * di conferma dal concessionario: il front-end li rende come "n.d." o
	 * "Prezzo su richiesta". Le foto reali sono importate da cms/seed/media/cars.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function autos(): array {
		return array(
			self::car( 'ford-explorer', 'ford', 'Ford', 'Explorer', 'explorer', '', 'nuova', 'auto', 'elettrico', 'suv', 'automatico', 'Blu', '#1f3a5f', true ),
			self::car( 'ford-mustang-mach-e', 'ford', 'Ford', 'Mustang Mach-E', 'mustang-mach-e', '', 'nuova', 'auto', 'elettrico', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-puma-st-line-x', 'ford', 'Ford', 'Puma', 'puma', 'ST-Line X', 'nuova', 'auto', 'benzina', 'suv-compatto', 'manuale', 'Grigio', '#6b7280', true ),
			self::car( 'ford-puma-e', 'ford', 'Ford', 'Puma Gen-E', 'puma-gen-e', '', 'nuova', 'auto', 'elettrico', 'suv-compatto', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-focus-grigia-chiaro', 'ford', 'Ford', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Grigio', '#9ca3af', false ),
			self::car( 'ford-focus-grigia-scuro', 'ford', 'Ford', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Grigio', '#4b5563', false ),
			self::car( 'ford-focus-rossa', 'ford', 'Ford', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Rosso', '#8f1d21', false ),
			self::car( 'ford-kuga-phev', 'ford', 'Ford', 'Kuga', 'kuga', 'PHEV', 'usata', 'auto', 'ibrido', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-puma-bianca-km0', 'ford', 'Ford', 'Puma', 'puma', '', 'km0', 'auto', 'benzina', 'suv-compatto', 'manuale', 'Bianco', '#e5e7eb', false ),
			self::car( 'ford-tourneo', 'ford', 'Ford', 'Tourneo', 'tourneo', '', 'nuova', 'commerciale', 'diesel', 'monovolume', 'manuale', 'Bianco', '#f3f4f6', false ),
			self::car( 'ford-tourneo-custom', 'ford', 'Ford', 'Tourneo Custom', 'tourneo-custom', '', 'nuova', 'commerciale', 'diesel', 'furgone', 'manuale', 'Nero', '#111114', false ),
			self::car( 'omoda-5', 'omoda', 'Omoda', '5', 'omoda-5', '', 'nuova', 'auto', 'benzina', 'suv-compatto', 'automatico', 'Nero', '#111114', true ),
			self::car( 'omoda-7', 'omoda', 'Omoda', '7', 'omoda-7', '', 'nuova', 'auto', 'ibrido', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'jaecoo-7', 'jaecoo', 'Jaecoo', '7', 'jaecoo-7', '', 'nuova', 'auto', 'benzina', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'jaecoo-8', 'jaecoo', 'Jaecoo', '8', 'jaecoo-8', '', 'nuova', 'auto', 'ibrido', 'suv', 'automatico', 'Bianco', '#f3f4f6', true ),
		);
	}

	/**
	 * Impostazioni globali del sito (contatti reali sede Mariani).
	 *
	 * @return array<string,mixed>
	 */
	public static function settings(): array {
		return array(
			'slug'     => 'impostazioni',
			'title'    => 'Impostazioni sito',
			'title_en' => 'Site settings',
			'meta'     => array(
				'mariani_set_nome_azienda'    => 'Mariani',
				'mariani_set_ragione_sociale' => 'Mariani S.r.l.',
				'mariani_set_indirizzo'       => 'Via Adige 3, 57025 Piombino (LI)',
				'mariani_set_tel_vendita'     => '0565 276520',
				'mariani_set_tel_assistenza'  => '0565 276520',
				'mariani_set_whatsapp'        => '390565276520',
				'mariani_set_email'           => 'info@marianiford.it',
				'mariani_set_piva'            => '01300000492',
				'mariani_set_rea'             => 'LI-000000',
				'mariani_set_maps_url'        => 'https://www.google.com/maps/search/?api=1&query=Via+Adige+3+Piombino',
				'mariani_set_map_lat'         => self::LAT,
				'mariani_set_map_lng'         => self::LNG,
				'mariani_set_orari_vendita'   => "Lunedì–Venerdì: 08:30–12:30 / 14:30–18:30\nSabato–Domenica: chiuso",
				'mariani_set_orari_officina'  => "Lunedì–Venerdì: 08:00–12:30 / 14:00–18:00\nSabato–Domenica: chiuso",
				'mariani_set_facebook'        => 'https://www.facebook.com/marianiford',
				'mariani_set_instagram'       => 'https://www.instagram.com/marianiford',
				'mariani_set_messenger'       => 'https://m.me/marianiford',
				'mariani_set_slogan'          => 'La tua Ford di fiducia a Piombino',
				'mariani_set_copyright'       => '© Mariani S.r.l. — Tutti i diritti riservati',
				'mariani_set_privacy_url'     => '/privacy-policy',
				'mariani_set_cookie_url'      => '/cookie-policy',
				'mariani_set_hero_image'      => new MediaRef( 'hero-mache' ),
				'mariani_set_foto_credit'     => 'Foto reali dei veicoli in vendita presso la nostra sede di Piombino — scatti di nostra proprietà.',
			),
			'meta_en'  => array(
				'mariani_set_orari_vendita'  => "Monday–Friday: 8:30–12:30 am / 2:30–6:30 pm\nSaturday–Sunday: closed",
				'mariani_set_orari_officina' => "Monday–Friday: 8:00–12:30 am / 2:00–6:00 pm\nSaturday–Sunday: closed",
				'mariani_set_slogan'         => 'Your trusted Ford dealership in Piombino',
				'mariani_set_copyright'      => '© Mariani S.r.l. — All rights reserved',
				'mariani_set_foto_credit'    => 'Real photos of vehicles for sale at our Piombino dealership — shot by us.',
			),
		);
	}

	/**
	 * Pagine editoriali con i rispettivi blocchi (IT + EN).
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function pages(): array {
		return array(
			self::page_home(),
			self::page_chi_siamo(),
			self::page_noleggio(),
			self::page_officina(),
			self::page_contatti(),
			self::page_privacy(),
			self::page_cookie(),
		);
	}

	/**
	 * Costruisce il record di un veicolo reale con i dati minimi confermati.
	 *
	 * I campi numerici non ancora forniti dal concessionario restano a 0 (km,
	 * anno, prezzi, potenza) oppure a null (cilindrata, CO2, consumi...), cosi il
	 * presenter li omette e il front-end mostra "n.d." / "Prezzo su richiesta".
	 *
	 * @param string $ref            Slug canonico (coincide con la cartella foto).
	 * @param string $marca_slug     Slug del termine marca.
	 * @param string $marca_nome    Nome della marca (per il titolo/alt).
	 * @param string $modello_nome   Nome del modello (per il titolo/alt).
	 * @param string $modello_slug   Slug del termine modello.
	 * @param string $versione       Versione/allestimento (puo essere vuota).
	 * @param string $tipo           Tipo veicolo (nuova|usata|km0).
	 * @param string $categoria      Categoria (auto|commerciale).
	 * @param string $alimentazione  Slug alimentazione.
	 * @param string $carrozzeria    Slug carrozzeria.
	 * @param string $cambio         Cambio (manuale|automatico).
	 * @param string $colore_label   Etichetta colore (IT, normalizzata dal presenter).
	 * @param string $colore_hex     Colore esterno in esadecimale (swatch UI).
	 * @param bool   $in_evidenza    Se mostrarla tra i veicoli in evidenza.
	 * @return array<string,mixed>
	 */
	private static function car(
		string $ref,
		string $marca_slug,
		string $marca_nome,
		string $modello_nome,
		string $modello_slug,
		string $versione,
		string $tipo,
		string $categoria,
		string $alimentazione,
		string $carrozzeria,
		string $cambio,
		string $colore_label,
		string $colore_hex,
		bool $in_evidenza
	): array {
		$title = trim( $marca_nome . ' ' . $modello_nome . ' ' . $versione );

		return array(
			'ref'           => $ref,
			'title'         => $title,
			'content'       => sprintf(
				'%s disponibile presso Mariani Concessionaria a Piombino. Contattaci per informazioni su prezzo, disponibilità ed eventuale prova su strada.',
				$title
			),
			'tipo'          => $tipo,
			'categoria'     => $categoria,
			'marca'         => $marca_slug,
			'modello'       => $modello_slug,
			'alimentazione' => $alimentazione,
			'carrozzeria'   => $carrozzeria,
			'versione'      => $versione,
			'anno'          => '',
			'km'            => 0,
			'cambio'        => $cambio,
			'trazione'      => 'anteriore',
			'listino'       => 0,
			'sconto'        => 0,
			'promo'         => null,
			'scadenza'      => '',
			'in_evidenza'   => $in_evidenza,
			'pronta'        => false,
			'neopatentati'  => false,
			'garanzia'      => '',
			'cilindrata'    => null,
			'potenza_cv'    => 0,
			'co2'           => null,
			'consumo_wltp'  => null,
			'autonomia'     => null,
			'classe'        => '',
			'posti'         => null,
			'porte'         => null,
			'colore_est'    => $colore_label,
			'colore_hex'    => $colore_hex,
			'colore_int'    => '',
			'dotazioni'     => array(),
			'optional'      => array(),
			'commerciale'   => null,
			'en'            => array(
				'content' => sprintf(
					'%s available at Mariani Concessionaria in Piombino. Contact us for details on price, availability and a possible test drive.',
					$title
				),
			),
		);
	}


	/**
	 * Pagina Homepage (contenuti allineati al contratto PageContent).
	 *
	 * @return array<string,mixed>
	 */
	private static function page_home(): array {
		return array(
			'key'      => 'home',
			'title'    => 'Mariani Auto · Piombino',
			'title_en' => 'Mariani Auto · Piombino',
			'meta'     => array(
				'mariani_home_hero_eyebrow'           => 'Concessionaria Ford ufficiale · Sede unica',
				'mariani_home_hero_titolo'            => 'La tua prossima auto',
				'mariani_home_hero_titolo_accent'     => 'senza compromessi.',
				'mariani_home_hero_sottotitolo'       => "Nuovo, usato garantito, Km 0 e veicoli commerciali. Più officina autorizzata e noleggio a lungo termine, in un'unica sede di fiducia.",
				'mariani_home_hero_poster'            => new MediaRef( 'esterno-fronte' ),
				'mariani_home_hero_stats'             => array( '30+|anni di attività', '400+|veicoli disponibili', '10.000+|clienti soddisfatti' ),
				'mariani_home_bento_eyebrow'          => 'Perché Mariani',
				'mariani_home_bento_titolo'           => 'Una concessionaria, ogni servizio',
				'mariani_home_bento_sottotitolo'      => "Dalla scelta dell'auto alla consegna, fino all'officina: un unico punto di riferimento di cui fidarti.",
				'mariani_home_bento_feature_titolo'   => 'Vieni a vedere lo showroom',
				'mariani_home_bento_feature_testo'    => "Oltre 400 veicoli tra nuovo, usato garantito, Km 0 e commerciali, pronti in un'unica sede.",
				'mariani_home_bento_feature_img'      => new MediaRef( 'home-catalogo' ),
				'mariani_home_bento_highlight_titolo' => 'Finanziamento e leasing su misura',
				'mariani_home_bento_highlight_testo'  => 'Soluzioni personalizzate per privati, aziende e P.IVA, con preventivo trasparente anche online.',
				'mariani_home_bento_stats'            => array( "24|mesi di garanzia sull'usato", '1 giorno|valutazione permuta' ),
				'mariani_home_service_eyebrow'        => 'Service Ford autorizzato',
				'mariani_home_service_titolo'         => 'Officina, tagliandi e ricambi originali',
				'mariani_home_service_lead'           => 'La tua Ford in mani esperte. Tecnici certificati, diagnosi computerizzata e solo ricambi originali Ford, con preventivo chiaro prima di ogni intervento.',
				'mariani_home_service_img'            => new MediaRef( 'home-officina' ),
				'mariani_home_service_checklist'      => array( 'Tagliandi e manutenzione programmata', 'Diagnosi elettronica e revisioni', 'Auto di cortesia su richiesta' ),
			),
			'meta_en'  => array(
				'mariani_home_hero_eyebrow'           => 'Official Ford dealership · Single location',
				'mariani_home_hero_titolo'            => 'Your next car',
				'mariani_home_hero_titolo_accent'     => 'no compromises.',
				'mariani_home_hero_sottotitolo'       => 'New, certified used, zero-km and commercial vehicles. Plus an authorised workshop and long-term rental, all under one trusted roof.',
				'mariani_home_hero_stats'             => array( '30+|years in business', '400+|vehicles available', '10,000+|happy customers' ),
				'mariani_home_bento_eyebrow'          => 'Why Mariani',
				'mariani_home_bento_titolo'           => 'One dealership, every service',
				'mariani_home_bento_sottotitolo'      => 'From choosing your car to delivery and servicing: a single point of reference you can trust.',
				'mariani_home_bento_feature_titolo'   => 'Come and see the showroom',
				'mariani_home_bento_feature_testo'    => 'Over 400 vehicles across new, certified used, zero-km and commercial, all ready in one location.',
				'mariani_home_bento_highlight_titolo' => 'Tailored financing and leasing',
				'mariani_home_bento_highlight_testo'  => 'Custom solutions for individuals, businesses and VAT holders, with a transparent quote online too.',
				'mariani_home_bento_stats'            => array( '24|months warranty on used cars', '1 day|trade-in valuation' ),
				'mariani_home_service_eyebrow'        => 'Authorised Ford service',
				'mariani_home_service_titolo'         => 'Workshop, servicing and genuine parts',
				'mariani_home_service_lead'           => 'Your Ford in expert hands. Certified technicians, computerised diagnostics and only genuine Ford parts, with a clear quote before every job.',
				'mariani_home_service_checklist'      => array( 'Scheduled servicing and maintenance', 'Electronic diagnostics and inspections', 'Courtesy car on request' ),
			),
		);
	}

	/**
	 * Pagina Chi Siamo.
	 *
	 * @return array<string,mixed>
	 */
	private static function page_chi_siamo(): array {
		return array(
			'key'      => 'chi-siamo',
			'title'    => 'Chi siamo',
			'title_en' => 'About us',
			'meta'     => array(
				'mariani_chisiamo_hero_eyebrow'      => 'La nostra storia',
				'mariani_chisiamo_titolo'            => 'Da oltre 30 anni, la tua Ford di fiducia',
				'mariani_chisiamo_sottotitolo'       => "Una sola sede, un unico punto di riferimento: dalla scelta dell'auto al service, ti accompagniamo con la cura di sempre e l'esperienza di chi conosce ogni modello Ford.",
				'mariani_chisiamo_storia'            => "<p>La concessionaria Mariani nasce nei primi anni '90 dalla passione di una famiglia per il marchio Ford. Da una piccola officina di quartiere siamo cresciuti fino a diventare un punto di riferimento del territorio, senza mai cambiare il nostro modo di lavorare: trasparenza, rapporto diretto e tempo dedicato a ogni cliente.</p><p>Come concessionaria e officina autorizzata Ford Blubay lavoriamo a stretto contatto con la casa madre: formazione continua, strumenti diagnostici originali e ricambi certificati. Dietro ogni consegna c'è un team affiatato di consulenti alla vendita e tecnici specializzati.</p>",
				'mariani_chisiamo_img'               => new MediaRef( 'esterno-lato' ),
				'mariani_chisiamo_stats'             => array( '30+|Anni di attività al servizio dei clienti', '10.000+|Clienti che ci hanno scelto nel tempo' ),
				'mariani_chisiamo_come_raggiungerci' => 'Siamo in Via Adige 3 a Piombino, a pochi minuti dal centro e dal porto. Ampio parcheggio clienti disponibile.',
			),
			'meta_en'  => array(
				'mariani_chisiamo_hero_eyebrow'      => 'Our story',
				'mariani_chisiamo_titolo'            => 'For over 30 years, your trusted Ford',
				'mariani_chisiamo_sottotitolo'       => 'One location, one point of reference: from choosing your car to servicing, we support you with the same care as always and the experience of those who know every Ford model.',
				'mariani_chisiamo_storia'            => "<p>The Mariani dealership was founded in the early '90s from a family's passion for the Ford brand. From a small neighbourhood workshop we have grown into a local landmark, without ever changing the way we work: transparency, a direct relationship and time dedicated to every customer.</p><p>As an authorised Ford Blubay dealership and workshop we work closely with the manufacturer: ongoing training, original diagnostic tools and certified parts. Behind every handover is a close-knit team of sales advisers and specialised technicians.</p>",
				'mariani_chisiamo_stats'             => array( '30+|Years serving our customers', '10,000+|Customers who have chosen us over time' ),
				'mariani_chisiamo_come_raggiungerci' => 'We are at Via Adige 3 in Piombino, a few minutes from the town centre and the harbour. Large customer car park available.',
			),
		);
	}

	/**
	 * Pagina Noleggio a lungo termine.
	 *
	 * @return array<string,mixed>
	 */
	private static function page_noleggio(): array {
		return array(
			'key'      => 'noleggio',
			'title'    => 'Noleggio a lungo termine',
			'title_en' => 'Long-term rental',
			'meta'     => array(
				'mariani_noleggio_hero_img'     => new MediaRef( 'esterno-fronte' ),
				'mariani_noleggio_hero_eyebrow' => 'Noleggio a lungo termine',
				'mariani_noleggio_titolo'       => 'Guida una Ford nuova, pensiamo a tutto noi',
				'mariani_noleggio_sottotitolo'  => 'Un canone fisso mensile, durata flessibile e zero pensieri: manutenzione, assicurazione e assistenza sono già incluse. Tu scegli la Ford, al resto pensiamo noi.',
				'mariani_noleggio_vantaggi'     => array(
					'Canone fisso mensile|Una rata costante e prevedibile, per gestire il budget senza imprevisti.',
					'Manutenzione inclusa|Tagliandi e interventi presso la nostra officina Ford autorizzata, sempre compresi.',
					'Assicurazione completa|RCA, furto, incendio e Kasko già attive: copertura completa dal primo giorno.',
					'Nessuna spesa imprevista|Bollo, assistenza stradale e gestione sinistri sono già nel canone.',
				),
				'mariani_noleggio_servizi'      => array( 'Manutenzione ordinaria', 'Manutenzione straordinaria', 'Assistenza stradale H24', 'Assicurazione RCA', 'Incendio e furto', 'Danni (Kasko)', 'Gestione sinistri' ),
				'mariani_noleggio_step'         => array(
					'Scegli il veicolo|Seleziona la Ford che fa per te tra la nostra gamma di auto e veicoli commerciali.',
					'Definisci durata e km|Imposta la durata del contratto e la percorrenza annua più adatta a te.',
					'Scegli i servizi|Aggiungi i servizi che desideri: dalla copertura Kasko all\'auto sostitutiva.',
					'Parti|Ritiri la tua Ford pronta all\'uso in sede e inizi subito a guidare, senza pensieri.',
				),
				'mariani_noleggio_durata_min'   => 12,
				'mariani_noleggio_durata_max'   => 72,
				'mariani_noleggio_cta_label'    => 'Richiedi un preventivo',
				'mariani_noleggio_cta_url'      => '#richiesta',
			),
			'meta_en'  => array(
				'mariani_noleggio_hero_eyebrow' => 'Long-term rental',
				'mariani_noleggio_titolo'       => 'Drive a brand-new Ford, we take care of everything',
				'mariani_noleggio_sottotitolo'  => 'A fixed monthly fee, flexible duration and no worries: maintenance, insurance and assistance are all included. You choose the Ford, we handle the rest.',
				'mariani_noleggio_vantaggi'     => array(
					'Fixed monthly fee|A constant, predictable instalment to manage your budget without surprises.',
					'Maintenance included|Servicing and repairs at our authorised Ford workshop, always included.',
					'Full insurance|Third-party, theft, fire and collision cover active from day one.',
					'No unexpected costs|Road tax, roadside assistance and claims handling are already in the fee.',
				),
				'mariani_noleggio_servizi'      => array( 'Routine maintenance', 'Major maintenance', '24/7 roadside assistance', 'Third-party insurance', 'Fire and theft', 'Collision (Kasko)', 'Claims handling' ),
				'mariani_noleggio_step'         => array(
					'Choose the vehicle|Select the Ford that suits you from our range of cars and commercial vehicles.',
					'Set duration and mileage|Choose the contract length and annual mileage that best fit your needs.',
					'Choose the services|Add the services you want, from collision cover to a replacement car.',
					'Get going|Collect your ready-to-drive Ford at our site and start driving straight away.',
				),
				'mariani_noleggio_cta_label'    => 'Request a quote',
			),
		);
	}

	/**
	 * Pagina Officina.
	 *
	 * @return array<string,mixed>
	 */
	private static function page_officina(): array {
		return array(
			'key'      => 'officina',
			'title'    => 'Officina',
			'title_en' => 'Workshop',
			'meta'     => array(
				'mariani_officina_hero_img'     => new MediaRef( 'abitacolo' ),
				'mariani_officina_hero_eyebrow' => 'Service Ford autorizzato · Sede unica',
				'mariani_officina_titolo'       => 'La tua Ford in mani esperte',
				'mariani_officina_sottotitolo'  => 'Tagliando, revisione e interventi di officina nella nostra sede autorizzata. Tecnici certificati e solo ricambi originali Ford, con preventivo chiaro prima di ogni intervento.',
				'mariani_officina_servizi'      => array(
					'Tagliando|Manutenzione programmata secondo il piano Ford, con check-up completo del veicolo e ricambi originali.',
					'Revisione|Revisione periodica del veicolo gestita direttamente in sede, senza code e senza pensieri.',
					'Officina|Riparazioni meccaniche, diagnosi elettronica e interventi di officina da tecnici certificati Ford.',
				),
				'mariani_officina_step'         => array(
					'Lasciaci i dati|Nome, targa e un recapito: bastano pochi secondi.',
					'Ti confermiamo|Ti ricontattiamo per fissare l\'appuntamento.',
					'Pensiamo a tutto noi|Ti avvisiamo appena la tua Ford è pronta.',
				),
				'mariani_officina_cta_label'    => 'Prenota un intervento',
				'mariani_officina_cta_url'      => '#prenota',
			),
			'meta_en'  => array(
				'mariani_officina_hero_eyebrow' => 'Authorised Ford service · Single location',
				'mariani_officina_titolo'       => 'Your Ford in expert hands',
				'mariani_officina_sottotitolo'  => 'Servicing, inspection and workshop jobs at our authorised site. Certified technicians and only genuine Ford parts, with a clear quote before every job.',
				'mariani_officina_servizi'      => array(
					'Service|Scheduled maintenance to the Ford plan, with a full vehicle check-up and genuine parts.',
					'Inspection|Periodic vehicle inspection handled directly on site, without queues.',
					'Workshop|Mechanical repairs, electronic diagnostics and work by certified Ford technicians.',
				),
				'mariani_officina_step'         => array(
					'Leave us your details|Name, plate and a contact: it only takes a few seconds.',
					'We confirm|We get back to you to arrange the appointment.',
					'We handle everything|We let you know as soon as your Ford is ready.',
				),
				'mariani_officina_cta_label'    => 'Book a service',
			),
		);
	}

	/**
	 * Pagina Contatti.
	 *
	 * @return array<string,mixed>
	 */
	private static function page_contatti(): array {
		return array(
			'key'      => 'contatti',
			'title'    => 'Contatti',
			'title_en' => 'Contact',
			'meta'     => array(
				'mariani_contatti_hero_eyebrow' => 'Parla con Mariani',
				'mariani_contatti_titolo'       => 'Vieni a trovarci',
				'mariani_contatti_sottotitolo'  => 'Siamo a Piombino, in Via Adige 3. Chiamaci, scrivici o passa in concessionaria: siamo a tua disposizione.',
			),
			'meta_en'  => array(
				'mariani_contatti_hero_eyebrow' => 'Talk to Mariani',
				'mariani_contatti_titolo'       => 'Come and visit us',
				'mariani_contatti_sottotitolo'  => 'We are in Piombino, at Via Adige 3. Call us, write to us or drop by the dealership: we are at your service.',
			),
		);
	}

	/**
	 * Pagina Privacy Policy (testo legale).
	 *
	 * @return array<string,mixed>
	 */
	private static function page_privacy(): array {
		return array(
			'key'      => 'privacy-policy',
			'title'    => 'Privacy Policy',
			'title_en' => 'Privacy Policy',
			'meta'     => array(
				'mariani_privacy_body'    => '<p>Questa informativa descrive il trattamento dei dati personali di chi consulta il sito e invia una richiesta, ai sensi del Regolamento UE 2016/679 (GDPR).</p><h2>Titolare del trattamento</h2><p>Mariani S.r.l., Via Adige 3, 57025 Piombino (LI), P.IVA 01300000492. Contatto: <a href="mailto:info@marianiford.it">info@marianiford.it</a>.</p><h2>Dati trattati</h2><p>Trattiamo i dati inseriti nei moduli, come nome, cognome, email, telefono, contenuto della richiesta ed eventuali informazioni sul veicolo. I sistemi possono inoltre registrare dati tecnici necessari alla sicurezza e alla prevenzione degli abusi, come indirizzo IP, data e ora della richiesta.</p><h2>Finalità e base giuridica</h2><p>I dati sono usati esclusivamente per rispondere a richieste di informazioni, preventivi, test drive, valutazioni o appuntamenti e per adottare misure precontrattuali richieste dall’interessato, ai sensi dell’art. 6, par. 1, lett. b) GDPR. Non utilizziamo i dati per comunicazioni promozionali.</p><h2>Conferimento</h2><p>Il conferimento è facoltativo, ma i dati indicati come obbligatori sono necessari per gestire la richiesta.</p><h2>Destinatari e trasferimenti</h2><p>I dati possono essere trattati da personale autorizzato e da fornitori tecnici che operano per nostro conto, quali hosting, posta elettronica e gestione dei moduli. Non diffondiamo i dati. Non effettuiamo trasferimenti intenzionali fuori dallo Spazio economico europeo; qualora un fornitore ne rendesse necessario uno, saranno applicate le garanzie previste dal GDPR.</p><h2>Conservazione</h2><p>I dati delle richieste sono conservati per 12 mesi dalla ricezione e poi cancellati, salvo obblighi di legge o necessità di tutela di un diritto.</p><h2>Diritti</h2><p>È possibile chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opposizione nei casi previsti dagli artt. 15–22 GDPR scrivendo al titolare. È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali.</p><h2>Decisioni automatizzate</h2><p>Non vengono svolti processi decisionali automatizzati o attività di profilazione.</p>',
				'mariani_privacy_updated' => '2026-09-14',
			),
			'meta_en'  => array(
				'mariani_privacy_body'    => '<p>This notice describes how we process the personal data of people who browse the website and submit a request, under Regulation (EU) 2016/679 (GDPR).</p><h2>Data controller</h2><p>Mariani S.r.l., Via Adige 3, 57025 Piombino (LI), Italy, VAT no. 01300000492. Contact: <a href="mailto:info@marianiford.it">info@marianiford.it</a>.</p><h2>Data processed</h2><p>We process data entered in forms, such as name, surname, email, telephone number, request content and any vehicle information. Systems may also record technical data needed for security and abuse prevention, such as IP address, date and time.</p><h2>Purposes and legal basis</h2><p>Data is used only to answer requests for information, quotes, test drives, valuations or appointments and to take pre-contractual steps requested by the data subject under Article 6(1)(b) GDPR. We do not use this data for promotional communications.</p><h2>Provision of data</h2><p>Providing data is optional, but fields marked as required are necessary to handle the request.</p><h2>Recipients and transfers</h2><p>Data may be processed by authorised staff and technical suppliers acting on our behalf, including hosting, email and form-management providers. We do not disclose data publicly. We do not intentionally transfer data outside the European Economic Area; if a supplier makes a transfer necessary, the safeguards required by the GDPR will apply.</p><h2>Retention</h2><p>Request data is kept for 12 months from receipt and then erased, unless legal obligations or the protection of a right require otherwise.</p><h2>Rights</h2><p>You may request access, rectification, erasure, restriction, portability and objection where provided by Articles 15–22 GDPR by contacting the controller. You may also lodge a complaint with the Italian Data Protection Authority.</p><h2>Automated decisions</h2><p>We do not carry out automated decision-making or profiling.</p>',
				'mariani_privacy_updated' => '2026-09-14',
			),
		);
	}

	/**
	 * Pagina Cookie Policy (testo legale).
	 *
	 * @return array<string,mixed>
	 */
	private static function page_cookie(): array {
		return array(
			'key'      => 'cookie-policy',
			'title'    => 'Cookie Policy',
			'title_en' => 'Cookie Policy',
			'meta'     => array(
				'mariani_cookie_body'    => '<p>Il sito pubblico non usa cookie statistici, pubblicitari o di profilazione e non integra Google Analytics, Meta Pixel o strumenti equivalenti. Per questo non viene mostrato un banner di consenso.</p><h2>Meccanismi tecnici</h2><p>Possono essere impiegati soltanto dati o meccanismi strettamente necessari a sicurezza, invio dei moduli e funzionamento del servizio. Non sono usati per seguire la navigazione a fini commerciali.</p><h2>Mappa OpenStreetMap</h2><p>La mappa non viene caricata automaticamente. Solo scegliendo “Carica la mappa” il browser richiede le immagini cartografiche ai server di OpenStreetMap, che ricevono i dati tecnici necessari alla connessione. Indirizzo e collegamento esterno restano disponibili senza attivare la mappa.</p><h2>Siti esterni</h2><p>I collegamenti a mappe e social portano a servizi esterni, che applicano le proprie informative soltanto dopo l’apertura del collegamento.</p><h2>Aggiornamenti</h2><p>Questa policy sarà aggiornata prima di introdurre strumenti non tecnici; ove richiesto, tali strumenti saranno bloccati fino a una scelta dell’utente.</p>',
				'mariani_cookie_updated' => '2026-09-14',
			),
			'meta_en'  => array(
				'mariani_cookie_body'    => '<p>The public website does not use statistical, advertising or profiling cookies and does not integrate Google Analytics, Meta Pixel or equivalent tools. A consent banner is therefore not displayed.</p><h2>Technical mechanisms</h2><p>Only data or mechanisms strictly necessary for security, form submission and service operation may be used. They are not used to track browsing for commercial purposes.</p><h2>OpenStreetMap map</h2><p>The map is not loaded automatically. Only after choosing “Load map” does the browser request map images from OpenStreetMap servers, which receive the technical data needed for the connection. The address and external link remain available without enabling the map.</p><h2>External websites</h2><p>Links to maps and social services lead to external websites, whose own notices apply only after the link is opened.</p><h2>Updates</h2><p>This policy will be updated before non-technical tools are introduced; where required, those tools will remain blocked until the user makes a choice.</p>',
				'mariani_cookie_updated' => '2026-09-14',
			),
		);
	}
}
