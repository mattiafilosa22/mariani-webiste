import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Orario } from "@/domain";
import { isClosed } from "../lib/pages";

type HoursTableProps = {
  /** Titolo del reparto (es. "Vendita", "Officina"). */
  caption: string;
  rows: Orario[];
  /** Icona opzionale accanto alla didascalia. */
  icon?: ReactNode;
};

/**
 * Tabella orari accessibile (RSC): intestazioni di colonna e di riga con
 * `scope`, `caption` per screen reader, "Chiuso" evidenziato semanticamente.
 * I dati arrivano dalle impostazioni globali (vendita / officina).
 */
export async function HoursTable({ caption, rows, icon }: HoursTableProps) {
  const t = await getTranslations("Pages.hours");

  return (
    <div className="hours__group">
      <p className="hours__cap">
        {icon}
        {caption}
      </p>
      <div className="table-wrap">
        <table className="hours-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{t("giorni")}</th>
              <th scope="col">{t("orario")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const closed = isClosed(row.apertura);
              return (
                <tr key={row.giorni}>
                  <th scope="row">{row.giorni}</th>
                  <td>
                    {closed ? (
                      <span className="is-closed">{t("closed")}</span>
                    ) : (
                      row.apertura
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
