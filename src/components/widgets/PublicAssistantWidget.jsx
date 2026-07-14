import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { answerPublicQuestion, PUBLIC_SUGGESTED_QUESTIONS } from '@/lib/publicAssistant';

// The GUEST assistant: a deliberately offline, knowledge-base-driven guide.
// It answers general questions about Madar (features, plans, signup,
// support) instantly and for free, and by construction can never access or
// discuss customer data — private questions get a safe redirect to signup
// or support. Logged-in users get SmartCoachWidget instead (see
// CommunicationWidgets).
export default function PublicAssistantWidget() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const greeting = lang === 'ar'
    ? 'أهلًا! أنا دليل مدار العام — اسألني عن المزايا أو الباقات أو خطوات التسجيل أو الدعم.'
    : "Hi! I'm the Madar guide — ask me about features, plans, signing up, or support.";

  const ask = (text) => {
    const q = String(text || '').trim();
    if (!q) return;
    const result = answerPublicQuestion(q);
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: 'user', text: q },
      { id: prev.length + 2, role: 'assistant', text: lang === 'ar' ? result.answer.ar : result.answer.en, links: result.links || [] },
    ]);
    setInput('');
  };

  const suggestions = PUBLIC_SUGGESTED_QUESTIONS[lang] || PUBLIC_SUGGESTED_QUESTIONS.en;
  const surface = theme === 'dark' ? 'bg-card border-foreground/[0.08]' : 'bg-white border-black/[0.08]';

  return (
    <div>
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={lang === 'ar' ? 'مساعد مدار' : 'Madar assistant'}
        aria-expanded={isOpen}
        className="fixed z-40 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center bg-gradient-to-br from-[#00548C] to-[#003152] text-white"
        style={{
          [isRTL ? 'left' : 'right']: '1.25rem',
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-label={lang === 'ar' ? 'محادثة دليل مدار' : 'Madar guide chat'}
            className={`fixed z-40 w-[min(24rem,calc(100vw-2rem))] max-h-[min(34rem,calc(100vh-8rem))] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${surface}`}
            style={{
              [isRTL ? 'left' : 'right']: '1.25rem',
              bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="px-4 py-3 border-b border-foreground/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00548C] to-[#003152] flex items-center justify-center text-white text-sm font-bold">M</div>
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">{lang === 'ar' ? 'دليل مدار' : 'Madar Guide'}</p>
                  <p className="text-[11px] text-foreground/45">
                    {lang === 'ar' ? 'أسئلة عامة فقط — بدون بيانات حسابات' : 'General questions only — no account data'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
                className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-xl bg-foreground/[0.06] text-sm text-foreground leading-relaxed">
                {greeting}
              </div>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#00548C] to-[#003152] text-white'
                      : 'bg-foreground/[0.06] text-foreground'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    {m.links?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.links.map((link) => (
                          <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-[#1B84C4] hover:underline">
                            {lang === 'ar' ? link.label.ar : link.label.en} ←
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button key={q} type="button" onClick={() => ask(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-foreground/[0.05] border border-foreground/[0.08] text-foreground/70 hover:text-foreground transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="px-3 py-3 border-t border-foreground/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') ask(input); }}
                placeholder={lang === 'ar' ? 'اسأل عن مدار…' : 'Ask about Madar…'}
                aria-label={lang === 'ar' ? 'اكتب سؤالك' : 'Type your question'}
                className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg bg-foreground/[0.05] border border-foreground/[0.08] text-foreground placeholder-foreground/35 outline-none focus:ring-2 focus:ring-[#1B84C4]/20"
              />
              <button type="button" onClick={() => ask(input)} disabled={!input.trim()}
                aria-label={lang === 'ar' ? 'إرسال' : 'Send'}
                className="p-2 rounded-lg text-[#1B84C4] hover:bg-[#1B84C4]/10 disabled:opacity-40 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
