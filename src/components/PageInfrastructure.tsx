import React from "react";
import { Warehouse, Building, Award, CheckSquare, Layers } from "lucide-react";
import { infrastructure } from "../data";

export default function PageInfrastructure() {
  return (
    <div className="space-y-16 pb-20">
      {/* INFRASTRUCTURE HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Industrial Footprint</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Our Infrastructure & Facilities
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Based in Keshod (Sondarda), Gujarat, our automated agricultural plant stands ready to service large-volume domestic seed bookings and B2B groundnut trade logistics.
          </p>
        </div>
      </section>

      {/* CORE FACILITY METRICS */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-wider">Industrial Excellence</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight leading-tight">A Modern, Clean, High-Output Plant</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Kirit Corporation has committed substantial capital reserves to establish a modern, sanitarily secure facility. Our infrastructure is engineered to eliminate dusty conditions, maintain absolute moisture control, and provide seamless access for cargo trailers.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Our facilities cover a massive, concrete-paved campus situated directly alongside the Junagadh-Veraval Highway. This prime highway location minimizes regional transportation transit times, keeping local crop collection and container dispatch fully synchronized.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="border border-gray-200 p-3.5 rounded-xl bg-[#F9F8F3]">
              <span className="text-gray-500 block">Covered Footprint:</span>
              <span className="text-gray-900 font-black text-sm">45,000+ Sq. Ft.</span>
            </div>
            <div className="border border-gray-200 p-3.5 rounded-xl bg-[#F9F8F3]">
              <span className="text-gray-500 block">Silo Storage Cap:</span>
              <span className="text-gray-900 font-black text-sm">5,000+ Metric Tons</span>
            </div>
          </div>
        </div>

        <div>
          <img
            src="/src/assets/images/hero_processing_plant_1783339503473.jpg"
            alt="Kirit Corporation Factory Shed"
            referrerPolicy="no-referrer"
            className="rounded-3xl shadow-lg border border-[#E5E2D9] h-80 w-full object-cover"
          />
        </div>
      </section>

      {/* INFRASTRUCTURE DIVISIONS LIST */}
      <section className="bg-[#F9F8F3] py-16 border-y border-[#E5E2D9]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Plant Layout</span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Our Core Divisions</h2>
            <p className="text-sm text-[#5A5A40] max-w-md mx-auto">Take a tour of Kirit Corporation's primary operational facility zones.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {infrastructure.map((inf) => (
              <div 
                key={inf.id}
                className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
                    {inf.id === "shed" && <Building className="h-5 w-5" />}
                    {inf.id === "warehouse" && <Warehouse className="h-5 w-5" />}
                    {inf.id === "lab" && <CheckSquare className="h-5 w-5" />}
                    {inf.id === "docks" && <Layers className="h-5 w-5" />}
                    {!["shed", "warehouse", "lab", "docks"].includes(inf.id) && <Building className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-serif text-base leading-tight">{inf.name}</h3>
                    <p className="text-[9px] text-[#8B4513] font-mono mt-0.5 uppercase tracking-wider font-semibold">Division: {inf.id}</p>
                  </div>
                  <p className="text-xs text-[#5A5A40] leading-relaxed">{inf.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-4 text-[10.5px] text-[#5A5A40] space-y-1">
                  <span className="font-bold text-gray-800 block">Key Features:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#5A5A40]">
                    {inf.features.map((feature, fIdx) => (
                      <li key={fIdx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
