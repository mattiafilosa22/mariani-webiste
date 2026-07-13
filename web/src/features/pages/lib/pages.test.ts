import { describe, expect, it } from "vitest";
import { durataOptions, isClosed } from "./pages";

describe("durataOptions", () => {
  it("genera i passi da min a max con step 12", () => {
    expect(durataOptions(12, 72)).toEqual([12, 24, 36, 48, 60, 72]);
  });

  it("include il min anche quando non raggiunge esattamente il max", () => {
    expect(durataOptions(24, 50)).toEqual([24, 36, 48]);
  });

  it("gestisce min === max", () => {
    expect(durataOptions(36, 36)).toEqual([36]);
  });

  it("restituisce lista vuota su input non validi", () => {
    expect(durataOptions(0, 72)).toEqual([]);
    expect(durataOptions(72, 12)).toEqual([]);
  });
});

describe("isClosed", () => {
  it("riconosce 'Chiuso' e 'Closed' con spazi/maiuscole", () => {
    expect(isClosed("Chiuso")).toBe(true);
    expect(isClosed("  closed ")).toBe(true);
    expect(isClosed("CHIUSO")).toBe(true);
  });

  it("non segnala come chiuso una fascia oraria reale", () => {
    expect(isClosed("08:30–12:30 / 14:30–18:30")).toBe(false);
    expect(isClosed("")).toBe(false);
  });
});
