import { describe, expect, it, vi } from "vitest";
import { leadEndpoint, submitLead, type LeadRequest } from "./submitLead";

const validLead: LeadRequest = {
  nome: "Mario Rossi",
  email: "mario@example.com",
  telefono: "0565276520",
  messaggio: "Vorrei un preventivo per la Ford Puma rif. ford-puma.",
  privacy: true,
  autoSlug: "ford-puma",
  fonte: "ford-puma",
  tipoRichiesta: "preventivo",
};

describe("leadEndpoint", () => {
  it("appends /lead to the base, trimming a trailing slash", () => {
    expect(leadEndpoint("https://cms.example.com/wp-json/mariani/v1/")).toBe(
      "https://cms.example.com/wp-json/mariani/v1/lead"
    );
  });
});

describe("submitLead", () => {
  it("POSTs a validated lead with fonte metadata", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await submitLead(validLead, { endpoint: "/api/lead", fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/lead");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.fonte).toBe("ford-puma");
    expect(body.tipoRichiesta).toBe("preventivo");
    expect(body.messaggio).toContain("preventivo");
    // Lo slug auto popola il campo dedicato snake_case `auto_slug` del LeadController.
    expect(body.auto_slug).toBe("ford-puma");
    // Il consenso di dominio (`privacy`) è mappato sul campo `consenso` atteso dal WP.
    expect(body.consenso).toBe(true);
  });

  it("throws when the response is not ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(
      submitLead(validLead, { endpoint: "/api/lead", fetchImpl })
    ).rejects.toThrow(/500/);
  });

  it("rejects an invalid payload before calling fetch", async () => {
    const fetchImpl = vi.fn();
    await expect(
      submitLead(
        { ...validLead, email: "not-an-email" },
        { endpoint: "/api/lead", fetchImpl }
      )
    ).rejects.toBeTruthy();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
