import { renderToStaticMarkup } from "react-dom/server";
import { createTranslator } from "next-intl";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import itMessages from "./it.json";
import enMessages from "./en.json";

const privacyKeys = ["Scheda.form.privacy", "Pages.form.privacy"] as const;

describe("Italian rich-text consent messages", () => {
  it.each(privacyKeys)(
    "renders the privacy link for %s instead of literal tags",
    (key) => {
      const t = createTranslator({ locale: "it", messages: itMessages });
      const markup = renderToStaticMarkup(
        t.rich(key, { a: (chunks) => <Link href="/it/privacy-policy">{chunks}</Link> })
      );

      expect(markup).toContain('<a href="/it/privacy-policy">');
      expect(markup).not.toContain("&lt;a&gt;");
      expect(markup).toContain("Ho letto l’");
      expect(markup).toContain(">informativa sulla privacy</a>");
      expect(markup).not.toContain("acconsento");
    }
  );
});

describe("English rich-text privacy acknowledgement", () => {
  it.each(privacyKeys)("uses acknowledgement wording for %s", (key) => {
    const t = createTranslator({ locale: "en", messages: enMessages });
    const markup = renderToStaticMarkup(
      t.rich(key, { a: (chunks) => <Link href="/en/privacy-policy">{chunks}</Link> })
    );

    expect(markup).toContain("I have read the ");
    expect(markup).toContain(">privacy notice</a>");
    expect(markup).not.toContain("consent to the processing");
  });
});
