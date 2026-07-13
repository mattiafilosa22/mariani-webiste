/**
 * Script inline anti-flash: imposta `data-theme` sull'`<html>` PRIMA
 * dell'idratazione, leggendo localStorage e, in mancanza, `prefers-color-scheme`.
 * Server Component: nessun costo JS lato client oltre allo snippet.
 */
const script = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
