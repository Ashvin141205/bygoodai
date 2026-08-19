import React from "react";
import { Award, Sprout, CheckSquare, Target, Users, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PageAbout() {
  const team = [
    {
      name: "Kiritbhai Patel",
      role: "Founder & Managing Director",
      desc: "With over 35 years of active presence in Junagadh and Rajkot agricultural markets, Kiritbhai directs the corporate roadmap, focusing on strategic international B2B partnerships and technology upgrades."
    },
    {
      name: "Ramanbhai Patel",
      role: "Lead Agronomist & Partner",
      desc: "Ramanbhai heads our UV Seeds Division. He holds research qualifications in soil health and works directly with Saurashtra's farmers to educate them on moisture-resiliency and germination optimization."
    },
    {
      name: "Jignesh Patel",
      role: "Operations Head & QC Lead",
      desc: "Jignesh oversees our high-speed factory lines in Sondarda. He manages the calibration of our color sorters, sizers, and ensures every bulk shipment matches phytosanitary criteria."
    }
  ];

  const values = [
    {
      title: "Farmers' Prosperity First",
      desc: "We believe Kirit Corporation's success is tied to the prosperity of Saurashtra's agricultural communities. We pay fair market value and offer free agronomical support.",
      icon: <Sprout className="h-6 w-6 text-[#2D4F1E]" />
    },
    {
      title: "Pristine Unmatched Purity",
      desc: "We make no compromises on quality. Using cutting-edge dry pre-cleaners, magnetic separators, and CCD camera optics, we achieve product clean rates exceeding 99.9%.",
      icon: <ShieldCheck className="h-6 w-6 text-[#2D4F1E]" />
    },
    {
      title: "Transparent Sourcing Ethics",
      desc: "We offer complete traceabilities for our clients. Every bulk container can be traced back to its regional Saurashtra agricultural source and its respective processing batch.",
      icon: <Award className="h-6 w-6 text-[#2D4F1E]" />
    },
    {
      title: "Technological Leadership",
      desc: "We continuous invest in industrial modernization. From Z-type low-abrasion bucket elevators to computerized humidity logs, our plant remains state-of-the-art.",
      icon: <CheckSquare className="h-6 w-6 text-[#2D4F1E]" />
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* HEADER HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            About Our Enterprise
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Kirit Corporation
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Leading Gujarat's agricultural processing sector with decades of trust, high-caliber sorting machinery, and specialized seed development under the UV Seeds division.
          </p>
        </div>
      </section>

      {/* DETAILED CONTENT */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6 space-y-5 text-left">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-wider">Our Sourcing Foundation</span>
          <h2 className="text-3xl font-bold text-[#2D2D2A] font-serif tracking-tight leading-tight">
            Nurtured by Keshod's Fertile Soil, Processed with Global Rigor
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            The Saurashtra region of Gujarat, particularly around Keshod and Sondarda, is globally renowned for its highly fertile black loam and sandy soils. This unique soil geology holds perfect water filtration properties, allowing groundnut pods to swell with high oil concentrations and delicious, sweet kernel skins.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Kirit Corporation was established to bridge the gap between local smallholder farmers and premium international B2B food buyers. We purchase newly harvested crops directly from local farming families, checking initial moisture content on-site to ensure safe storage.
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">
            Through our specialized brand division, **UV Seeds**, we select the plumpest, high-vitality seeds to process as premium planting material (Biyaran). This ensures that local agricultural communities continue to reap rich harvests season after season.
          </p>
        </div>
        <div className="md:col-span-6 relative">
          <img
            src="/src/assets/images/hero_processing_plant_1783339503473.jpg"
            alt="Kirit Corporation Office"
            referrerPolicy="no-referrer"
            className="rounded-3xl shadow-lg border border-[#E5E2D9] h-80 w-full object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-[#E5E2D9] max-w-xs text-left">
            <h4 className="text-xs font-extrabold text-[#2D4F1E] uppercase">Sondarda Headquarters</h4>
            <p className="text-[10px] text-gray-500 mt-1">Our main processing factory sits adjacent to the Junagadh-Veraval National Highway, facilitating efficient logistical dispatch.</p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-[#F9F8F3] py-16 border-y border-[#E5E2D9]">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Our Directives</span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Our Core Values</h2>
            <p className="text-sm text-[#5A5A40] max-w-md mx-auto">The guiding principles that steer Kirit Corporation's daily decisions and long-term milestones.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 text-left">
            {values.map((v, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E5E2D9] flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex-shrink-0">
                  {v.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 font-serif">{v.title}</h3>
                  <p className="text-xs text-[#5A5A40] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXECUTIVE TEAM */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#8B4513] uppercase tracking-widest">Leadership</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Meet Our Executives</h2>
          <p className="text-sm text-[#5A5A40] max-w-md mx-auto">A team of dedicated agricultural operators, logistics experts, and agronomists.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white border border-[#E5E2D9] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-[#2D4F1E]/10 flex items-center justify-center text-[#2D4F1E] font-extrabold">
                  {member.name.split(" ")[0][0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-serif">{member.name}</h3>
                  <p className="text-xs font-bold text-[#8B4513] uppercase mt-0.5">{member.role}</p>
                </div>
                <p className="text-xs text-[#5A5A40] leading-relaxed">{member.desc}</p>
              </div>
              <div className="pt-4 border-t border-[#E5E2D9] mt-6 flex items-center gap-2">
                <span className="text-[10px] bg-[#F9F8F3] px-2.5 py-1 border border-[#E5E2D9] rounded font-bold text-[#2D4F1E]">KRT Management</span>
                <span className="text-[10px] text-gray-400">Veraval Road, Sondarda</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US BRIEF */}
      <section className="bg-gradient-to-br from-[#2D4F1E] to-[#1C3213] text-white py-16 rounded-3xl mx-4 max-w-6xl lg:mx-auto px-8 sm:px-12 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#D4AF37]">Looking to procure high-purity peanuts?</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            We provide verified export reports matching strict Aflatoxin caps (under 4 PPB), customized grading profiles, and moisture levels below 7.5% packed in moisture-resistant bags.
          </p>
          <p className="text-xs text-white/80 font-mono">📍 Veraval Road, Opp. Shrinathji Weighbridge, Sondarda, Gujarat 362227, India</p>
        </div>
      </section>
    </div>
  );
}
