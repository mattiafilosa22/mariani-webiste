import { describe, expect, it } from "vitest";
import type { AutoSummary } from "@/domain";
import { buildFacets, availableModelli } from "./facets";
import {
  filterAutos,
  matchesFilters,
  paginate,
  paginationModel,
  runCatalog,
  sortAutos,
} from "./filter";
import {
  countActiveFilters,
  isDefaultFilters,
  parseFilters,
  serializeFilters,
} from "./params";
import { scopeAutos } from "./scopes";
import { EMPTY_FILTERS, type CatalogFilters } from "./types";

function auto(overrides: Partial<AutoSummary>): AutoSummary {
  return {
    id: "x",
    slug: "x",
    tipo: "usata",
    categoria: "auto",
    marca: "Ford",
    modello: "Focus",
    versione: "",
    anno: 2022,
    km: 20000,
    prezzoListino: 20000,
    prezzoFinale: 20000,
    alimentazione: "benzina",
    cambio: "manuale",
    trazione: "anteriore",
    carrozzeria: "Berlina",
    potenzaCv: 120,
    colore: "grigio",
    badge: [],
    inEvidenza: false,
    copertina: { src: "/p.svg", width: 640, height: 360, alt: "auto" },
    ...overrides,
  };
}

function filters(overrides: Partial<CatalogFilters>): CatalogFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

const dataset: AutoSummary[] = [
  auto({ id: "1", slug: "puma-hyb", modello: "Puma", tipo: "nuova", alimentazione: "ibrido", carrozzeria: "SUV compatto", prezzoFinale: 24900, anno: 2024, km: 0, potenzaCv: 125, colore: "blu", badge: ["promo", "pronta"] }),
  auto({ id: "2", slug: "explorer-ev", modello: "Explorer EV", tipo: "nuova", alimentazione: "elettrico", carrozzeria: "SUV", prezzoFinale: 41500, anno: 2025, km: 0, potenzaCv: 170, colore: "grigio", badge: ["elettrico", "promo"] }),
  auto({ id: "3", slug: "focus-used", modello: "Focus", tipo: "usata", alimentazione: "benzina", carrozzeria: "Berlina", prezzoFinale: 19900, anno: 2023, km: 12400, potenzaCv: 125, colore: "rosso", badge: ["pronta"] }),
  auto({ id: "4", slug: "fiesta-neo", modello: "Fiesta", tipo: "usata", alimentazione: "benzina", carrozzeria: "Utilitaria", prezzoFinale: 13500, anno: 2021, km: 28900, potenzaCv: 75, colore: "argento", badge: ["neopatentati", "pronta"] }),
  auto({ id: "5", slug: "transit", modello: "Transit", categoria: "commerciale", tipo: "nuova", alimentazione: "diesel", carrozzeria: "Furgone", prezzoFinale: 31500, anno: 2024, km: 0, potenzaCv: 136, colore: "bianco", badge: ["promo"] }),
];

describe("scopeAutos", () => {
  it("filtra per categoria", () => {
    const only = scopeAutos(dataset, {
      key: "auto",
      categoria: "auto",
      segments: ["auto"],
    });
    expect(only.every((a) => a.categoria === "auto")).toBe(true);
    expect(only).toHaveLength(4);
  });

  it("filtra per categoria e tipo bloccato", () => {
    const nuove = scopeAutos(dataset, {
      key: "nuove",
      categoria: "auto",
      lockedTipo: "nuova",
      segments: ["auto", "nuove"],
    });
    expect(nuove.map((a) => a.slug)).toEqual(["puma-hyb", "explorer-ev"]);
  });
});

describe("matchesFilters", () => {
  it("marca è case-insensitive (alias ricerca rapida)", () => {
    expect(matchesFilters(auto({ marca: "Ford" }), filters({ marca: ["ford"] }))).toBe(true);
  });

  it("combina più vincoli in AND", () => {
    const f = filters({ alimentazione: ["benzina"], prezzoMax: 15000 });
    const out = filterAutos(dataset, f);
    expect(out.map((a) => a.slug)).toEqual(["fiesta-neo"]);
  });

  it("range prezzo inclusivo agli estremi", () => {
    const f = filters({ prezzoMin: 19900, prezzoMax: 24900 });
    expect(filterAutos(dataset, f).map((a) => a.slug).sort()).toEqual(["focus-used", "puma-hyb"]);
  });

  it("range CV filtra sulla potenza", () => {
    expect(filterAutos(dataset, filters({ cvMin: 130 })).map((a) => a.slug).sort()).toEqual(["explorer-ev", "transit"]);
  });

  it("toggle soloNeopatentati usa i badge", () => {
    expect(filterAutos(dataset, filters({ soloNeopatentati: true })).map((a) => a.slug)).toEqual(["fiesta-neo"]);
  });

  it("filtro tipo multiplo", () => {
    expect(filterAutos(dataset, filters({ tipo: ["nuova"] }))).toHaveLength(3);
  });

  it("nessun risultato quando i vincoli si escludono", () => {
    expect(filterAutos(dataset, filters({ alimentazione: ["elettrico"], prezzoMax: 10000 }))).toEqual([]);
  });
});

describe("sortAutos", () => {
  it("prezzo crescente", () => {
    expect(sortAutos(dataset, "prezzo-asc").map((a) => a.prezzoFinale)).toEqual([13500, 19900, 24900, 31500, 41500]);
  });
  it("prezzo decrescente", () => {
    expect(sortAutos(dataset, "prezzo-desc")[0].slug).toBe("explorer-ev");
  });
  it("km crescente", () => {
    expect(sortAutos(dataset, "km-asc")[0].km).toBe(0);
  });
  it("più recenti per anno", () => {
    expect(sortAutos(dataset, "recenti")[0].anno).toBe(2025);
  });
  it("non muta l'array di input", () => {
    const copy = [...dataset];
    sortAutos(dataset, "prezzo-asc");
    expect(dataset).toEqual(copy);
  });
});

describe("availableModelli (dipendenza modello↔marca)", () => {
  it("senza marca selezionata elenca tutti i modelli", () => {
    const models = availableModelli(dataset, []).map((m) => m.value);
    expect(models).toContain("Puma");
    expect(models).toContain("Focus");
  });

  it("con marca inesistente non elenca modelli", () => {
    expect(availableModelli(dataset, ["Volkswagen"])).toEqual([]);
  });

  it("con marca selezionata (case-insensitive) elenca i suoi modelli", () => {
    const models = availableModelli(dataset, ["ford"]);
    expect(models.map((m) => m.value)).toContain("Focus");
  });
});

describe("buildFacets", () => {
  it("espone solo valori presenti con conteggi ordinati", () => {
    const facets = buildFacets(dataset);
    expect(facets.alimentazioni.map((f) => f.value)).toContain("elettrico");
    expect(facets.alimentazioni.find((f) => f.value === "benzina")?.count).toBe(2);
    expect(facets.prezzo).toEqual({ min: 13500, max: 41500 });
    expect(facets.km).toEqual({ min: 0, max: 28900 });
    expect(facets.cv).toEqual({ min: 75, max: 170 });
  });

  it("bounds nulli su dataset vuoto", () => {
    expect(buildFacets([]).prezzo).toBeNull();
  });
});

describe("paginate", () => {
  it("estrae la pagina e riporta i totali", () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const result = paginate(items, 2, 9);
    expect(result.items).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result.pageCount).toBe(3);
    expect(result.total).toBe(20);
  });

  it("clampa una pagina fuori range", () => {
    expect(paginate([1, 2, 3], 99, 9).page).toBe(1);
    expect(paginate([1, 2, 3], 0, 9).page).toBe(1);
  });

  it("dataset vuoto → una pagina", () => {
    expect(paginate([], 1, 9)).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});

describe("paginationModel", () => {
  it("una sola pagina", () => {
    expect(paginationModel(1, 1)).toEqual([1]);
  });
  it("inserisce ellissi ai lati", () => {
    expect(paginationModel(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });
  it("nessuna ellissi iniziale vicino all'inizio", () => {
    expect(paginationModel(2, 5)).toEqual([1, 2, 3, "ellipsis", 5]);
  });
});

describe("runCatalog", () => {
  it("compone filtro, ordinamento e paginazione", () => {
    const result = runCatalog(dataset, filters({ tipo: ["nuova"], sort: "prezzo-asc" }));
    expect(result.total).toBe(3);
    expect(result.items.map((a) => a.prezzoFinale)).toEqual([24900, 31500, 41500]);
  });
});

describe("params round-trip", () => {
  it("serializza e ri-parsa senza perdite", () => {
    const f = filters({
      marca: ["Ford"],
      alimentazione: ["ibrido", "elettrico"],
      prezzoMin: 10000,
      prezzoMax: 40000,
      colore: ["blu"],
      soloPromo: true,
      sort: "prezzo-asc",
      page: 3,
    });
    const roundTrip = parseFilters(serializeFilters(f));
    expect(roundTrip).toEqual(f);
  });

  it("omette i default (URL vuoto)", () => {
    expect(serializeFilters(EMPTY_FILTERS).toString()).toBe("");
    expect(isDefaultFilters(EMPTY_FILTERS)).toBe(true);
  });

  it("scarta valori enum non validi", () => {
    const params = new URLSearchParams("alimentazione=benzina,plutonio&cambio=turbo");
    const parsed = parseFilters(params);
    expect(parsed.alimentazione).toEqual(["benzina"]);
    expect(parsed.cambio).toEqual([]);
  });

  it("legge gli alias della ricerca rapida (marca/tipo/prezzoMax)", () => {
    const parsed = parseFilters(new URLSearchParams("marca=ford&tipo=nuova&prezzoMax=25000"));
    expect(parsed.marca).toEqual(["ford"]);
    expect(parsed.tipo).toEqual(["nuova"]);
    expect(parsed.prezzoMax).toBe(25000);
  });

  it("ignora numeri negativi o non numerici", () => {
    const parsed = parseFilters(new URLSearchParams("prezzoMin=-5&annoMax=abc"));
    expect(parsed.prezzoMin).toBeNull();
    expect(parsed.annoMax).toBeNull();
  });

  it("conta i filtri attivi", () => {
    const f = filters({ marca: ["Ford"], alimentazione: ["ibrido"], prezzoMax: 30000, soloPromo: true });
    expect(countActiveFilters(f)).toBe(4);
  });
});
