import { describe, it, expect } from "vitest";
import { extractScaleDataFromText } from "../lib/tesseract-ocr";

describe("Scale OCR and Karat Meter Parser", () => {
  it("extracts 3-decimal gross weight from scale readout string", () => {
    const raw = "SARTORIUS STABLE [OK] 120.000 g NET ZERO";
    const result = extractScaleDataFromText(raw);
    expect(result.weightG).toBe(120.0);
    expect(result.confidence).toBeGreaterThanOrEqual(90);
  });

  it("extracts weight with 3 decimals from necklace receipt string", () => {
    const raw = "METTLER TOLEDO 112.450 g STABLE";
    const result = extractScaleDataFromText(raw);
    expect(result.weightG).toBe(112.45);
  });

  it("extracts scrap weight from small scale readout", () => {
    const raw = "TARE 3.300 g";
    const result = extractScaleDataFromText(raw);
    expect(result.weightG).toBe(3.3);
  });

  it("extracts purity percentage and Karat values from Karat Meter printout", () => {
    const raw = "XRF SPECTROMETER Au: 91.60 % 22K JEWELLERY SAMPLE";
    const result = extractScaleDataFromText(raw);
    expect(result.purityPct).toBe(91.6);
  });
});

