import React, { useState } from "react";
import { Filter, ShoppingBag, ArrowRight, ShieldCheck, FileCheck, ClipboardList } from "lucide-react";
import { products } from "../data";

interface PageProductsProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageProducts({ onOpenInquiry }: PageProductsProps) {
  const [filter, setFilter] = useState("all");

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "seeds") return p.id.startsWith("seeds-");
    if (filter === "kernels") return p.id === "bold-kernels" || p.id === "java-kernels";
    if (filter === "splits") return p.id === "peanut-splits";
    if (filter === "inshell") return p.id === "raw-mungfali";
    return true;
  });

  const categories = [
    { label: "All Products", id: "all" },
    { label: "UV Sowing Seeds", id: "seeds" },
    { label: "Export Kernels", id: "kernels" },
    { label: "Peanut Splits", id: "splits" },
    { label: "In-Shell Pods", id: "inshell" }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* PRODUCTS HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Our Catalog</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Premium Graded Groundnut Products
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Sourced directly from Keshod and nearby Saurashtra fields, graded to strict counts-per-ounce, and moisture-controlled to meet export and domestic standards.
          </p>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 border-b border-[#E5E2D9] pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                filter === cat.id
                  ? "bg-[#2D4F1E] text-white shadow"
                  : "bg-[#F9F8F3] border border-[#E5E2D9] text-gray-600 hover:border-gray-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 text-left">
          {filteredProducts.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product image frame */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E5E2D9] text-[#2D4F1E] text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-sm">
                    {p.varietyCode}
                  </div>
                  {p.id.startsWith("seeds-") && (
                    <div className="absolute top-4 right-4 bg-[#D4AF37] text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      ★ UV Seeds certified
                    </div>
                  )}
                </div>

                {/* Info body */}
                <div className="p-6 space-y-4">
                  <div>
                    {p.gujaratiName && (
                      <p className="text-xs font-bold text-[#8B4513] font-sans">{p.gujaratiName}</p>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 font-serif leading-tight mt-1">{p.name}</h3>
                  </div>

                  <p className="text-xs text-[#5A5A40] leading-relaxed">{p.description}</p>

                  {/* Specifications Table */}
                  <div className="p-4 bg-[#F9F8F3] rounded-2xl border border-[#E5E2D9] space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                      <FileCheck className="h-3.5 w-3.5 text-[#2D4F1E]" />
                      <span>Technical Specifications</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
                      {Object.entries(p.specifications).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-gray-200/50 pb-1 last:border-b-0 last:pb-0">
                          <span className="text-gray-500 truncate mr-2">{key}:</span>
                          <span className="font-bold text-gray-800 text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Packaging options */}
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-black text-[#8B4513] uppercase tracking-wider">Packaging Variations:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {p.packagingOptions.map((opt, idx) => (
                        <span 
                          key={idx}
                          className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] text-gray-600 font-medium"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex gap-3 items-center">
                <button
                  onClick={() => onOpenInquiry(p.name)}
                  className="w-full text-center rounded-xl bg-[#2D4F1E] text-white py-2.5 text-xs font-bold hover:bg-[#3D5F2F] transition-colors cursor-pointer"
                >
                  Book Bulk Inquiry
                </button>
                <div className="text-[10px] text-right font-medium text-gray-400 leading-tight">
                  <p>Grade Checked</p>
                  <p className="font-bold text-[#2D4F1E]">KRT Class A</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLIANCE INFORMATION */}
      <section className="bg-[#F9F8F3] py-16 border-t border-[#E5E2D9] text-left">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 font-serif">Export Standards</h3>
            <p className="text-xs text-[#5A5A40] leading-relaxed">All bold and java cargo can be configured to meet rigid phytosanitary rules in destinations like Europe and East Asia. We monitor and keep average aflatoxin caps under 4 PPB.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 font-serif">Phytosanitary Certification</h3>
            <p className="text-xs text-[#5A5A40] leading-relaxed">Our shipments are certified with official crop health and sanitation analysis reports. We work closely with international inspectors like SGS and Geo-Chem to issue clean certificates.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 font-serif">Farming Direct Trade</h3>
            <p className="text-xs text-[#5A5A40] leading-relaxed">By buying direct from Keshod and Sondarda APMC networks, we cut middleman inflation, allowing us to pass direct competitive prices to national wholesalers and buyers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
