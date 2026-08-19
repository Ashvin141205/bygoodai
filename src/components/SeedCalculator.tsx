import React, { useState } from "react";
import { Calculator, Sprout, TrendingUp, Sparkles, ShoppingBag, Info } from "lucide-react";
import { motion } from "motion/react";

export default function SeedCalculator() {
  const [variety, setVariety] = useState("gg-20");
  const [farmSize, setFarmSize] = useState<number>(5);
  const [unit, setUnit] = useState<"acres" | "bighas">("acres");
  const [season, setSeason] = useState("kharif");
  const [density, setDensity] = useState("standard");

  // Approximate agricultural multipliers for Saurashtra
  // GG-20 needs ~45kg/acre, GG-2 needs ~50kg/acre, G-22 needs ~42kg/acre
  const getSeedMultiplier = () => {
    switch (variety) {
      case "gg-20": return 44;
      case "gg-2": return 48;
      case "g-22": return 42;
      default: return 45;
    }
  };

  // GG-20 yields ~1000kg/acre, GG-2 yields ~800kg/acre, G-22 yields ~950kg/acre
  const getYieldMultiplier = () => {
    switch (variety) {
      case "gg-20": return 1100;
      case "gg-2": return 850;
      case "g-22": return 1000;
      default: return 950;
    }
  };

  // Convert unit to acres for base calculations (1 acre is approximately 2.5 local bighas in Saurashtra)
  const baseAcres = unit === "acres" ? farmSize : farmSize / 2.5;

  const seedRequiredKg = Math.round(baseAcres * getSeedMultiplier() * (density === "dense" ? 1.15 : 1.0));
  const estimatedYieldKg = Math.round(baseAcres * getYieldMultiplier() * (season === "summer" ? 1.1 : 1.0));

  const bags30kg = Math.ceil(seedRequiredKg / 30);
  const bags50kg = Math.ceil(seedRequiredKg / 50);

  const varietiesInfo: { [key: string]: { name: string; desc: string; spacing: string } } = {
    "gg-20": {
      name: "GG-20 (Gujarat Groundnut-20)",
      desc: "Semi-spreading, highly resistant to leaf spot, very popular in Saurashtra due to high pod count and sweet kernel taste.",
      spacing: "45 cm × 10 cm (18\" × 4\")"
    },
    "gg-2": {
      name: "GG-2 (Gujarat Groundnut-2)",
      desc: "Erect, bunch-type, early maturity crop. Exceptional performance in Summer seasons with medium-heavy soil.",
      spacing: "30 cm × 10 cm (12\" × 4\")"
    },
    "g-22": {
      name: "G-22 (Gujarat Groundnut-22)",
      desc: "High oil content, extremely resilient to drought conditions, best for rain-fed agricultural fields near Keshod.",
      spacing: "45 cm × 12 cm (18\" × 5\")"
    }
  };

  return (
    <div className="rounded-3xl border border-[#E5E2D9] bg-white p-6 shadow-sm lg:p-8" id="biyaran-estimator">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9F8F3] text-[#2D4F1E]">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#2D4F1E] font-serif">Saurashtra Biyaran & Yield Calculator</h3>
          <p className="text-xs text-[#5A5A40] font-sans">Estimate your seed needs and potential crop harvest using verified regional averages.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left column - Inputs */}
        <div className="space-y-5 lg:col-span-5">
          {/* Seed Variety Selection */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-2">1. Select Seed Variety</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(varietiesInfo).map((vKey) => (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setVariety(vKey)}
                  className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                    variety === vKey
                      ? "border-[#D4AF37] bg-[#F9F8F3] text-[#2D4F1E] font-semibold shadow-sm"
                      : "border-[#E5E2D9] text-[#5A5A40] hover:border-[#D4AF37]"
                  }`}
                >
                  <span className="block text-xs uppercase font-mono">{vKey}</span>
                  <span className="text-[10px] text-[#5A5A40] font-sans">Seed</span>
                </button>
              ))}
            </div>
          </div>

          {/* Farm Size Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest">2. Sowing Area</label>
              <div className="flex rounded-lg bg-[#F9F8F3] p-0.5 border border-[#E5E2D9]">
                <button
                  type="button"
                  onClick={() => setUnit("acres")}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                    unit === "acres" ? "bg-[#2D4F1E] text-white shadow-sm" : "text-[#5A5A40] hover:text-[#2D4F1E]"
                  }`}
                >
                  Acres
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("bighas")}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                    unit === "bighas" ? "bg-[#2D4F1E] text-white shadow-sm" : "text-[#5A5A40] hover:text-[#2D4F1E]"
                  }`}
                >
                  Bighas
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="500"
                value={farmSize || ""}
                onChange={(e) => setFarmSize(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-[#E5E2D9] bg-white px-4 py-3 text-sm font-semibold text-[#2D2D2A] focus:border-[#2D4F1E] focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A5A40] capitalize">{unit}</span>
            </div>
          </div>

          {/* Season Selector */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-2">3. Sowing Season</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSeason("kharif")}
                className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  season === "kharif"
                    ? "border-[#D4AF37] bg-[#F9F8F3] text-[#2D4F1E] font-semibold"
                    : "border-[#E5E2D9] text-[#5A5A40] hover:border-[#D4AF37]"
                }`}
              >
                <span className="block text-xs">Kharif (Monsoon)</span>
              </button>
              <button
                type="button"
                onClick={() => setSeason("summer")}
                className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  season === "summer"
                    ? "border-[#D4AF37] bg-[#F9F8F3] text-[#2D4F1E] font-semibold"
                    : "border-[#E5E2D9] text-[#5A5A40] hover:border-[#D4AF37]"
                }`}
              >
                <span className="block text-xs">Summer Crop</span>
              </button>
            </div>
          </div>

          {/* Sowing Density */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-2">4. Sowing Spacing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDensity("standard")}
                className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  density === "standard"
                    ? "border-[#D4AF37] bg-[#F9F8F3] text-[#2D4F1E] font-semibold"
                    : "border-[#E5E2D9] text-[#5A5A40] hover:border-[#D4AF37]"
                }`}
              >
                <span className="block text-xs">Standard Spacing</span>
              </button>
              <button
                type="button"
                onClick={() => setDensity("dense")}
                className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  density === "dense"
                    ? "border-[#D4AF37] bg-[#F9F8F3] text-[#2D4F1E] font-semibold"
                    : "border-[#E5E2D9] text-[#5A5A40] hover:border-[#D4AF37]"
                }`}
              >
                <span className="block text-xs">High-Density</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Output Calculations */}
        <div className="rounded-2xl bg-[#F9F8F3] p-5 lg:col-span-7 border border-[#E5E2D9]">
          <h4 className="text-xs font-bold text-[#8B4513] uppercase tracking-widest mb-4">Calculated Estimates</h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Seed Required Box */}
            <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E5E2D9]">
              <div className="flex items-center gap-2 text-[#2D4F1E] mb-1">
                <Sprout className="h-4.5 w-4.5 text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-wider">Required Biyaran</span>
              </div>
              <p className="text-2xl font-bold text-[#2D4F1E] font-mono">
                {seedRequiredKg} <span className="text-xs font-sans font-medium text-[#5A5A40]">Kg</span>
              </p>
              <div className="mt-2 border-t border-[#E5E2D9] pt-2 text-[11px] text-[#5A5A40] space-y-1">
                <div className="flex justify-between">
                  <span>30kg bags:</span>
                  <span className="font-bold text-[#2D2D2A]">{bags30kg} bags</span>
                </div>
                <div className="flex justify-between">
                  <span>50kg bags:</span>
                  <span className="font-bold text-[#2D2D2A]">{bags50kg} bags</span>
                </div>
              </div>
            </div>

            {/* Yield Output Box */}
            <div className="rounded-xl bg-white p-4 shadow-sm border border-[#E5E2D9]">
              <div className="flex items-center gap-2 text-[#8B4513] mb-1">
                <TrendingUp className="h-4.5 w-4.5 text-[#D4AF37]" />
                <span className="text-xs font-bold uppercase tracking-wider">Estimated Harvest</span>
              </div>
              <p className="text-2xl font-bold text-[#2D4F1E] font-mono">
                ~{estimatedYieldKg} <span className="text-xs font-sans font-medium text-[#5A5A40]">Kg</span>
              </p>
              <div className="mt-2 border-t border-[#E5E2D9] pt-2 text-[11px] text-[#5A5A40] space-y-1">
                <div className="flex justify-between">
                  <span>In pods:</span>
                  <span className="font-bold text-[#2D2D2A]">{(estimatedYieldKg / 1000).toFixed(2)} Metric Tons</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg yield:</span>
                  <span className="font-bold text-[#2D2D2A]">~1,000 Kg per Acre</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seed Specification block */}
          <div className="mt-5 rounded-xl border border-[#E5E2D9] bg-white p-4 shadow-sm">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-[#2D4F1E] uppercase tracking-wider mb-2 font-serif">
              <Info className="h-4 w-4 text-[#D4AF37]" />
              Variety Specs: {varietiesInfo[variety].name}
            </h5>
            <p className="text-xs text-[#5A5A40] leading-relaxed mb-3">
              {varietiesInfo[variety].desc}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <div className="rounded bg-[#F9F8F3] px-2.5 py-1 text-[#2D2D2A] border border-[#E5E2D9]">
                Recommended Spacing: <span className="font-semibold">{varietiesInfo[variety].spacing}</span>
              </div>
              <div className="rounded bg-white border border-[#E5E2D9] px-2.5 py-1 text-[#8B4513] font-bold">
                Purity: <span>99.9%</span>
              </div>
              <div className="rounded bg-white border border-[#E5E2D9] px-2.5 py-1 text-[#2D4F1E] font-bold">
                Germination: <span>85%+ Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-[#5A5A40] border border-[#E5E2D9]">
            <Sparkles className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
            <div>
              <span className="font-bold text-[#2D4F1E]">Need specific custom soil advice?</span> Click the floating green chat bubble in the bottom corner to speak directly with our agricultural expert.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
