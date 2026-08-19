import React from "react";
import { ShieldCheck, Award, FileCheck, CheckCircle, HelpCircle } from "lucide-react";

interface PageQualityProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageQuality({ onOpenInquiry }: PageQualityProps) {
  const protocols = [
    {
      title: "Oven-Drying Moisture Analysis",
      desc: "Every bulk delivery is checked using high-speed dielectric grain moisture meters and calibrated dry ovens. We maintain packing moisture strictly below 7.5% to shut down mold dormancy."
    },
    {
      title: "Rapid ELISA Aflatoxin Screen",
      desc: "We perform fast Enzyme-Linked Immunosorbent Assay (ELISA) testing at our on-site laboratory. This monitors and screens out Aspergillus flavus fungi, ensuring clean commercial export grades under 4 PPB."
    },
    {
      title: "Seedling Vigor Germination Testing",
      desc: "Before any seed lot is certified as 'UV Seeds' premium biyaran, we perform nursery germination tests, verifying root and hypocotyl growth across 10-day monitoring cycles."
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* QUALITY HERO */}
      <section className="bg-gradient-to-r from-[#1C3213] to-[#2D4F1E] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Zero Compromise</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Quality Assurance & Food Safety
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Our strict laboratory controls guarantee aflatoxin defense, stable moisture profiles, and certified seed germination success.
          </p>
        </div>
      </section>

      {/* DETAILED CONTENT */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-wider">Lab Standards</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight leading-tight">Our Multi-Layered Quality Control System</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            For groundnuts, quality assurance is not just an aesthetic metric—it is a critical aspect of food safety. Groundnuts are highly sensitive to moisture absorption, which can trigger the growth of toxic micro-molds like aflatoxins.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            To prevent this, Kirit Corporation has built a multi-layered quality control program that oversees every stage from farm gate to packed cargo container. We utilize electronic testing equipment to check humidity, analyze seed skins, and verify germination vigor.
          </p>

          <div className="space-y-4">
            {protocols.map((p, idx) => (
              <div key={idx} className="p-4 bg-white border border-[#E5E2D9] rounded-2xl shadow-sm flex gap-3 items-start">
                <CheckCircle className="h-5 w-5 text-[#2D4F1E] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{p.title}</h4>
                  <p className="text-xs text-[#5A5A40] mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F9F8F3] border border-[#E5E2D9] rounded-3xl p-6 sm:p-8 space-y-6">
          <ShieldCheck className="h-10 w-10 text-[#D4AF37] mb-2" />
          <h3 className="text-xl font-bold text-gray-900 font-serif">Aflatoxin Control Standard</h3>
          <p className="text-xs text-[#5A5A40] leading-relaxed">
            Aspergillus mold develops if raw groundnuts are exposed to warm, humid, and rain-soaked conditions during transit or storage. Our plant employs specialized procedures to suppress aflatoxins:
          </p>

          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">B2B Domestic Standard:</span>
              <span className="font-bold">Under 10 Parts Per Billion (PPB)</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">EU Export Standard:</span>
              <span className="font-bold text-[#2D4F1E]">Under 4 Parts Per Billion (PPB)</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-medium">Average UV Seed Moisture:</span>
              <span className="font-bold text-[#8B4513]">7.0% - 7.5% maximum</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-dashed border-[#E5E2D9] bg-white text-xs leading-relaxed text-[#5A5A40]">
            <span className="font-bold block text-gray-900 mb-1">📋 Certificate of Analysis</span>
            We furnish comprehensive, lot-specific chemical analysis sheets with every wholesale shipment, detailing exact moisture counts and optical sorting purity logs.
          </div>

          <button
            onClick={() => onOpenInquiry("Quality Analysis Consult")}
            className="w-full text-center rounded-xl bg-[#2D4F1E] text-white py-3 text-xs font-bold hover:bg-[#3D5F2F] shadow transition-colors"
          >
            Inquire About Quality Certifications
          </button>
        </div>
      </section>
    </div>
  );
}
