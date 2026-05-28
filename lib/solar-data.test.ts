import { describe, expect, it } from "vitest";
import {
  getDailyReadings,
  summarise,
  SYSTEM_CONFIG,
  type DailyReading,
} from "@/lib/solar-data";

describe("getDailyReadings", () => {
  it("returns the requested number of readings", () => {
    expect(getDailyReadings(7)).toHaveLength(7);
    expect(getDailyReadings(30)).toHaveLength(30);
  });

  it("is deterministic for a given day count", () => {
    expect(getDailyReadings(14)).toEqual(getDailyReadings(14));
  });

  it("returns chronologically ascending, sane readings", () => {
    const readings = getDailyReadings(10);
    for (let i = 1; i < readings.length; i++) {
      expect(readings[i].date > readings[i - 1].date).toBe(true);
    }
    for (const r of readings) {
      expect(r.generationKwh).toBeGreaterThan(0);
      expect(r.consumptionKwh).toBeGreaterThan(0);
      expect(r.peakKw).toBeLessThanOrEqual(SYSTEM_CONFIG.capacityKwp);
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("ends today", () => {
    const readings = getDailyReadings(3);
    expect(readings.at(-1)?.date).toBe(new Date().toISOString().slice(0, 10));
  });
});

describe("summarise", () => {
  it("returns zeroed stats for no readings", () => {
    const stats = summarise([]);
    expect(stats.totalGenerationKwh).toBe(0);
    expect(stats.bestDay).toBeNull();
  });

  it("totals, averages and derives factors correctly", () => {
    const readings: DailyReading[] = [
      { date: "2026-01-01", generationKwh: 100, consumptionKwh: 40, peakKw: 20, sunHours: 8 },
      { date: "2026-01-02", generationKwh: 60, consumptionKwh: 50, peakKw: 18, sunHours: 6 },
    ];
    const stats = summarise(readings);

    expect(stats.totalGenerationKwh).toBe(160);
    expect(stats.totalConsumptionKwh).toBe(90);
    expect(stats.avgDailyGenerationKwh).toBe(80);
    expect(stats.bestDay?.date).toBe("2026-01-01");
    expect(stats.co2AvoidedKg).toBe(+(160 * SYSTEM_CONFIG.co2PerKwh).toFixed(1));
    expect(stats.estimatedSavings).toBe(+(160 * SYSTEM_CONFIG.pricePerKwh).toFixed(2));
  });

  it("caps self-sufficiency at 100% when generation exceeds consumption", () => {
    const readings: DailyReading[] = [
      { date: "2026-01-01", generationKwh: 200, consumptionKwh: 50, peakKw: 30, sunHours: 9 },
    ];
    expect(summarise(readings).selfSufficiencyPct).toBe(100);
  });

  it("reports partial self-sufficiency when generation is short", () => {
    const readings: DailyReading[] = [
      { date: "2026-01-01", generationKwh: 25, consumptionKwh: 100, peakKw: 10, sunHours: 4 },
    ];
    expect(summarise(readings).selfSufficiencyPct).toBe(25);
  });
});
