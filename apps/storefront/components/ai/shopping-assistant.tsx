'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, ShoppingBag, Heart, Trash2, Mic, History } from 'lucide-react';
import { cn } from '@corecart/shared';
import { formatPrice } from '@corecart/shared';

function StreamedText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.span
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.02,
          }
        }
      }}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="inline-block mr-1"
          variants={{
            initial: { opacity: 0, y: 2 },
            animate: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.08, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/product/')) {
        setProductId('iphone-17-test-id');
      }
      if (path.includes('/category/')) {
        setCategoryId('electronics-test-id');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setUnread(false);
    
    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          conversationId,
          contextPath: window.location.pathname,
          productId,
          categoryId
        })
      });
      const json = await res.json();
      if (json.success) {
        setConversationId(json.conversationId);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'model',
          content: json.reply,
          sources: json.sources || [],
          comparisonGrid: json.comparisonGrid || null,
          winner: json.winner || null,
          products: json.products || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'model',
          content: json.reply || "Sorry, I encountered an issue processing your request. Please try again."
        }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'model',
        content: "Sorry, I could not establish a connection to the server. Please check your internet connection."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.onresult = (e: any) => {
      const speech = e.results[0][0].transcript;
      setInput(speech);
    };

    rec.start();
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      {/* Floating Trigger Button (Hidden when assistant is open on mobile to save space) */}
      <div className={cn("fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6", isOpen && "hidden sm:block")}>
        <button
          onClick={() => {
            setIsOpen(true);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(80);
            }
          }}
          className={cn(
            "relative p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer bg-foreground text-background border border-border/20",
            loading && "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-gradient"
          )}
        >
          <MessageSquare className="size-6" />
          {unread && <span className="absolute top-1 right-1 size-2.5 rounded-full bg-red-500 animate-ping" />}
        </button>
      </div>

      {/* Main Assistant container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay (dismisses chat drawer) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 400 }}
              dragElastic={{ top: 0, bottom: 0.2 }}
              onDragEnd={(e, info) => {
                // Swipe down dismissal gesture for mobile bottom sheet
                if (info.offset.y > 150) {
                  setIsOpen(false);
                }
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 h-[80vh] sm:top-0 sm:right-0 sm:left-auto sm:bottom-auto sm:h-screen w-full sm:w-[420px] bg-background/95 backdrop-blur-2xl border-t sm:border-t-0 sm:border-l border-border rounded-t-[32px] sm:rounded-t-none z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drag Handle (Mobile only) */}
              <div className="block sm:hidden w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-3 cursor-row-resize" />

              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-indigo-500" />
                  <span className="font-extrabold text-sm tracking-wide text-foreground">SmartGO AI Copilot</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={clearChat} className="p-2 hover:bg-accent rounded-xl text-muted-foreground transition-all cursor-pointer">
                    <Trash2 className="size-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground transition-all cursor-pointer">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Conversation log list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-4 py-8">
                    <h3 className="text-xl font-extrabold text-foreground">Hi 👋 How can I help you today?</h3>
                    <p className="text-xs text-muted-foreground">Select a recommended query below or ask anything about the catalog, specs, or your order history.</p>
                    
                    <div className="flex flex-col gap-2">
                      {[
                        "Find gaming laptops under ₹80,000",
                        "Compare iPhone 17 vs Galaxy S26",
                        "Best birthday gift for my sister",
                        "Where is my order?",
                        "Return and refund policies"
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          className="p-3 text-left rounded-2xl bg-accent/30 hover:bg-accent/60 border border-border/20 text-xs font-semibold text-foreground transition-all cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex flex-col max-w-[85%]", m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}
                  >
                    <div className={cn("p-3 rounded-2xl text-xs leading-relaxed", m.role === 'user' ? 'bg-foreground text-background font-medium' : 'bg-accent/40 border border-border/20 text-foreground')}>
                      {m.role === 'model' ? <StreamedText text={m.content} /> : m.content}
                    </div>

                    {/* Sources links */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                        <span>Sources:</span>
                        {m.sources.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 rounded-full bg-accent border border-border/10 font-medium">✓ {s}</span>
                        ))}
                      </div>
                    )}

                    {/* Comparison table */}
                    {m.comparisonGrid && (
                      <div className="mt-3 p-3 rounded-2xl bg-accent/20 border border-border/20 w-full overflow-x-auto">
                        <table className="w-full text-[10px] text-left divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="py-1 font-bold text-muted-foreground">Feature</th>
                              <th className="py-1 font-bold">Prod 1</th>
                              <th className="py-1 font-bold">Prod 2</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10">
                            {m.comparisonGrid.map((row: any, idx: number) => (
                              <tr key={idx}>
                                <td className="py-1 text-muted-foreground font-medium">{row.feature}</td>
                                <td className="py-1">{row.val1}</td>
                                <td className="py-1">{row.val2}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {m.winner && (
                          <div className="mt-2 text-[10px] text-indigo-500 font-bold">
                            Winner ⭐: {m.winner}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Grounded product preview cards */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2 w-full">
                        {m.products.map((p: any) => (
                          <div key={p.id} className="p-3 rounded-2xl bg-background border border-border shadow-xs flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(p.price || 999.00)}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button className="p-2 hover:bg-accent rounded-xl text-foreground transition-all cursor-pointer">
                                <ShoppingBag className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex flex-col items-start space-y-2 max-w-[80%] mr-auto">
                    <div className="p-3 rounded-2xl bg-accent/40 border border-border/20 text-xs text-muted-foreground flex items-center gap-2">
                      <div className="size-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="size-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                      <div className="size-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input text & voice form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="p-4 border-t border-border flex items-center gap-2 bg-background/50 backdrop-blur"
              >
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className={cn(
                    "p-3 rounded-2xl border border-border bg-card text-foreground hover:bg-muted transition-all",
                    isListening && "border-red-500 bg-red-500/10 text-red-600 animate-pulse"
                  )}
                >
                  <Mic className="size-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening speech..." : "Ask copilot anything..."}
                  className="flex-1 p-3 rounded-2xl border border-border text-xs bg-background focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="p-3 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
