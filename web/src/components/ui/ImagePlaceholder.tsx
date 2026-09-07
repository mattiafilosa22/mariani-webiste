/**
 * Segnaposto per un veicolo senza foto (es. listino importato senza
 * immagini). Riusato da `CarCard` e `Gallery`: mantiene le stesse
 * proporzioni del contenitore immagine (nessun layout shift) e resta
 * leggibile nei temi chiaro/scuro tramite i token del design system.
 *
 * Accessibilità: l'icona è puramente decorativa (`aria-hidden`); il nome
 * del veicolo è già annunciato altrove (link/titolo), quindi qui non va
 * ripetuto — solo l'etichetta "foto non disponibile", informazione nuova
 * per chi usa uno screen reader.
 */
export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="ph" role="img" aria-label={label}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10.5" r="1.75" />
        <path d="M3 16l5.5-5 4 4L17 11l4 4" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
