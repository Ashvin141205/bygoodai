import React, { useState } from "react";
import { Award, Sprout, TrendingUp, CheckSquare, Eye, Filter, Cpu, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { products, services, workflowSteps } from "../data";

interface PageHomeProps {
  onNavigate: (page: string) => void;
  onOpenInquiry: (productName: string) => void;
}

export default function PageHome({ onNavigate, onOpenInquiry }: PageHomeProps) {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  // Take first 3 products for preview
  const featuredProducts = products.slice(0, 3);
  // Take first 4 services for preview
  const featuredServices = services.slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative bg-gradient-to-br from-white via-[#FDFDFB] to-[#F5F2E9] overflow-hidden pt-12 pb-20 sm:pb-28 border-b border-[#E5E2D9]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#2D4F1E]/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero text content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E2D9] px-3.5 py-1.5 text-xs text-[#2D4F1E] font-bold shadow-sm"
            >
              <Award className="h-4 w-4 text-[#D4AF37]" />
              <span>Saurashtra's Industrial Standard in Groundnuts</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2D2D2A] font-serif tracking-tight leading-tight"
            >
              Kirit Corporation <br />
              <span className="text-[#2D4F1E] font-sans font-medium text-3xl sm:text-4xl lg:text-5xl block mt-2 text-gradient bg-clip-text">
                Pioneering Groundnut Processing & Sowing Seeds
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#5A5A40] leading-relaxed max-w-xl font-sans"
            >
              We are Gujarat's trusted partner in Groundnut Cleaning, Processing, Grading, and customized agricultural supply. Delivering raw bold kernels, java kernels, and premium sowing solutions through <span className="text-[#2D4F1E] font-semibold">UV Seeds</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={() => onNavigate("products")}
                className="rounded-2xl bg-[#2D4F1E] px-7 py-4 text-sm font-extrabold text-white shadow-lg hover:bg-[#3D5F2F] hover:translate-y-[-2px] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Our Products</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate("quote")}
                className="rounded-2xl border-2 border-[#2D4F1E] bg-white px-7 py-4 text-sm font-extrabold text-[#2D4F1E] hover:bg-[#F9F8F3] hover:translate-y-[-2px] transition-all cursor-pointer"
              >
                Request B2B Quote
              </button>
            </motion.div>

            {/* Quick stats ribbon */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 border-t border-[#E5E2D9] pt-8 mt-6"
            >
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-[#2D4F1E] font-mono tracking-tight">85% - 92%</span>
                <span className="text-[11px] text-[#5A5A40] font-bold uppercase tracking-wider">Germination Success</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-[#2D4F1E] font-mono tracking-tight">100%</span>
                <span className="text-[11px] text-[#5A5A40] font-bold uppercase tracking-wider">Stone Extraction</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-[#2D4F1E] font-mono tracking-tight">EU Standards</span>
                <span className="text-[11px] text-[#5A5A40] font-bold uppercase tracking-wider">Aflatoxin Checked</span>
              </div>
            </motion.div>
          </div>

          {/* Hero image frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute -top-6 -left-6 -z-10 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-2xl" />
            <div className="rounded-3xl border border-[#E5E2D9] bg-white p-3 shadow-2xl overflow-hidden group">
              <img
                src="/src/assets/images/hero_processing_plant_1783339503473.jpg"
                alt="Kirit Corporation Processing Unit"
                referrerPolicy="no-referrer"
                className="rounded-2xl h-[320px] sm:h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Floating feature badge */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-[#E5E2D9] rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-xs">
              <div className="h-10 w-10 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E] flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-[#2D4F1E]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#2D2D2A] leading-tight">State-Of-The-Art Plant</p>
                <p className="text-[10px] text-[#5A5A40]">Laser-guided color sorting & gravity separation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. COMPANY INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <img
              src="/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
              alt="Farmers choice Groundnut Seeds"
              referrerPolicy="no-referrer"
              className="rounded-3xl h-[300px] w-full object-cover shadow-lg border border-[#E5E2D9]"
            />
            <div className="bg-[#2D4F1E]/5 rounded-2xl p-4 border border-[#2D4F1E]/10 flex items-start gap-3">
              <Sprout className="h-5 w-5 text-[#2D4F1E] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#2D4F1E] uppercase tracking-wider">Premium Seed Division</h4>
                <p className="text-xs text-[#5A5A40] mt-1">Branded as UV Seeds, our certified biyaran has supported Saurashtra's farmers for generations.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="text-xs font-extrabold text-[#8B4513] uppercase tracking-widest">Our Legacy</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
              One of Gujarat's Most Trusted Names in Groundnuts
            </h2>
            <p className="text-sm sm:text-base text-[#5A5A40] leading-relaxed">
              Based in Sondarda, Keshod, **Kirit Corporation** represents elite industrial capability combined with deep agricultural roots. Our processing facilities are situated in the heart of Saurashtra's groundnut cultivation belt, where the fertile black and sandy loam soils yield highly premium, naturally oil-rich groundnuts.
            </p>
            <p className="text-sm text-[#5A5A40] leading-relaxed">
              We operate high-throughput modern shelling lines, physical dry pre-cleaners, heavy-duty density separators, and state-of-the-art optical CCD sorting vision. This enables us to cleanly extract dust, clods, stones, and micro-defects, offering wholesalers, peanut butter factories, oil mills, and exporters unprecedented product purity.
            </p>
            <button
              onClick={() => onNavigate("about")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D4F1E] hover:text-[#3D5F2F] group"
            >
              <span>Read Our Full Story</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED UV SEEDS SECTION (HIGHLIGHT DIVISION) */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 sm:py-20 rounded-3xl mx-4 max-w-7xl lg:mx-auto px-6 sm:px-12 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 opacity-10">
          <Sprout className="h-96 w-96 text-white" />
        </div>
        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-5 text-left">
            <span className="bg-[#D4AF37] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Specialized Brand Division
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight">
              UV Seeds: Groundnut Sowing (Biyaran) Specialists
            </h2>
            <p className="text-sm text-[#E5E2D9] max-w-2xl leading-relaxed">
              To support Saurashtra's agricultural backbones, Kirit Corporation operates its specialized seed branch: **UV Seeds**. Our seeds are grown in dedicated monitored farmlands, triple-screened for exact sizing, climate-dried to preserve embryo vigor, and treated to secure a phenomenal germination output.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="border border-white/10 bg-white/5 rounded-xl p-3">
                <span className="block text-lg font-black text-[#D4AF37]">GG-20 Biyaran</span>
                <span className="text-[11px] text-gray-300">Saurashtra's highest yielding spreading variety.</span>
              </div>
              <div className="border border-white/10 bg-white/5 rounded-xl p-3">
                <span className="block text-lg font-black text-[#D4AF37]">GG-2 Early</span>
                <span className="text-[11px] text-gray-300">Bunch-type early maturity variety for short monsoon.</span>
              </div>
              <div className="border border-white/10 bg-white/5 rounded-xl p-3">
                <span className="block text-lg font-black text-[#D4AF37]">G-22 Elite</span>
                <span className="text-[11px] text-gray-300">Bold-profile variety with high disease resistance.</span>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button
                onClick={() => onNavigate("uv-seeds")}
                className="rounded-xl bg-[#D4AF37] text-[#1C3213] font-extrabold text-xs px-5 py-3 shadow hover:bg-white hover:scale-[1.02] transition-all cursor-pointer"
              >
                Estimate Seed Quantity (Calculator)
              </button>
              <button
                onClick={() => onOpenInquiry("UV Seeds General Booking")}
                className="rounded-xl bg-white/10 border border-white/30 text-white font-extrabold text-xs px-5 py-3 hover:bg-white/25 transition-all cursor-pointer"
              >
                Inquire Seed Booking
              </button>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-white/20 max-w-xs rotate-2 hover:rotate-0 transition-all duration-300">
              <img
                src="/src/assets/images/groundnut_seeds_biyaran_1783339518741.jpg"
                alt="UV Seeds Sacks"
                referrerPolicy="no-referrer"
                className="rounded-xl h-64 object-cover w-full"
              />
              <p className="text-black text-center font-bold text-xs mt-3">🌾 UV SEEDS Premium Sowing Pack</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 text-center space-y-12">
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Our Operations</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
            Comprehensive Groundnut Processing & Services
          </h2>
          <p className="text-sm text-[#5A5A40] max-w-xl mx-auto">
            From physical dust aspiration to state-of-the-art computer vision color sorting, we maintain high professional standards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <div 
              key={service.id}
              className="rounded-2xl border border-[#E5E2D9] bg-white p-6 text-left hover:shadow-lg hover:border-[#D4AF37]/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E] group-hover:bg-[#2D4F1E] group-hover:text-white transition-all">
                  {service.id === "cleaning" && <Filter className="h-5 w-5" />}
                  {service.id === "processing" && <Cpu className="h-5 w-5" />}
                  {service.id === "grading" && <CheckSquare className="h-5 w-5" />}
                  {service.id === "color-sorting" && <Eye className="h-5 w-5" />}
                </div>
                <h3 className="font-bold text-lg text-[#2D2D2A] font-serif">{service.title}</h3>
                <p className="text-xs text-[#5A5A40] leading-relaxed">{service.description}</p>
              </div>
              <button
                onClick={() => onNavigate("services")}
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-[#2D4F1E] hover:text-[#3D5F2F]"
              >
                <span>Learn Details</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={() => onNavigate("services")}
            className="rounded-xl border border-[#E5E2D9] bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#F9F8F3] hover:border-gray-400 transition-all cursor-pointer"
          >
            View All 10 Services
          </button>
        </div>
      </section>

      {/* 5. INTERACTIVE PROCESSING WORKFLOW SELECTOR */}
      <section className="bg-white py-16 border-y border-[#E5E2D9]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-widest">How We Clean</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
              The 10-Stage Processing Journey
            </h2>
            <p className="text-sm text-[#5A5A40] max-w-xl mx-auto">
              Follow our physical raw-pod to export-grade kernel flowchart to see the rigor of Kirit Corporation's standard of care.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Steps Left Selector */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">Select Processing Phase</div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {workflowSteps.slice(0, 6).map((step) => (
                  <button
                    key={step.stepNumber}
                    onClick={() => setActiveWorkflowStep(step.stepNumber)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      activeWorkflowStep === step.stepNumber
                        ? "bg-[#2D4F1E] border-[#2D4F1E] text-white shadow-md font-bold"
                        : "bg-[#F9F8F3] border-[#E5E2D9] text-gray-700 hover:bg-[#E5E2D9]/30"
                    }`}
                  >
                    <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-mono">{step.stepNumber}</span>
                    <span className="text-xs truncate">{step.title}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => onNavigate("plant-workflow")}
                className="w-full text-center py-2.5 rounded-xl border border-dashed border-[#2D4F1E]/40 text-[#2D4F1E] text-xs font-bold hover:bg-[#2D4F1E]/5 transition-all mt-4 block"
              >
                Expand All 10 Workflow Steps
              </button>
            </div>

            {/* Selected Step Expanded Details */}
            <div className="lg:col-span-8">
              {workflowSteps.map((step) => {
                if (step.stepNumber !== activeWorkflowStep) return null;
                return (
                  <motion.div
                    key={step.stepNumber}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-[#E5E2D9] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold bg-[#D4AF37]/15 text-[#8B4513] px-3 py-1 rounded-full border border-[#D4AF37]/30 uppercase tracking-wider">
                        Step {step.stepNumber} of 10
                      </span>
                      <span className="text-sm font-mono text-[#5A5A40] font-bold">KRT Workflow Chain</span>
                    </div>

                    <h3 className="text-2xl font-bold text-[#2D2D2A] font-serif leading-tight">{step.title}</h3>
                    
                    <p className="text-sm text-[#5A5A40] leading-relaxed">{step.description}</p>
                    
                    <div className="p-4 bg-[#F9F8F3] rounded-xl border border-[#E5E2D9]">
                      <h4 className="text-xs font-bold text-[#2D4F1E] uppercase tracking-wider mb-1">Detailed Technical Control</h4>
                      <p className="text-xs text-[#5A5A40] leading-relaxed">{step.details}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#E5E2D9]">
                      <span className="text-xs text-[#5A5A40]">Need clean sorting matching your specifications?</span>
                      <button
                        onClick={() => onOpenInquiry(`Processing Inquiry: ${step.title}`)}
                        className="rounded-lg bg-[#2D4F1E] px-4 py-2 text-xs font-bold text-white hover:bg-[#3D5F2F]"
                      >
                        Inquire About This
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 text-center space-y-12">
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Our Catalog</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
            Featured Graded Products & Varieties
          </h2>
          <p className="text-sm text-[#5A5A40] max-w-xl mx-auto">
            High-purity bold and java kernels alongside highly certified farmer seeds. Direct Saurashtra sourcing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className="rounded-3xl border border-[#E5E2D9] bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E5E2D9] text-[#2D4F1E] text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {product.varietyCode}
                  </div>
                </div>

                <div className="p-6 text-left space-y-3">
                  {product.gujaratiName && (
                    <p className="text-xs font-bold text-[#8B4513] font-sans">{product.gujaratiName}</p>
                  )}
                  <h3 className="font-bold text-lg text-gray-900 font-serif line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-[#5A5A40] leading-relaxed line-clamp-2">{product.description}</p>
                  
                  {/* Sizing / Specifications brief list */}
                  <div className="pt-2 border-t border-[#E5E2D9] grid grid-cols-2 gap-2 text-[11px] text-[#5A5A40]">
                    {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-bold block text-gray-800">{key}:</span>
                        <span className="truncate block">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-2">
                <button
                  onClick={() => onOpenInquiry(product.name)}
                  className="w-full text-center rounded-xl bg-[#2D4F1E] py-2 text-xs font-bold text-white hover:bg-[#3D5F2F] transition-colors cursor-pointer"
                >
                  Book Inquiry
                </button>
                <button
                  onClick={() => onNavigate("products")}
                  className="rounded-xl border border-[#E5E2D9] px-3.5 py-2 text-xs font-bold text-[#5A5A40] hover:bg-[#F9F8F3] transition-colors"
                >
                  Specs
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={() => onNavigate("products")}
            className="rounded-xl border-2 border-[#2D4F1E] bg-white px-6 py-3 text-xs font-extrabold text-[#2D4F1E] hover:bg-[#F9F8F3] transition-all cursor-pointer"
          >
            Browse Full Catalog
          </button>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-gradient-to-b from-white to-[#F9F8F3] py-16 border-t border-[#E5E2D9]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Endorsements</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
              What Farmers & Partners Say About Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white border border-[#E5E2D9] p-6 rounded-3xl space-y-4 shadow-sm relative">
              <p className="text-xs text-[#5A5A40] leading-relaxed italic">
                "We planted UV Seeds' GG-20 last monsoon in Keshod. The seed sizing was incredibly uniform which allowed our automatic seed-drill to run smoothly without blockages. We measured an amazing 89% germination rate and heavy crop yields. Highly trusted Biyaran!"
              </p>
              <div className="pt-3 border-t border-[#E5E2D9] flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-xs font-bold text-[#2D4F1E]">RP</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Rameshbhai Patel</h4>
                  <p className="text-[10px] text-gray-500">Progressive Farmer, Sondarda Village</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E2D9] p-6 rounded-3xl space-y-4 shadow-sm relative">
              <p className="text-xs text-[#5A5A40] leading-relaxed italic">
                "As exporters feeding peanuts into Europe, aflatoxin is our major hurdle. Partnering with Kirit Corporation has resolved this. Their high-resolution color sorting technology and moisture analyzer hoppers screen out defects immediately. Outstanding job work quality."
              </p>
              <div className="pt-3 border-t border-[#E5E2D9] flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-xs font-bold text-[#2D4F1E]">JD</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Jayeshbhai Dobariya</h4>
                  <p className="text-[10px] text-gray-500">Managing Director, Saurashtra Agro Exports</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E5E2D9] p-6 rounded-3xl space-y-4 shadow-sm relative">
              <p className="text-xs text-[#5A5A40] leading-relaxed italic">
                "The transparency and honesty in weight reporting at Kirit Corporation's weighing-bridge is excellent. We bring raw pods directly from the farms for decortication job-work and receive perfect kernel returns without any discrepancies. Professional B2B partner."
              </p>
              <div className="pt-3 border-t border-[#E5E2D9] flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-xs font-bold text-[#2D4F1E]">KS</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Ketan Shah</h4>
                  <p className="text-[10px] text-gray-500">Wholesale Trader, Rajkot APMC Market</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONTACT CALL-TO-ACTION (CTA) */}
      <section className="mx-4 max-w-7xl lg:mx-auto rounded-3xl bg-[#F9F8F3] border border-[#E5E2D9] p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-[#2D2D2A] font-serif tracking-tight">
          Ready to Work with Saurashtra's Groundnut Specialists?
        </h2>
        <p className="text-sm text-[#5A5A40] max-w-xl mx-auto leading-relaxed">
          Whether you are a local farmer seeking premium UV Seeds or a national distributor looking for high-purity bold peanut containers, Kirit Corporation is at your service.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onNavigate("contact")}
            className="rounded-xl bg-[#2D4F1E] px-6 py-3 text-xs font-extrabold text-white shadow hover:bg-[#3D5F2F] transition-all cursor-pointer"
          >
            Visit Our Factory
          </button>
          <button
            onClick={() => onNavigate("quote")}
            className="rounded-xl border border-[#E5E2D9] bg-white px-6 py-3 text-xs font-extrabold text-gray-700 hover:bg-[#F9F8F3] transition-all cursor-pointer"
          >
            Request Sizing Quote
          </button>
        </div>
      </section>
    </div>
  );
}
