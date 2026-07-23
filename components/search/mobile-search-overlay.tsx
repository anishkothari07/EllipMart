'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Mic, History, Camera, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function MobileSearchOverlay({
  isOpen,
  onClose,
  trending = ['Laptops', 'Wireless Earbuds', 'Denim Jackets', 'Casual Shoes'],
}: {
  isOpen: boolean;
  onClose: () => void;
  trending?: string[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      const saved = localStorage.getItem('recent_searches');
      if (saved) setHistory(JSON.parse(saved));
    }
  }, [isOpen]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;

    // Save to history
    const updated = [term, ...history.filter((x) => x !== term)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-IN'; // Hinglish & Indian English support
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.onresult = (e: any) => {
      const speech = e.results[0][0].transcript;
      setQuery(speech);
      handleSearch(speech);
    };

    rec.start();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed inset-0 z-50 bg-background flex flex-col p-4"
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search products, brands, Hinglish terms..."
              className="h-12 w-full rounded-2xl border border-border bg-muted/50 pl-11 pr-12 text-sm outline-none focus:border-foreground/30"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        {/* Action button: Mic & Camera */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={startVoiceSearch}
            className={`flex flex-1 items-center justify-center gap-2 h-12 rounded-2xl border text-xs font-semibold transition-all ${
              isListening
                ? 'border-red-500 bg-red-500/10 text-red-600 animate-pulse'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            <Mic className="size-4" />
            {isListening ? 'Listening...' : 'Voice Search'}
          </button>
          <button
            onClick={() => alert('Barcode/QR Scanner camera access placeholder')}
            className="flex flex-1 items-center justify-center gap-2 h-12 rounded-2xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Camera className="size-4" />
            Scan Barcode
          </button>
        </div>

        {/* Recent Searches */}
        {history.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Recent Searches
            </h4>
            <ul className="flex flex-col gap-1">
              {history.map((term, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/40 py-2.5">
                  <button
                    onClick={() => handleSearch(term)}
                    className="flex items-center gap-2.5 text-sm font-medium text-foreground hover:text-accent"
                  >
                    <History className="size-4 text-muted-foreground" />
                    {term}
                  </button>
                  <button
                    onClick={() => {
                      const filtered = history.filter((x) => x !== term);
                      setHistory(filtered);
                      localStorage.setItem('recent_searches', JSON.stringify(filtered));
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trending Searches */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Flame className="size-4 text-orange-500" /> Trending Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {trending.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSearch(term)}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:scale-[1.02] active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
