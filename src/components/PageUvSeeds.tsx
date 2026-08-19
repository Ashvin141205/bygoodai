import React from "react";
import { Sprout, ShieldCheck, Award, Leaf, Calendar, CheckCircle, Flame, Droplet } from "lucide-react";
import SeedCalculator from "./SeedCalculator";

interface PageUvSeedsProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageUvSeeds({ onOpenInquiry }: PageUvSeedsProps) {
  const varieties = [
    {
      name: "UV Seeds: GG-20 Premium (Gujarat Groundnut 20)",
      gujName: "યુ.વી. સીડ્સ: જીજી-૨૦ રિસર્ચ મગફળી બીયારણ",
      type: "Semi-spreading",
      duration: "115 - 120 Days",
      germination: "88% - 92% guaranteed",
      oil: "49.5% - 51%",
      desc: "Saurashtra's most celebrated groundnut variety. Specially selected for deep black soils. Highly resilient to fungal leaf spot and delivers exceptionally high pod counts.",
      dosage: "44 - 45 Kg per Acre",
      spacing: "45 cm × 10 cm (18\" × 4\")"
    },
    {
      name: "UV Seeds: GG-2 Bunch Super Early (Gujarat Groundnut 2)",
      gujName: "યુ.વી. સીડ્સ: જીજી-૨ અર્લી સીડ્સ",
      type: "Erect / Bunch-type",
      duration: "100 - 105 Days",
      germination: "90% - 93% guaranteed",
      oil: "48% - 50%",
      desc: "Perfect early-maturing bunch variety. Requires minimal monsoon cycles and flourishes beautifully in light sandy loam or irrigated summer plots.",
      dosage: "48 - 50 Kg per Acre",
      spacing: "30 cm × 10 cm (12\" × 4\")"
    },
    {
      name: "UV Seeds: G-22 Elite (Gujarat Groundnut 22)",
      gujName: "યુ.વી. સીડ્સ: જી-૨૨ ભીમકાય બોલ્ડ બીયારણ",
      type: "Semi-spreading bold",
      duration: "118 - 123 Days",
      germination: "86% - 90% guaranteed",
      oil: "50% - 52%",
      desc: "Features highly robust roots and extremely bold pods. Excellent drought resistance with heavy vegetative cover, preventing soil moisture evaporation.",
      dosage: "42 - 44 Kg per Acre",
      spacing: "45 cm × 12 cm (18\" × 5\")"
    }
  ];

  const benefits = [
    {
      title: "Phenomenal Germination",
      desc: "Checked in modern temperature-controlled chambers to secure sprouts above 85% before packing.",
      icon: <Droplet className="h-5 w-5 text-[#2D4F1E]" />
    },
    {
      title: "Perfect Sizing Uniformity",
      desc: "Graded via physical gravity shake rigs. Prevents mechanical clogging in automatic seed drill tractors.",
      icon: <Award className="h-5 w-5 text-[#2D4F1E]" />
    },
    {
      title: "Insect & Fungal Defense",
      desc: "Coated with highly tested protective treatments to prevent seed-rot, white-grub, and root-borer attacks.",
      icon: <ShieldCheck className="h-5 w-5 text-[#2D4F1E]" />
    },
    {
      title: "High Shelling Percentage",
      desc: "Our seeds feature thin shells with highly plump double kernels, optimizing your final crop market weight.",
      icon: <Leaf className="h-5 w-5 text-[#2D4F1E]" />
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* BRAND HERO */}
      <section className="bg-gradient-to-br from-[#1C3213] to-[#2D4F1E] text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Background graphic */}
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-20 opacity-15">
          <Sprout className="h-80 w-80 text-white animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-8 items-center text-left">
          <div className="md:col-span-8 space-y-5">
            <span className="bg-[#D4AF37] text-black text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block">
              Premium Seed Brand of Kirit Corporation
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
              UV Seeds (યુ.વી. સીડ્સ)
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl">
              **UV Seeds** is Kirit Corporation's dedicated groundnut seed division. Trusted by over 500 farming families in Saurashtra, we deliver specialized, high-vigor, certified planting seeds (biyaran) that secure early sprouting success and robust crop yields.
            </p>
            <div className="flex gap-4">
              <a
                href="#biyaran-estimator"
                className="rounded-xl bg-[#D4AF37] text-[#1C3213] font-extrabold text-xs px-5 py-3 hover:bg-white transition-all cursor-pointer"
              >
                Estimate Seed Quantity
              </a>
              <button
                onClick={() => onOpenInquiry("UV Seeds General Booking")}
                className="rounded-xl bg-white/10 border border-white/30 text-white font-extrabold text-xs px-5 py-3 hover:bg-white/20 transition-all cursor-pointer"
              >
                Inquire Seed Booking
              </button>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              <img
                src="/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
                alt="UV Seeds Sacks"
                referrerPolicy="no-referrer"
                className="rounded-3xl h-64 w-64 object-cover border border-white/20 shadow-2xl"
              />
              <span className="absolute bottom-4 left-4 bg-white text-[#2D4F1E] text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 shadow-lg">
                🌱 100% Selected Biyaran
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE UV SEEDS */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Sowing Advantages</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">The UV Seeds Quality Standards</h2>
          <p className="text-sm text-[#5A5A40] max-w-md mx-auto">Why Saurashtra's progressive farmers insist on Kirit Corporation's specialized sowing seeds.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {benefits.map((b, idx) => (
            <div key={idx} className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E] mb-4">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-900 font-serif mb-2">{b.title}</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEED VARIETIES GRID */}
      <section className="bg-[#F9F8F3] py-16 border-y border-[#E5E2D9]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-widest">Cultivars Catalog</span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Groundnut Seed Varieties</h2>
            <p className="text-sm text-[#5A5A40] max-w-md mx-auto">Detailed technical characteristics and regional sowing metrics for our certified seed lines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {varieties.map((v, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] bg-[#2D4F1E] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{v.type}</span>
                    <h3 className="font-bold text-lg text-gray-900 font-serif mt-2 leading-tight">{v.name}</h3>
                    <p className="text-xs font-semibold text-[#8B4513] mt-0.5 font-sans">{v.gujName}</p>
                  </div>
                  <p className="text-xs text-[#5A5A40] leading-relaxed">{v.desc}</p>
                  
                  <hr className="border-[#E5E2D9]" />
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Germination Index:</span><span className="font-bold text-gray-900">{v.germination}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Oil Concentration:</span><span className="font-bold text-gray-900">{v.oil}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Sowing Duration:</span><span className="font-bold text-gray-900">{v.duration}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Acre Dosage:</span><span className="font-bold text-[#2D4F1E]">{v.dosage}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Row Spacing:</span><span className="font-bold text-[#8B4513]">{v.spacing}</span></div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onOpenInquiry(`Seed Sowing: ${v.name}`)}
                    className="w-full text-center rounded-xl bg-[#2D4F1E] text-white py-2 text-xs font-bold hover:bg-[#3D5F2F] transition-colors"
                  >
                    Inquire Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOWING INSTRUCTIONS GUIDE */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-wider">Agronomist Tips</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight leading-tight">Recommended Sowing & Usage Metrics</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Sowing groundnut seeds is a highly sensitive process where small adjustments in environmental conditions lead to massive differences in pod yields. Our senior agricultural specialists suggest following these basic Saurashtra benchmarks:
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700">
            <div className="flex gap-3 items-start">
              <div className="h-6 w-6 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-[#2D4F1E] font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-bold text-gray-900">Optimal Soil Temperature & Sowing Depth</p>
                <p className="text-xs text-[#5A5A40] mt-0.5">Sow seeds exactly at a depth of 5 to 7 cm. Sowing deeper than 8 cm delays seedling sprouting and exhausts cotyledon reserves.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="h-6 w-6 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-[#2D4F1E] font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-bold text-gray-900">Regional Soil Moisture Check</p>
                <p className="text-xs text-[#5A5A40] mt-0.5">Wait until the first monsoon rain has penetrated at least 15 cm deep into the sandy-loam soil. Sowing in dry soil leads to seed dehydration.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="h-6 w-6 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-[#2D4F1E] font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-bold text-gray-900">Safe Protectant Coatings</p>
                <p className="text-xs text-[#5A5A40] mt-0.5">UV Seeds are pre-coated with highly calibrated fungicides. If raw seed handling is needed, treat seeds gently to avoid bruising seed skins.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* SEED REQUIREMENT CALCULATOR EMBEDDED */}
          <div id="biyaran-estimator">
            <SeedCalculator />
          </div>
        </div>
      </section>
    </div>
  );
}
