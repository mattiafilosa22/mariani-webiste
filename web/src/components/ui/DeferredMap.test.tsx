import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, expect, it } from "vitest";

vi.mock("./LeafletMount", () => ({
  LeafletMount: () => <div data-testid="leaflet-mount" />,
}));

import { DeferredMap } from "./DeferredMap";

describe("DeferredMap", () => {
  it("does not mount the third-party map before an explicit click", async () => {
    render(
      <DeferredMap
        lat={42.925}
        lng={10.521}
        label="Via Adige 3"
        ariaLabel="Mappa"
        zoom={15}
        loadLabel="Carica la mappa"
        loadHint="Le tile saranno richieste a OpenStreetMap."
      />
    );

    expect(screen.queryByTestId("leaflet-mount")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Carica la mappa" })
    );
    expect(screen.queryByTestId("leaflet-mount")).not.toBeNull();
  });
});
