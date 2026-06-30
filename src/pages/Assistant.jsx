import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { madarApi } from "@/api/madarApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-foreground text-background"
            : "bg-secondary text-foreground"
        } px-6 py-4`}
      >
        {isUser ? (
          <p className="font-body text-sm">{message.content}</p>
        ) : (
          <div className="font-body text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Assistant() {
  const { t, lang } = useLanguage();
  const { hasTier } = useSubscription();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const canAccess = hasTier("pro");

  useEffect(() => {
    if (canAccess && messages.length === 0) {
      setMessages([{ role: "assistant", content: t("assistant.welcome") }]);
    }
  }, [canAccess]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await madarApi.askAI(userMessage.content);
      const assistantContent =
        typeof response === "string"
          ? response
          : response.answer || response.response || response.message || JSON.stringify(response);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || t("common.error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Upgrade prompt for non-Pro tiers
  if (!canAccess) {
    return (
      <div className="pt-32 pb-24 px-[4%] md:px-[2%] max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center py-24 border border-border/50"
        >
          <Sparkles size={36} className="text-accent mb-8" strokeWidth={1} />
          <h1 className="font-display text-display-md font-light mb-4">
            {t("assistant.title")}
          </h1>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
            {t("assistant.upgradeDesc")}
          </p>
          <Link to="/billing" className="ghost-btn inline-flex items-center gap-2 text-xs">
            {t("market.upgradeBtn")}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-0 h-screen flex flex-col">
      {/* Header */}
      <div className="px-[2%] md:px-[4%] max-w-[1400px] mx-auto w-full pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-xs tracking-label uppercase text-muted-foreground mb-4">
            {lang === "ar" ? "ذكاء" : "Intelligence"}
          </p>
          <h1 className="font-display text-display-md font-light flex items-center gap-3">
            {t("assistant.title")}
            <Sparkles size={20} className="text-accent" strokeWidth={1} />
          </h1>
        </motion.div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-[1400px] mx-auto w-full px-[2%] md:px-[4%]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 py-8">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-secondary px-6 py-4">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="pb-8 pt-4 border-t border-border/50">
          <form onSubmit={handleSend} className="flex items-end gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder")}
              disabled={loading}
              className="flex-1 bg-transparent border-b border-border py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-12 h-12 rounded-full border border-foreground bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors disabled:opacity-30"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}