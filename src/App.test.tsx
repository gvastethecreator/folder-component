import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { STYLES_DATA } from "./data/stylesData";

describe("App", () => {
  it("mounts without crashing and renders the controls panel", () => {
    render(<App />);
    expect(screen.getByText(/Tipo de Despliegue/i)).toBeInTheDocument();
  });

  it("renders every style folder from the data", () => {
    render(<App />);

    for (const folder of STYLES_DATA) {
      expect(screen.getByText(folder.title)).toBeInTheDocument();
    }
  });
});
