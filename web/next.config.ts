import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Static export: nessun runtime Node in produzione (hosting VHosting solo-PHP).
  output: "export",
  trailingSlash: true,
  // Fissa la root del workspace su `web/`: evita il warning "multiple lockfiles"
  // quando esistono più package-lock.json risalendo l'albero delle cartelle.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    // Il CMS gira su un piano condiviso con un limite basso di processi PHP.
    // Un solo worker e una sola pagina per volta evitano risposte 508 durante
    // l'export, senza cambiare la concorrenza del sito statico a runtime.
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    // L'ottimizzatore server di Next non è disponibile in export statico.
    // Le foto arrivano già dimensionate dalle image-sizes di WordPress.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
