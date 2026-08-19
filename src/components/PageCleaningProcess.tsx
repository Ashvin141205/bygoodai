import React from "react";
import { Filter, Eye, ShieldCheck, Flame, Cpu, ArrowRight } from "lucide-react";

interface PageCleaningProcessProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageCleaningProcess({ onOpenInquiry }: PageCleaningProcessProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* HERO */}
      <section className="bg-gradient-to-r from-[#1C3213] to-[#2D4F1E] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Physical Purity</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            The Industrial Cleaning Process
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Eliminating physical impurities, field mud clods, high-density stones, and foreign debris to guard crop safety and ensure decortication machinery protection.
          </p>
        </div>
      </section>

      {/* THREE-STAGE DENSITY SEPARATION VIEW */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-wider">How We Clean</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Multi-Stage Physical & Pressure Cleaning</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            When raw groundnut pods arrive from Saurashtra farm sectors, they are coated with dried soil, micro-pebbles, leaves, and physical field weeds. Decorticating uncleaned pods causes extensive mechanical abrasion and forces mud dust directly into the oil-rich kernels.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            At Kirit Corporation, we enforce an elaborate triple-dry screening cycle before the groundnut shells are split open:
          </p>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-white border border-[#E5E2D9] rounded-2xl shadow-sm">
              <h4 className="font-bold text-gray-900">1. Raw Pod Aspiration & Dust Removal</h4>
              <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">Heavy suction fans lift away lightweight chaff, hollow shells, fibers, and agricultural weeds into cyclone filters, leaving only weighty pods.</p>
            </div>
            <div className="p-4 bg-white border border-[#E5E2D9] rounded-2xl shadow-sm">
              <h4 className="font-bold text-gray-900">2. Pressurized Air-Jet De-Stoning</h4>
              <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">Pods flow onto a pressurized vibrating screen bed. The difference in specific gravity forces heavier stones and micro-pebbles to travel upward while lighter pods float smoothly downward.</p>
            </div>
            <div className="p-4 bg-white border border-[#E5E2D9] rounded-2xl shadow-sm">
              <h4 className="font-bold text-gray-900">3. Magnetic Soil Extraction</h4>
              <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">High-density neodymium magnetic drums drag out iron oxides, soil minerals, and heavy trace elements to isolate organic peanuts perfectly.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F9F8F3] border border-[#E5E2D9] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-200 pb-3">Cleaning Quality Parameters</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Stone Extraction Rate:</span><span className="font-bold text-[#2D4F1E] bg-[#2D4F1E]/5 px-2.5 py-1 rounded">100.00% Cleaned</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Dust/Chaff Filtration:</span><span className="font-bold text-[#2D4F1E] bg-[#2D4F1E]/5 px-2.5 py-1 rounded">99.98% Aspirated</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Inert Mud Clod Elimination:</span><span className="font-bold text-[#2D4F1E] bg-[#2D4F1E]/5 px-2.5 py-1 rounded">99.5% Pulverized</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium">Maximum Permitted foreign matter:</span><span className="font-bold text-[#8B4513] bg-[#8B4513]/5 px-2.5 py-1 rounded">Under 0.10% by mass</span></div>
          </div>

          <div className="p-4 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#8B4513]">
            <p className="font-bold uppercase text-[10px] tracking-wider mb-1">💡 Engineering Advisory</p>
            <p className="text-[11px] leading-relaxed">Our physical pre-cleaners run with 100% dry air. We do NOT use water washing, preserving the low moisture indices necessary to inhibit aflatoxin development.</p>
          </div>

          <button
            onClick={() => onOpenInquiry("Custom Cleaning Job Work")}
            className="w-full text-center rounded-xl bg-[#2D4F1E] text-white py-3 text-xs font-bold hover:bg-[#3D5F2F] shadow transition-colors"
          >
            Inquire Cleaning Job Work
          </button>
        </div>
      </section>
    </div>
  );
}
