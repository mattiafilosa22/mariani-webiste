import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const responseSchema = z.object({ ok: z.boolean() });

describe("fetchValidated", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("WP_API_URL", "https://cms.example.test/wp-json/mariani/v1");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("ritenta dopo una chiusura transitoria della connessione", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("socket closed"))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const { fetchValidated } = await import("./client");

    await expect(fetchValidated("autos/test", responseSchema)).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ritenta una risposta 508 del limite processi del CMS", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 508 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const { fetchValidated } = await import("./client");

    await expect(fetchValidated("autos/test", responseSchema)).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
