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
	 * Elenco delle 11 auto reali del concessionario (5 in evidenza, 2 commerciali).
	 *
	 * I dati numerici (km, anno, prezzi, potenza) sono a 0/placeholder in attesa
	 * di conferma dal concessionario: il front-end li rende come "n.d." o
	 * "Prezzo su richiesta". Le foto reali sono importate da cms/seed/media/cars.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function autos(): array {
		return array(
			self::car( 'ford-explorer', 'Explorer', 'explorer', '', 'nuova', 'auto', 'elettrico', 'suv', 'automatico', 'Blu', '#1f3a5f', true ),
			self::car( 'ford-mustang-mach-e', 'Mustang Mach-E', 'mustang-mach-e', '', 'nuova', 'auto', 'elettrico', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-puma-st-line-x', 'Puma', 'puma', 'ST-Line X', 'nuova', 'auto', 'benzina', 'suv-compatto', 'manuale', 'Grigio', '#6b7280', true ),
			self::car( 'ford-puma-e', 'Puma Gen-E', 'puma-gen-e', '', 'nuova', 'auto', 'elettrico', 'suv-compatto', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-focus-grigia-chiaro', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Grigio', '#9ca3af', false ),
			self::car( 'ford-focus-grigia-scuro', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Grigio', '#4b5563', false ),
			self::car( 'ford-focus-rossa', 'Focus', 'focus', '', 'usata', 'auto', 'benzina', 'berlina', 'manuale', 'Rosso', '#8f1d21', false ),
			self::car( 'ford-kuga-phev', 'Kuga', 'kuga', 'PHEV', 'usata', 'auto', 'ibrido', 'suv', 'automatico', 'Nero', '#111114', true ),
			self::car( 'ford-puma-bianca-km0', 'Puma', 'puma', '', 'km0', 'auto', 'benzina', 'suv-compatto', 'manuale', 'Bianco', '#e5e7eb', false ),
			self::car( 'ford-tourneo', 'Tourneo', 'tourneo', '', 'nuova', 'commerciale', 'diesel', 'monovolume', 'manuale', 'Bianco', '#f3f4f6', false ),
			self::car( 'ford-tourneo-custom', 'Tourneo Custom', 'tourneo-custom', '', 'nuova', 'commerciale', 'diesel', 'furgone', 'manuale', 'Nero', '#111114', false ),
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
				'mariani_set_piva'            => '01234567890',
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
		$title = trim( 'Ford ' . $modello_nome . ' ' . $versione );

		return array(
			'ref'           => $ref,
			'title'         => $title,
			'content'       => sprintf(
				'%s disponibile presso Mariani Concessionaria a Piombino. Contattaci per informazioni su prezzo, disponibilità ed eventuale prova su strada.',
				$title
			),
			'tipo'          => $tipo,
			'categoria'     => $categoria,
			'marca'         => 'ford',
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
			'title'    => 'Mariani · Concessionaria Ford Blubay',
			'title_en' => 'Mariani · Ford Blubay Dealership',
			'meta'     => array(
				'mariani_home_hero_eyebrow'           => 'Concessionaria Ford ufficiale · Sede unica',
				'mariani_home_hero_titolo'            => 'La tua prossima Ford,',
				'mariani_home_hero_titolo_accent'     => 'senza compromessi.',
				'mariani_home_hero_sottotitolo'       => "Nuovo, usato garantito, Km 0 e veicoli commerciali. Più officina autorizzata e noleggio a lungo termine, in un'unica sede di fiducia.",
				'mariani_home_hero_poster'            => new MediaRef( 'esterno-fronte' ),
				'mariani_home_hero_stats'             => array( '30+|anni di attività', '400+|veicoli disponibili', '10.000+|clienti soddisfatti' ),
				'mariani_home_bento_eyebrow'          => 'Perché Mariani',
				'mariani_home_bento_titolo'           => 'Una concessionaria, ogni servizio',
				'mariani_home_bento_sottotitolo'      => "Dalla scelta dell'auto alla consegna, fino all'officina: un unico punto di riferimento di cui fidarti.",
				'mariani_home_bento_feature_titolo'   => 'Vieni a vedere lo showroom',
				'mariani_home_bento_feature_testo'    => "Oltre 400 veicoli tra nuovo, usato garantito, Km 0 e commerciali, pronti in un'unica sede.",
				'mariani_home_bento_highlight_titolo' => 'Finanziamento e leasing su misura',
				'mariani_home_bento_highlight_testo'  => 'Soluzioni personalizzate per privati, aziende e P.IVA, con preventivo trasparente anche online.',
				'mariani_home_bento_stats'            => array( "24|mesi di garanzia sull'usato", '1 giorno|valutazione permuta' ),
				'mariani_home_service_eyebrow'        => 'Service Ford autorizzato',
				'mariani_home_service_titolo'         => 'Officina, tagliandi e ricambi originali',
				'mariani_home_service_lead'           => 'La tua Ford in mani esperte. Tecnici certificati, diagnosi computerizzata e solo ricambi originali Ford, con preventivo chiaro prima di ogni intervento.',
				'mariani_home_service_checklist'      => array( 'Tagliandi e manutenzione programmata', 'Diagnosi elettronica e revisioni', 'Auto di cortesia su richiesta' ),
			),
			'meta_en'  => array(
				'mariani_home_hero_eyebrow'           => 'Official Ford dealership · Single location',
				'mariani_home_hero_titolo'            => 'Your next Ford,',
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
				'mariani_privacy_body'    => "<p>La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che consultano il sito e utilizzano i moduli di contatto, ai sensi del Regolamento UE 2016/679 (GDPR).</p><h2>Titolare del trattamento</h2><p>Titolare del trattamento è Mariani S.r.l., Via Adige 3, 57025 Piombino (LI).</p><h2>Finalità e base giuridica</h2><p>I dati forniti tramite i moduli sono trattati per rispondere alle richieste di informazioni, preventivo o appuntamento. Il conferimento è facoltativo ma necessario per dare seguito alla richiesta.</p><h2>Conservazione</h2><p>I dati sono conservati per il tempo necessario a gestire la richiesta e ad adempiere agli obblighi di legge.</p><h2>Diritti dell'interessato</h2><p>In ogni momento è possibile esercitare i diritti di accesso, rettifica, cancellazione e opposizione scrivendo a info@marianiford.it.</p>",
				'mariani_privacy_updated' => '2026-01-01',
			),
			'meta_en'  => array(
				'mariani_privacy_body' => '<p>This notice describes how the personal data of users who browse the site and use the contact forms is processed, pursuant to EU Regulation 2016/679 (GDPR).</p><h2>Data controller</h2><p>The data controller is Mariani S.r.l., Via Adige 3, 57025 Piombino (LI), Italy.</p><h2>Purposes and legal basis</h2><p>Data provided through the forms is processed to respond to requests for information, quotes or appointments. Providing it is optional but required to follow up on the request.</p><h2>Retention</h2><p>Data is kept for as long as necessary to handle the request and to comply with legal obligations.</p><h2>Rights of the data subject</h2><p>You may exercise your rights of access, rectification, erasure and objection at any time by writing to info@marianiford.it.</p>',
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
				'mariani_cookie_body'    => '<p>Questo sito utilizza cookie tecnici necessari al funzionamento e, previo consenso, cookie di terze parti per finalità statistiche e di profilazione.</p><h2>Cookie tecnici</h2><p>Sono indispensabili per la corretta navigazione del sito e non richiedono consenso.</p><h2>Mappa OpenStreetMap</h2><p>Le mappe delle pagine Contatti e Chi Siamo sono servite tramite tile OpenStreetMap, senza cookie di profilazione.</p><h2>Gestione delle preferenze</h2><p>È possibile gestire o revocare il consenso in qualsiasi momento dalle impostazioni del browser.</p>',
				'mariani_cookie_updated' => '2026-01-01',
			),
			'meta_en'  => array(
				'mariani_cookie_body' => '<p>This site uses technical cookies necessary for its operation and, subject to consent, third-party cookies for statistical and profiling purposes.</p><h2>Technical cookies</h2><p>They are essential for correct browsing and do not require consent.</p><h2>OpenStreetMap map</h2><p>The maps on the Contact and About pages are served through OpenStreetMap tiles, without profiling cookies.</p><h2>Managing preferences</h2><p>You can manage or withdraw consent at any time from your browser settings.</p>',
			),
		);
	}
}
