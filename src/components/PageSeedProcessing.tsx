import React from "react";
import { Sprout, ShieldAlert, BadgePercent, Settings, CheckCircle } from "lucide-react";

interface PageSeedProcessingProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageSeedProcessing({ onOpenInquiry }: PageSeedProcessingProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Biyaran Sowing Science</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Scientific Seed Processing
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            How we grade, check, and coat UV Seeds groundnut varieties to retain absolute embryo vigor, high moisture-tolerance, and pest defense.
          </p>
        </div>
      </section>

      {/* CORE INFO */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-12 items-center text-left">
        <div className="md:col-span-5 relative">
          <img
            src="/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
            alt="Scientific Seed grading"
            referrerPolicy="no-referrer"
            className="rounded-3xl shadow-lg border border-[#E5E2D9] h-80 w-full object-cover"
          />
          <div className="absolute -bottom-6 -left-6 bg-white border border-[#E5E2D9] rounded-2xl p-4 shadow-xl text-left max-w-xs">
            <h4 className="text-xs font-extrabold text-[#2D4F1E]">Laboratory Vigor Checks</h4>
            <p className="text-[10px] text-gray-500 mt-1">We perform active seedling checks on every processed seed lot, confirming healthy root radicals before dispatch.</p>
          </div>
        </div>

        <div className="md:col-span-7 space-y-6">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-wider">Germination Engineering</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight leading-tight">Protecting the Kernel Embryo</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Unlike commercial peanuts which are aggressively shelled, groundnut sowing seeds (biyaran) require extreme, delicate care during shelling. If a kernel undergoes high impact force, the internal fragile embryo snaps or suffers micro-bruising. This prevents the seed from sprouting even under perfect monsoon moisture.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            At UV Seeds, our grading and treatment loops are tailored to prevent embryo injuries:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-gray-200 p-4 rounded-xl space-y-1 bg-[#F9F8F3]">
              <span className="font-bold text-gray-900 block">Low-RPM Shelling Grids</span>
              <span className="text-[#5A5A40] block">Our specialized decorticators rotate at extremely low RPM, using rubberized impact bars that split the shells without bruising the inner kernel.</span>
            </div>
            <div className="border border-gray-200 p-4 rounded-xl space-y-1 bg-[#F9F8F3]">
              <span className="font-bold text-gray-900 block">Safe Agronomist Coatings</span>
              <span className="text-[#5A5A40] block">We treat seeds with a thin protective coat (using organic anti-fungal agents) to stop white grubs and seed rot pathogens.</span>
            </div>
            <div className="border border-gray-200 p-4 rounded-xl space-y-1 bg-[#F9F8F3]">
              <span className="font-bold text-gray-900 block">Moisture Stabilized Sacks</span>
              <span className="text-[#5A5A40] block">Sowing seeds are dried to exactly 7.0% - 7.5% moisture and packed in breathable, heavy-duty gunny bags to stop seed dormancy rot.</span>
            </div>
            <div className="border border-gray-200 p-4 rounded-xl space-y-1 bg-[#F9F8F3]">
              <span className="font-bold text-gray-900 block">Uniform Kernel Sizing</span>
              <span className="text-[#5A5A40] block">By segregating splits, shriveled kernels, and oversized seeds, we provide uniform counts that match automatic mechanical sowers.</span>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL MATRIX */}
      <section className="bg-[#F9F8F3] py-16 border-y border-[#E5E2D9]">
        <div className="max-w-5xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Quality Checklist</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif tracking-tight">UV Seeds Seed-Lot Standards</h2>
            <p className="text-sm text-[#5A5A40] max-w-md mx-auto">Every single seed batch we dispatch complies with these rigorous quality standards.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white border border-[#E5E2D9] p-6 rounded-2xl space-y-2">
              <CheckCircle className="h-6 w-6 text-[#2D4F1E]" />
              <h3 className="font-bold text-gray-900">Purity Indices</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">99.95% physically pure. We guarantee zero sand, zero twigs, and zero external crop seeds are present in our seed sacks.</p>
            </div>
            <div className="bg-white border border-[#E5E2D9] p-6 rounded-2xl space-y-2">
              <CheckCircle className="h-6 w-6 text-[#2D4F1E]" />
              <h3 className="font-bold text-gray-900">Germination Rating</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">Certified minimum 85% germination index. Under ideal soil moisture conditions, sprouting occurs within 4 - 6 days.</p>
            </div>
            <div className="bg-white border border-[#E5E2D9] p-6 rounded-2xl space-y-2">
              <CheckCircle className="h-6 w-6 text-[#2D4F1E]" />
              <h3 className="font-bold text-gray-900">Skin Integrity</h3>
              <p className="text-xs text-[#5A5A40] leading-relaxed">Minimum 98% unbroken seed skins (testa). Preserving the seed coat is critical to block soil fungi from feeding on seed starch.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => onOpenInquiry("UV Seeds Booking Inquiry")}
              className="rounded-xl bg-[#2D4F1E] text-white font-extrabold text-xs px-6 py-3.5 hover:bg-[#3D5F2F] shadow transition-all"
            >
              Inquire Sowing Seed Lots
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
