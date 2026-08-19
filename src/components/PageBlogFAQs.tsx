import React, { useState } from "react";
import { BookOpen, HelpCircle, ChevronDown, ChevronUp, Clock, User, X, MessageCircle } from "lucide-react";
import { blogs, faqs } from "../data";

interface PageBlogFAQsProps {
  onOpenInquiry: (productName: string) => void;
}

export default function PageBlogFAQs({ onOpenInquiry }: PageBlogFAQsProps) {
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState("all");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const selectedBlog = blogs.find((b) => b.id === activeBlogId);

  const filteredFaqs = faqs.filter(
    (f) => faqCategory === "all" || f.category === faqCategory
  );

  const faqCategories = [
    { label: "All Questions", id: "all" },
    { label: "Sowing Seeds", id: "seeds" },
    { label: "Job Work", id: "job-work" },
    { label: "B2B Sales", id: "sales" }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* SECTION 1: AGRONOMY BLOG */}
      <div className="space-y-12">
        {/* BLOG HERO */}
        <section className="bg-gradient-to-r from-[#1C3213] to-[#2D4F1E] text-white py-16 text-center space-y-4">
          <div className="max-w-4xl mx-auto px-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Insights & Advice</span>
            <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
              Agronomy & Food Industry Blog
            </h1>
            <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
              Discover tips written by Saurashtra's leading soil agronomists on maximizing groundnut yields, safe warehouse storage, and color sorting.
            </p>
          </div>
        </section>

        {/* BLOG GRID */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {blogs.map((b) => (
              <div 
                key={b.id}
                className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <span className="bg-[#2D4F1E]/5 text-[#2D4F1E] px-2.5 py-1 rounded">
                      {b.category}
                    </span>
                    <span>{b.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 font-serif leading-snug line-clamp-2">
                    {b.title}
                  </h3>
                  
                  <p className="text-xs text-[#5A5A40] leading-relaxed line-clamp-3">
                    {b.content}
                  </p>
                </div>

                <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <User className="h-3 w-3 text-[#2D4F1E]" />
                    <span className="font-bold text-gray-700">{b.author}</span>
                  </div>
                  <button
                    onClick={() => setActiveBlogId(b.id)}
                    className="rounded-lg border border-[#E5E2D9] px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-[#F9F8F3] hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    Read Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 2: COMPREHENSIVE FAQs ACCORDION */}
      <div className="space-y-12 bg-[#F9F8F3] py-16 border-y border-[#E5E2D9]">
        <div className="max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#2D4F1E] uppercase tracking-widest">Help Center</span>
            <h2 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-[#5A5A40] max-w-md mx-auto">Get answers about seed varieties, custom processing contracts, payment terms, and visiting our plant in Sondarda.</p>
          </div>

          {/* FAQS FILTER BAR */}
          <div className="flex flex-wrap justify-center gap-2">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setFaqCategory(cat.id);
                  setOpenFaqIdx(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  faqCategory === cat.id
                    ? "bg-[#2D4F1E] text-white shadow"
                    : "bg-white border border-[#E5E2D9] text-gray-600 hover:border-gray-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ACCORDION ACCENT LIST */}
          <div className="space-y-3 max-w-3xl mx-auto">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-[#E5E2D9] rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-bold text-gray-900 text-xs sm:text-sm font-serif">
                      {faq.question}
                    </span>
                    <span className="text-gray-400">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed text-left bg-gray-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETAILED ARTICLE READER MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="bg-[#F9F8F3] border border-[#E5E2D9] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative shadow-2xl text-left">
            <button
              onClick={() => setActiveBlogId(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white border border-[#E5E2D9] text-gray-500 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="space-y-4">
              <span className="text-[10px] font-bold bg-[#2D4F1E] text-white px-2.5 py-1 rounded uppercase tracking-wider inline-block">
                {selectedBlog.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight font-serif">
                {selectedBlog.title}
              </h2>
              
              <div className="flex items-center gap-3 text-xs text-gray-400 border-b border-[#E5E2D9] pb-4">
                <span className="font-bold text-gray-700">{selectedBlog.author}</span>
                <span>•</span>
                <span>{selectedBlog.date}</span>
                <span>•</span>
                <span>{selectedBlog.readTime}</span>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line space-y-3">
                {selectedBlog.content}
              </div>

              <div className="pt-6 border-t border-[#E5E2D9] flex justify-between items-center">
                <p className="text-[10px] text-gray-400">UV Seeds Agronomy Board</p>
                <button
                  onClick={() => {
                    onOpenInquiry(`Discuss Agronomy: ${selectedBlog.title}`);
                    setActiveBlogId(null);
                  }}
                  className="rounded-xl bg-[#2D4F1E] text-white text-xs font-bold px-4 py-2 hover:bg-[#3D5F2F] transition-colors"
                >
                  Discuss With Our Agronomist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
