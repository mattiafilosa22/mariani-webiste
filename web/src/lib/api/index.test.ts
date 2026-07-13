import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Verifica il comportamento del data layer rispetto alla modalità STRICT:
 * di default ricade sul mock, in strict propaga gli errori (niente fallback).
 */

const mocks = vi.hoisted(() => ({
  isApiConfigured: vi.fn(),
  isStrict: vi.fn(),
  fetchValidated: vi.fn(),
}));

vi.mock("./client", () => ({
  ...mocks,
  ApiError: class ApiError extends Error {},
}));

import { getSettings } from "./index";

afterEach(() => {
  vi.clearAllMocks();
});

describe("getSettings — fallback vs strict", () => {
  it("ricade sul mock quando la fetch fallisce (default, non strict)", async () => {
    mocks.isApiConfigured.mockReturnValue(true);
    mocks.isStrict.mockReturnValue(false);
    mocks.fetchValidated.mockRejectedValue(new Error("boom"));

    const settings = await getSettings({ locale: "it" });

    expect(settings.nomeAzienda).toBe("Mariani");
  });

  it("propaga l'errore in modalità strict (nessun fallback al mock)", async () => {
    mocks.isApiConfigured.mockReturnValue(true);
    mocks.isStrict.mockReturnValue(true);
    mocks.fetchValidated.mockRejectedValue(new Error("boom"));

    await expect(getSettings({ locale: "it" })).rejects.toThrow("boom");
  });

  it("in strict considera errore una risorsa attesa ma assente (null)", async () => {
    mocks.isApiConfigured.mockReturnValue(true);
    mocks.isStrict.mockReturnValue(true);
    mocks.fetchValidated.mockResolvedValue(null);

    await expect(getSettings({ locale: "it" })).rejects.toThrow(/strict/i);
  });

  it("in strict senza WP_API_URL configurata fallisce subito", async () => {
    mocks.isApiConfigured.mockReturnValue(false);
    mocks.isStrict.mockReturnValue(true);

    await expect(getSettings({ locale: "it" })).rejects.toThrow(/WP_API_URL/);
  });
});
