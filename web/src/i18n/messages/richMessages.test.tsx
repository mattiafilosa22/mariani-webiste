import { renderToStaticMarkup } from "react-dom/server";
import { createTranslator } from "next-intl";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import itMessages from "./it.json";

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
    }
  );
});
