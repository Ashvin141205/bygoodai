import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function AdvisorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Namaste! 🙏 Welcome to Sondarda Seeds & Groundnut Advisor. I can help you with GG-20/GG-2 Biyaran seed calculations, soil queries, moisture specifications, and bulk trading questions. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "GG-20 seed specs?",
    "GG-2 vs GG-20?",
    "Seed Moisture level?",
    "Factory in Sondarda?",
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsg = textToSend.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      // Map history for API
      const chatHistory = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, chatHistory }),
      });

      if (!res.ok) {
        throw new Error("Failed to reach our server. Please check your network.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: "model", text: data.text || "No reply received." }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I apologize, but I am facing connectivity issues at the moment. Please feel free to ask again or drop an inquiry directly to Ramanbhai Patel at +91 98252 53123!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="advisor-chat-toggle"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2D4F1E] text-white shadow-2xl transition-colors hover:bg-[#3D5F2F] focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#D4AF37] text-[10px] font-bold text-white items-center justify-center">AI</span>
          </span>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="advisor-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col rounded-2xl border border-[#E5E2D9] bg-white shadow-2xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-[#2D4F1E] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D5F2F]">
                  <Bot className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white font-serif">Sondarda Groundnut Expert</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></span>
                    Powered by Gemini 3.5
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-200 hover:bg-[#3D5F2F] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto bg-[#F9F8F3] p-4 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-[#2D4F1E] text-white rounded-br-none"
                        : "bg-white text-[#2D2D2A] border border-[#E5E2D9] rounded-bl-none"
                    }`}
                  >
                    {m.role === "model" && (
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#8B4513]">
                        <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                        Advisor
                      </div>
                    )}
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-none border border-[#E5E2D9] bg-white px-4 py-3 text-sm text-[#5A5A40] shadow-sm">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#2D4F1E]" />
                    <span>Analyzing groundnut stats...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons */}
            <div className="border-t border-[#E5E2D9] bg-[#F9F8F3] px-3 py-2">
              <p className="text-[10px] font-bold text-[#8B4513] uppercase tracking-wider mb-1">Quick Questions</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="rounded-full border border-[#E5E2D9] bg-white px-2.5 py-1 text-xs text-[#5A5A40] transition-all hover:border-[#D4AF37] hover:text-[#2D4F1E] disabled:opacity-50 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2 border-t border-[#E5E2D9] bg-white p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask about Seeds, Moisture, Grading..."
                className="flex-1 rounded-xl border border-[#E5E2D9] bg-white px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-gray-400 transition-all focus:border-[#2D4F1E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D4F1E] text-white shadow transition-all hover:bg-[#3D5F2F] focus:outline-none disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
