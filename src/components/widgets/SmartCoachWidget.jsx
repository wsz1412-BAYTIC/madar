import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { base44 } from '@/api/base44Client';

const SUGGESTED_QUESTIONS = {
  en: [
    'How do I add a new property?',
    'What does the occupancy rate mean?',
    'Why is Madar recommending a different price?',
    'How can I increase my property revenue?',
    'How do I understand the competitor comparison?',
    'What features are included in my subscription?'
  ],
  ar: [
    'كيف أضيف عقار جديد؟',
    'ما المقصود بمعدل الإشغال؟',
    'لماذا تقترح مدار سعرًا مختلفًا؟',
    'كيف يمكنني زيادة إيراداتي من العقار؟',
    'كيف أفهم مقارنة المنافسين؟',
    'ما الميزات المضمنة في اشتراكي؟'
  ]
};

export default function SmartCoachWidget() {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();
  const { subscription } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: lang === 'ar'
        ? 'كيف يمكنني مساعدتك اليوم؟ اسأل عني عن عقاراتك أو التقارير أو التوصيات أو ميزات الاشتراك.'
        : 'How can I help you today? Ask me about your properties, reports, pricing recommendations, market data, or how to use Madar.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Remaining questions in the current window (day or trial), from the server.
  const [remaining, setRemaining] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      // All AI questions go through the quota-enforced backend function —
      // daily plan limits, trial budget, word caps and private memory are
      // applied server-side; the widget only renders the result.
      const res = await base44.functions.invoke('ai-assistant', { question: text, lang });
      const data = res?.data || {};
      if (typeof data.remaining === 'number') setRemaining(data.remaining);

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: (data.answer || '') + '\n\n_AI-generated answers may contain errors. Review important recommendations before making pricing, financial, or operational decisions._',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const data = error?.response?.data || error?.data || {};
      const limitHit = data.upgrade === true;
      if (limitHit) setRemaining(0);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: limitHit
          ? (lang === 'ar' ? data.error : data.error_en) || data.error
          : lang === 'ar'
            ? 'عذرًا، حدث خطأ. يرجى محاولة مرة أخرى لاحقًا.'
            : 'Sorry, something went wrong. Please try again later.',
        timestamp: new Date(),
        isError: !limitHit,
        isUpgradePrompt: limitHit
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: lang === 'ar'
          ? 'كيف يمكنني مساعدتك اليوم؟ اسأل عني عن عقاراتك أو التقارير أو التوصيات أو ميزات الاشتراك.'
          : 'How can I help you today? Ask me about your properties, reports, pricing recommendations, market data, or how to use Madar.',
        timestamp: new Date()
      }
    ]);
    setShowSuggestions(true);
  };

  const questions = SUGGESTED_QUESTIONS[lang] || SUGGESTED_QUESTIONS.en;

  return (
    <div>
      {/* Floating Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-40 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
        style={{
          [isRTL ? 'left' : 'right']: '1.5rem',
          bottom: '1.5rem'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed z-40 w-96 max-h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
              theme === 'dark'
                ? 'bg-card border border-foreground/[0.06]'
                : 'bg-white border border-[#0A0B10]/[0.06]'
            }`}
            style={{
              [isRTL ? 'left' : 'right']: '1.5rem',
              bottom: isMinimized ? '5.5rem' : '5.5rem',
              maxHeight: isMinimized ? '52px' : '600px'
            }}
          >
            {/* Header */}
            <div className={`px-4 py-4 border-b ${
              theme === 'dark'
                ? 'border-foreground/[0.06] bg-card'
                : 'border-[#0A0B10]/[0.06] bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-sm ${
                      theme === 'dark' ? 'text-foreground' : 'text-[#0A0B10]'
                    }`}>
                      {lang === 'ar' ? 'مدار سمارت كوتش' : 'Madar Smart Coach'}
                    </h3>
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {lang === 'ar' ? 'متصل' : 'Online'}
                      {remaining !== null && (
                        <span className="text-foreground/40 nums" dir="ltr">
                          · {remaining} {lang === 'ar' ? 'أسئلة متبقية' : 'left'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-foreground/5 text-foreground/50'
                        : 'hover:bg-background/5 text-[#0A0B10]/50'
                    }`}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-foreground/5 text-foreground/50'
                        : 'hover:bg-background/5 text-[#0A0B10]/50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                  theme === 'dark' ? 'bg-background/50' : 'bg-[#F2EFE8]/30'
                }`}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : theme === 'dark'
                            ? 'bg-foreground/[0.08] text-foreground'
                            : 'bg-background/[0.08] text-[#0A0B10]'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                          {msg.isUpgradePrompt && (
                            <a href="/billing" className="block mt-2 text-xs font-semibold text-[#D95F3B] hover:underline">
                              {lang === 'ar' ? 'عرض خطط الترقية ←' : 'View upgrade plans →'}
                            </a>
                          )}
                        </p>
                        <span className={`text-xs ${
                          msg.role === 'user'
                            ? 'text-white/60'
                            : theme === 'dark'
                              ? 'text-foreground/40'
                              : 'text-[#0A0B10]/40'
                        } block mt-1`}>
                          {msg.timestamp.toLocaleTimeString(lang === 'ar' ? 'ar' : 'en', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className={`px-4 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-foreground/[0.08] text-foreground'
                          : 'bg-background/[0.08] text-[#0A0B10]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{lang === 'ar' ? 'جارٍ الكتابة...' : 'Typing...'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {showSuggestions && messages.length === 1 && (
                  <div className={`px-4 py-3 border-t ${
                    theme === 'dark'
                      ? 'border-foreground/[0.06]'
                      : 'border-[#0A0B10]/[0.06]'
                  }`}>
                    <p className={`text-xs font-medium mb-2 ${
                      theme === 'dark' ? 'text-foreground/50' : 'text-[#0A0B10]/50'
                    }`}>
                      {lang === 'ar' ? 'الأسئلة المقترحة:' : 'Suggested questions:'}
                    </p>
                    <div className="space-y-2">
                      {questions.slice(0, 3).map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className={`block w-full text-left text-xs p-2 rounded transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-foreground/5 text-foreground/70'
                              : 'hover:bg-background/5 text-[#0A0B10]/70'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className={`px-4 py-3 border-t flex items-end gap-2 ${
                  theme === 'dark'
                    ? 'border-foreground/[0.06] bg-card'
                    : 'border-[#0A0B10]/[0.06] bg-white'
                }`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                    placeholder={lang === 'ar' ? 'اكتب سؤالك...' : 'Ask a question...'}
                    disabled={loading}
                    className={`flex-1 text-sm px-3 py-2 rounded-lg outline-none ${
                      theme === 'dark'
                        ? 'bg-foreground/[0.05] border border-foreground/[0.06] text-foreground placeholder-foreground/40'
                        : 'bg-background/[0.05] border border-[#0A0B10]/[0.06] text-[#0A0B10] placeholder-[#0A0B10]/40'
                    }`}
                  />
                  <button
                    onClick={() => handleSendMessage(input)}
                    disabled={loading || !input.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      loading || !input.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-foreground/5 text-foreground/50'
                        : 'hover:bg-background/5 text-[#0A0B10]/50'
                    }`}
                    title={lang === 'ar' ? 'مسح المحادثة' : 'Clear conversation'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}