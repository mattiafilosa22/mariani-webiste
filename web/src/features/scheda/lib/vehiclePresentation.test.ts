import { describe, expect, it } from "vitest";
import { shouldShowRegistrationData } from "./vehiclePresentation";

describe("shouldShowRegistrationData", () => {
  it("hides registration year and mileage for new vehicles", () => {
    expect(shouldShowRegistrationData("nuova")).toBe(false);
  });

  it.each(["usata", "km0"] as const)(
    "keeps registration year and mileage for %s vehicles",
    (tipo) => {
      expect(shouldShowRegistrationData(tipo)).toBe(true);
    }
  );
});
