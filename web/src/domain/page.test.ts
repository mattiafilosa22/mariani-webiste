import { describe, expect, it } from "vitest";
import { homeBentoSchema, homeServiceSchema } from "./page";

const image = {
  src: "https://cms.example.test/catalogo.jpg",
  srcset: "https://cms.example.test/catalogo-768.jpg 768w",
  width: 1200,
  height: 900,
  alt: "Cliente che consulta il catalogo nello showroom Mariani",
};

describe("homepage editorial images", () => {
  it("keeps a responsive image on bento and service blocks", () => {
    const bento = homeBentoSchema.parse({
      title: "Servizi",
      feature: { title: "Showroom", text: "Catalogo" },
      highlight: { title: "Finanziamenti", text: "Su misura" },
      stats: [],
      image,
    });
    const service = homeServiceSchema.parse({
      title: "Officina",
      lead: "Tecnici qualificati",
      checklist: [],
      image,
    });

    expect(bento.image).toEqual(image);
    expect(service.image).toEqual(image);
  });

  it("keeps images optional for a stable CMS fallback", () => {
    const bento = homeBentoSchema.parse({
      title: "Servizi",
      feature: { title: "Showroom", text: "Catalogo" },
      highlight: { title: "Finanziamenti", text: "Su misura" },
      stats: [],
    });

    expect(bento.image).toBeUndefined();
  });
});
