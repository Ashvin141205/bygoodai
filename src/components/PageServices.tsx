import React from "react";
import { Filter, Cpu, CheckSquare, Eye, Sprout, ShieldCheck, FolderSync, FileCheck, Warehouse, ArrowRight } from "lucide-react";
import { services } from "../data";

interface PageServicesProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageServices({ onOpenInquiry }: PageServicesProps) {
  return (
    <div className="space-y-16 pb-20">
      {/* SERVICES HERO */}
      <section className="bg-gradient-to-r from-[#1C3213] to-[#2D4F1E] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Our Capabilities</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Industrial Groundnut Processing & Services
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            From physical farm pod inward pre-cleaning to computer-vision optical sorters and vacuum-sealed container loading, we enforce perfect quality controls.
          </p>
        </div>
      </section>

      {/* SERVICES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {services.map((service) => {
            const getIcon = () => {
              switch (service.icon) {
                case "Filter": return <Filter className="h-6 w-6 text-[#2D4F1E]" />;
                case "Cpu": return <Cpu className="h-6 w-6 text-[#2D4F1E]" />;
                case "CheckSquare": return <CheckSquare className="h-6 w-6 text-[#2D4F1E]" />;
                case "Eye": return <Eye className="h-6 w-6 text-[#2D4F1E]" />;
                case "Sprout": return <Sprout className="h-6 w-6 text-[#2D4F1E]" />;
                case "ShieldCheck": return <ShieldCheck className="h-6 w-6 text-[#2D4F1E]" />;
                case "FolderSync": return <FolderSync className="h-6 w-6 text-[#2D4F1E]" />;
                case "FileCheck": return <FileCheck className="h-6 w-6 text-[#2D4F1E]" />;
                case "Warehouse": return <Warehouse className="h-6 w-6 text-[#2D4F1E]" />;
                default: return <Filter className="h-6 w-6 text-[#2D4F1E]" />;
              }
            };

            return (
              <div 
                key={service.id}
                className="bg-white rounded-3xl border border-[#E5E2D9] p-6 shadow-sm hover:shadow-lg hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon circle */}
                  <div className="h-12 w-12 rounded-2xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center">
                    {getIcon()}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-serif leading-tight">{service.title}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1 uppercase tracking-wider">KRT-SVC: {service.id}</p>
                  </div>
                  
                  <p className="text-xs text-[#5A5A40] leading-relaxed">{service.description}</p>
                  
                  {/* Service details listing */}
                  <div className="pt-3 border-t border-[#E5E2D9] space-y-2">
                    <h4 className="text-[10px] font-extrabold text-[#8B4513] uppercase tracking-wider">Operational Highlights:</h4>
                    <ul className="space-y-1.5">
                      {service.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-xs text-[#5A5A40] flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Sondarda, Gujarat Plant</span>
                  <button
                    onClick={() => onOpenInquiry(`Service: ${service.title}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2D4F1E] hover:text-[#3D5F2F]"
                  >
                    <span>Inquire Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* JOBS SECTION FOOTER */}
      <section className="bg-[#F9F8F3] py-16 border-t border-[#E5E2D9] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Custom Grading & Toll Shelling Arrangements</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed max-w-2xl mx-auto">
            Do you have bulk agricultural arrivals from nearby Saurashtra APMCs? We offer customized toll cleaning and contract color sorting job work for domestic traders, wholesale exporters, and oil mill expellers. We provide transparent weight conversions, moisture drying beds, and secure stacking.
          </p>
          <button
            onClick={() => onOpenInquiry("Custom Toll Shelling Quote")}
            className="rounded-xl bg-[#2D4F1E] text-white font-extrabold text-xs px-6 py-3.5 hover:bg-[#3D5F2F] shadow transition-all"
          >
            Inquire About Toll Sizing / Job Work
          </button>
        </div>
      </section>
    </div>
  );
}
