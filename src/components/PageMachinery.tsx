import React from "react";
import { Cpu, ShieldCheck, Award, Layers, Zap, Hammer } from "lucide-react";
import { machineryList } from "../data";

interface PageMachineryProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageMachinery({ onOpenInquiry }: PageMachineryProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* MACHINERY HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Industrial Assetry</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Machinery & Equipment Catalog
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Take an in-depth tour of Kirit Corporation's modern machinery floor. We use automated physical separators, low-abrasion bucket lifts, and high-precision CCD optics.
          </p>
        </div>
      </section>

      {/* MACHINERY CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {machineryList.map((m) => (
            <div 
              key={m.id}
              className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image frame */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={m.image}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E5E2D9] text-[#2D4F1E] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {m.id}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-serif leading-tight">{m.name}</h3>
                    <p className="text-[10px] text-[#8B4513] font-mono uppercase tracking-wider mt-0.5">Sondarda Asset Registry</p>
                  </div>

                  <p className="text-xs text-[#5A5A40] leading-relaxed font-semibold">Purpose: {m.purpose}</p>
                  
                  <p className="text-xs text-[#5A5A40] leading-relaxed">{m.workingProcess}</p>
                  
                  <div className="p-4 bg-[#F9F8F3] border border-[#E5E2D9] rounded-2xl space-y-2">
                    <h4 className="text-[10px] font-extrabold text-[#2D4F1E] uppercase tracking-wider">Engineering Specs:</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between border-b border-gray-200/40 pb-1">
                        <span className="text-gray-500">Output Capacity:</span>
                        <span className="font-bold text-gray-800">{m.capacity}</span>
                      </div>
                      {Object.entries(m.specs).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-gray-200/40 pb-1 last:border-b-0 last:pb-0">
                          <span className="text-gray-500 truncate mr-2">{key}:</span>
                          <span className="font-bold text-gray-800 text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="p-6 pt-0 mt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-medium">Automatic Control Logs</span>
                <button
                  onClick={() => onOpenInquiry(`Equipment Inquiry: ${m.name}`)}
                  className="rounded-lg bg-[#2D4F1E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3D5F2F]"
                >
                  Inquire
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTED CAPABILITY CARD */}
      <section className="bg-[#F9F8F3] py-16 border-t border-[#E5E2D9] text-left">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Power Safety & Backup Solutions</h2>
            <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
              Industrial groundnut processing lines suffer major calibration drift if power dips occur mid-cycle. To secure stable and continuous decortication and optics sorting, Kirit Corporation is equipped with a dedicated high-capacity diesel generator backup. This keeps our Buhler CCD sorting grids completely isolated from regional power line surges, guaranteeing uniform grade sorting.
            </p>
          </div>
          <div className="md:col-span-4 bg-white border border-[#E5E2D9] p-4 rounded-2xl shadow-sm text-center">
            <Zap className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <span className="block text-xl font-mono font-black text-[#2D4F1E]">100% Online</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Uninterrupted Generator Backup</span>
          </div>
        </div>
      </section>
    </div>
  );
}
