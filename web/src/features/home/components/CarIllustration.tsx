/**
 * Illustrazione SVG di una crossover Ford usata come soggetto animato dell'hero.
 * È puramente decorativa: viene resa dentro un contenitore `aria-hidden`,
 * quindi non espone testo alle tecnologie assistive.
 */
export function CarIllustration() {
  return (
    <svg viewBox="0 0 860 320" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="hero-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a608a" />
          <stop offset=".5" stopColor="#1e2e4a" />
          <stop offset="1" stopColor="#0c1424" />
        </linearGradient>
        <radialGradient id="hero-head" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#eaf2ff" stopOpacity=".75" />
          <stop offset="1" stopColor="#6e9bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3a63c8" stopOpacity=".42" />
          <stop offset="1" stopColor="#3a63c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="440" cy="298" rx="380" ry="15" fill="url(#hero-ground)" />
      <path
        d="M70,238 C70,214 86,202 112,200 L156,196 C156,166 164,158 188,154 L256,150 C268,124 292,114 336,112 L474,110 C526,110 556,120 576,144 L606,172 C620,172 632,170 650,169 L720,167 C762,166 796,182 800,210 C802,224 794,234 778,235 L96,235 C80,235 70,234 70,238 Z"
        fill="url(#hero-body)"
      />
      <path
        d="M256,150 C268,124 292,114 336,112 L474,110 C526,110 556,120 576,144"
        fill="none"
        stroke="#9fc0ff"
        strokeOpacity=".6"
        strokeWidth="2"
      />
      <path
        d="M300,168 L322,126 L462,122 L470,168 Z"
        fill="#0c1626"
        stroke="#33507f"
        strokeWidth="1"
      />
      <path
        d="M482,124 L560,144 L588,170 L482,170 Z"
        fill="#0c1626"
        stroke="#33507f"
        strokeWidth="1"
      />
      <path
        d="M170,172 L604,150"
        fill="none"
        stroke="#6e9bff"
        strokeOpacity=".45"
        strokeWidth="2"
      />
      <path
        d="M168,206 L600,198"
        fill="none"
        stroke="#33507f"
        strokeOpacity=".5"
        strokeWidth="1.5"
      />
      <rect x="360" y="190" width="26" height="5" rx="2" fill="#33507f" opacity=".7" />
      <path
        d="M170,234 A58,58 0 0 1 286,234"
        fill="none"
        stroke="#0a0f1c"
        strokeWidth="6"
      />
      <path
        d="M590,234 A58,58 0 0 1 706,234"
        fill="none"
        stroke="#0a0f1c"
        strokeWidth="6"
      />
      <circle cx="788" cy="196" r="22" fill="url(#hero-head)" />
      <path d="M758,184 L792,191 L791,200 L760,196 Z" fill="#cfe0ff" />
      <rect x="772" y="212" width="22" height="9" rx="2" fill="#0a0f1c" />
      <rect x="74" y="176" width="11" height="40" rx="4" fill="#ff3b51" />
      <circle cx="80" cy="196" r="20" fill="#ff3b51" opacity=".2" />
      <circle cx="228" cy="232" r="54" fill="#06090f" />
      <g className="wheel-spin">
        <circle cx="228" cy="232" r="36" fill="none" stroke="#2b3b5e" strokeWidth="7" />
        <g stroke="#3a4f78" strokeWidth="6" strokeLinecap="round">
          <line x1="228" y1="232" x2="261" y2="232" />
          <line x1="228" y1="232" x2="244.5" y2="260.6" />
          <line x1="228" y1="232" x2="211.5" y2="260.6" />
          <line x1="228" y1="232" x2="195" y2="232" />
          <line x1="228" y1="232" x2="211.5" y2="203.4" />
          <line x1="228" y1="232" x2="244.5" y2="203.4" />
        </g>
        <path
          d="M228,196 A36,36 0 0 1 264,232"
          fill="none"
          stroke="#6e9bff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="228" cy="232" r="11" fill="#16223a" />
      </g>
      <circle cx="648" cy="232" r="54" fill="#06090f" />
      <g className="wheel-spin">
        <circle cx="648" cy="232" r="36" fill="none" stroke="#2b3b5e" strokeWidth="7" />
        <g stroke="#3a4f78" strokeWidth="6" strokeLinecap="round">
          <line x1="648" y1="232" x2="681" y2="232" />
          <line x1="648" y1="232" x2="664.5" y2="260.6" />
          <line x1="648" y1="232" x2="631.5" y2="260.6" />
          <line x1="648" y1="232" x2="615" y2="232" />
          <line x1="648" y1="232" x2="631.5" y2="203.4" />
          <line x1="648" y1="232" x2="664.5" y2="203.4" />
        </g>
        <path
          d="M648,196 A36,36 0 0 1 684,232"
          fill="none"
          stroke="#6e9bff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="648" cy="232" r="11" fill="#16223a" />
      </g>
    </svg>
  );
}
