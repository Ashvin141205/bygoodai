import React from "react";
import { Truck, Wind, Grid, Cpu, CheckSquare, Eye, FileCheck, Sprout, ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";
import { workflowSteps } from "../data";

interface PagePlantWorkflowProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PagePlantWorkflow({ onOpenInquiry }: PagePlantWorkflowProps) {
  const getStepIcon = (num: number) => {
    switch (num) {
      case 1: return <Truck className="h-6 w-6" />;
      case 2: return <Wind className="h-6 w-6" />;
      case 3: return <Grid className="h-6 w-6" />;
      case 4: return <Cpu className="h-6 w-6" />;
      case 5: return <CheckSquare className="h-6 w-6" />;
      case 6: return <Eye className="h-6 w-6" />;
      case 7: return <FileCheck className="h-6 w-6" />;
      case 8: return <Sprout className="h-6 w-6" />;
      case 9: return <ShieldCheck className="h-6 w-6" />;
      case 10: return <ExternalLink className="h-6 w-6" />;
      default: return <Cpu className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* WORKFLOW HERO */}
      <section className="bg-gradient-to-r from-[#1C3213] to-[#2D4F1E] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Operational Blueprint</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            The 10-Stage Processing Workflow
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Follow our clean visual flowchart mapping the rigorous quality checks raw Saurashtra groundnuts undergo to be transformed into certified UV Seeds or export bold kernels.
          </p>
        </div>
      </section>

      {/* WORKFLOW CHART */}
      <section className="max-w-4xl mx-auto px-4 relative">
        {/* Continuous central path line on desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2D4F1E] via-[#D4AF37] to-[#8B4513] -translate-x-1/2 z-0 opacity-20" />

        <div className="space-y-12 relative z-10">
          {workflowSteps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={step.stepNumber}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Visual Card */}
                <div className="w-full md:w-1/2">
                  <div className="bg-white border border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-left space-y-4 relative">
                    {/* Visual numbers overlay */}
                    <span className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100 font-mono select-none">
                      #{step.stepNumber}
                    </span>

                    <div className="h-12 w-12 rounded-2xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
                      {getStepIcon(step.stepNumber)}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 font-serif leading-tight">{step.title}</h3>
                      <p className="text-[10px] text-[#8B4513] font-mono uppercase tracking-wider mt-1 font-semibold">Operational Phase {step.stepNumber}</p>
                    </div>

                    <p className="text-xs text-[#5A5A40] leading-relaxed">{step.description}</p>
                    
                    <div className="p-4 bg-[#F9F8F3] border border-dashed border-[#E5E2D9] rounded-xl text-xs">
                      <p className="font-bold text-[#2D4F1E] uppercase text-[10px] tracking-wider mb-1">Standard Operating Protocol (SOP)</p>
                      <p className="text-gray-600 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                </div>

                {/* Central connecting node */}
                <div className="hidden md:flex h-12 w-12 rounded-full bg-white border-4 border-[#2D4F1E] items-center justify-center text-sm font-bold font-mono text-[#2D4F1E] shadow-md z-10 flex-shrink-0">
                  {step.stepNumber}
                </div>

                {/* Empty buffer box for grid balance */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#F9F8F3] py-16 border-t border-[#E5E2D9] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Audit Our Plant Facilities</h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed max-w-2xl mx-auto">
            We operate an open-door policy for commercial wholesalers, seed dealers, and agricultural exporter partners. Coordinate with our office to visit our Sondarda facility in Keshod, inspect our modern pre-cleaners, optical sorting lines, and review our laboratory quality logs.
          </p>
          <button
            onClick={() => onOpenInquiry("Plant Visit Booking")}
            className="rounded-xl bg-[#2D4F1E] text-white font-extrabold text-xs px-6 py-3.5 hover:bg-[#3D5F2F] shadow transition-all"
          >
            Schedule a Facility Visit
          </button>
        </div>
      </section>
    </div>
  );
}
