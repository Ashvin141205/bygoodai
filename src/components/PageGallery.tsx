import React, { useState } from "react";
import { Filter, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { galleryItems } from "../data";

export default function PageGallery() {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => filter === "all" || item.category === filter
  );

  const categories = [
    { label: "All Photos", id: "all" },
    { label: "Factory Floor", id: "factory" },
    { label: "Machinery", id: "machinery" },
    { label: "Sowing Seeds", id: "seeds" },
    { label: "Packaging", id: "packaging" },
    { label: "Our Team", id: "team" }
  ];

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    const prevIdx = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    setLightboxIndex(prevIdx);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    const nextIdx = (lightboxIndex + 1) % filteredItems.length;
    setLightboxIndex(nextIdx);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* GALLERY HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Visual Evidence</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Factory & Facility Gallery
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Take a visual tour of Kirit Corporation's modern groundnut processing layout, seed packaging lines, testing laboratories, and high-tech equipment.
          </p>
        </div>
      </section>

      {/* GALLERY FILTER BAR */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 border-b border-[#E5E2D9] pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFilter(cat.id);
                setLightboxIndex(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
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

      {/* GALLERY GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-md hover:border-[#D4AF37]/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-52 bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-xl border border-white/20">
                    <Eye className="h-4 w-4" />
                    <span>View Large</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 border border-[#E5E2D9] rounded-lg text-[9px] font-black text-[#2D4F1E] uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              <div className="p-4 text-left">
                <h3 className="font-bold text-gray-900 text-sm leading-snug font-serif">{item.title}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-normal">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none">
          {/* Close trigger */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-white bg-white/10 hover:bg-white/25 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 p-2 text-white bg-white/10 hover:bg-white/25 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image & Caption card */}
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-white/10 shadow-2xl relative">
            <div className="bg-black/95 flex items-center justify-center min-h-[300px] max-h-[65vh]">
              <img
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>
            
            <div className="p-5 text-left bg-[#F9F8F3] border-t border-[#E5E2D9] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold bg-[#2D4F1E] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {filteredItems[lightboxIndex].category}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  Image {lightboxIndex + 1} of {filteredItems.length}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 font-serif">
                {filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs text-gray-600 leading-normal">
                {filteredItems[lightboxIndex].description}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 text-white bg-white/10 hover:bg-white/25 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
