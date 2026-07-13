import type { BentoStat, IconCard, Step } from "@/domain";

/**
 * Blocchi presentazionali riusati dalle pagine editoriali (tutti RSC).
 * I contenuti arrivano da WordPress: qui c'è solo struttura + iconografia
 * decorativa (aria-hidden). Nessun testo editoriale hardcoded.
 */

const deco = [
  "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4",
  "M14.7 6.3a4 4 0 0 1-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.3 2.3-2-2 2.3-2.3z",
  "M2 5h20v14H2z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  "M3 21h18M5 21V7l8-4v18M19 21V11l-6-3",
  "M20 6L9 17l-5-5",
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M8 12h8M12 8v8",
];

function DecoIcon({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={deco[index % deco.length]} />
    </svg>
  );
}

const check = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/** Griglia di card iconografiche (vantaggi noleggio). */
export function BenefitGrid({ items }: { items: IconCard[] }) {
  return (
    <div className="benefit-grid">
      {items.map((item, index) => (
        <article className="benefit-card" key={item.title}>
          <span className="benefit-card__icon">
            <DecoIcon index={index} />
          </span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

/** Griglia di feature card (servizi officina). */
export function FeatureCards({ items }: { items: IconCard[] }) {
  return (
    <div className="grid grid-3">
      {items.map((item, index) => (
        <article className="feature-card" key={item.title}>
          <div className="feature-ico">
            <DecoIcon index={index + 1} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

/** Percorso a step numerati (come funziona noleggio). */
export function Steps({ items }: { items: Step[] }) {
  return (
    <ol className="steps">
      {items.map((item, index) => (
        <li className="step" key={item.title}>
          <span className="step__num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="step__txt">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Step compatti (officina "come prenotare"). */
export function SvcSteps({ items }: { items: Step[] }) {
  return (
    <ol className="svc-steps">
      {items.map((item, index) => (
        <li className="svc-step" key={item.title}>
          <b aria-hidden="true">{index + 1}</b>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Checklist a griglia (servizi inclusi nel canone). */
export function ServicesList({ items }: { items: string[] }) {
  return (
    <ul className="services-grid">
      {items.map((item) => (
        <li className="service-item" key={item}>
          <span className="service-item__check">{check}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Statistiche a supporto della storia (chi siamo). */
export function Stats({ items }: { items: BentoStat[] }) {
  return (
    <div className="stats">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <span className="stat__num">{item.value}</span>
          <span className="stat__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
