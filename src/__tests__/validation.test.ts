import { describe, it, expect } from "vitest";
import { IssueGoldSchema, OldGoldSchema, PAN_REGEX, HUID_REGEX } from "../lib/validation";

describe("Validation Schemas & Compliance Rules", () => {
  it("validates Indian PAN format strictly", () => {
    expect(PAN_REGEX.test("ABCDE1234F")).toBe(true);
    expect(PAN_REGEX.test("abcde1234f")).toBe(false); // must be uppercase
    expect(PAN_REGEX.test("12345ABCDE")).toBe(false);
    expect(PAN_REGEX.test("ABCD12345F")).toBe(false);
  });

  it("validates 6-character BIS Hallmark Unique ID (HUID)", () => {
    expect(HUID_REGEX.test("CB9421")).toBe(true);
    expect(HUID_REGEX.test("PL4419")).toBe(true);
    expect(HUID_REGEX.test("12345")).toBe(false); // only 5 chars
    expect(HUID_REGEX.test("ABCDEF7")).toBe(false); // 7 chars
  });

  it("rejects gold issue with zero or negative weight", () => {
    const invalidData = {
      karigarId: "KAR-01",
      itemCategory: "necklace",
      grossWeightG: 0,
      purityPct: 91.6,
      allowedWastagePct: 3.0,
      jobNumber: "JOB-TEST",
      expectedReturnDate: "2026-11-10",
    };

    expect(() => IssueGoldSchema.parse(invalidData)).toThrow();
  });

  it("enforces mandatory PAN and blocks cash for Old Gold >= 2 lakhs", () => {
    // 30g pure gold at 12500 is ~3.75 lakhs
    const highValData = {
      showroomBillNo: "SH-9999",
      customerName: "Ramesh Kumar",
      customerPhone: "9842100000",
      grossWeightG: 30.0,
      stoneWeightG: 0,
      dirtDeductionPct: 1.0,
      testedPurityPct: 91.6,
      goldRatePerGram: 12500,
      paymentMode: "cash", // prohibited for >= 2 lakhs
      customerPan: "", // missing
    };

    expect(() => OldGoldSchema.parse(highValData)).toThrow();
  });
});
