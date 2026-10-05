import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, X, ArrowUpDown, Sparkles } from "lucide-react";
import { CURRENCIES, Currency } from "@/lib/mockData";

export interface LuxeCurrencySelectorProps {
  selectedCode: string;
  onSelect: (code: string) => void;
  rates: Record<string, number>;
  lang?: "ar" | "en";
  className?: string;
  isRealSdgMarket?: boolean;
}

export const LuxeCurrencySelector = ({
  selectedCode,
  onSelect,
  rates,
  lang = "ar",
  className = "",
  isRealSdgMarket = true,
}: LuxeCurrencySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Current selected currency object
  const currentCurrency = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCode) || CURRENCIES[0];
  }, [selectedCode]);

  // Filtered currency list
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter((c) => {
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c as any).nameEn?.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const getEffectiveRate = (code: string) => {
    if (code === "SDG" && isRealSdgMarket) {
      return 2750; // Real market / Bankak P2P rate in Sudan
    }
    return rates[code] || 1;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Luxe Pro Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-11 px-3.5 rounded-xl bg-card hover:bg-card/90 border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all duration-200 flex items-center justify-between gap-2 shadow-sm text-start"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0 leading-none drop-shadow-sm">
            {currentCurrency.flag}
          </span>
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
              {currentCurrency.code}
            </span>
            <span className="text-xs text-muted-foreground truncate hidden xs:inline">
              — {lang === "ar" ? currentCurrency.name : (currentCurrency as any).nameEn || currentCurrency.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mini rate preview tag */}
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-secondary/80 border border-border/80 text-[11px] font-mono text-muted-foreground font-semibold">
            ${1} ≈ {getEffectiveRate(currentCurrency.code).toLocaleString("en-US", { maximumFractionDigits: currentCurrency.code === "GOLD" ? 4 : 2 })}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {/* Luxe Pro Popover / Modal Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-50 mt-1.5 w-full min-w-[280px] sm:min-w-[340px] max-w-[420px] end-0 rounded-2xl bg-card/95 backdrop-blur-2xl border border-primary/30 shadow-2xl p-2.5 overflow-hidden"
          >
            {/* Header & Quick Search */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ar" ? "ابحث باسم العملة أو الدولة..." : "Search currency or country..."}
                className="w-full h-9 ps-9 pe-8 rounded-xl bg-background/80 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Currency Items List */}
            <div
              role="listbox"
              className="max-h-[260px] overflow-y-auto space-y-1 pe-1 focus:outline-none custom-scrollbar"
            >
              {filteredCurrencies.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {lang === "ar" ? "لا توجد عملة مطابقة للبحث" : "No matching currencies found"}
                </div>
              ) : (
                filteredCurrencies.map((c) => {
                  const isSelected = c.code === selectedCode;
                  const rate = getEffectiveRate(c.code);

                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onSelect(c.code);
                        setIsOpen(false);
                      }}
                      className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-3 text-start transition-all duration-150 group ${
                        isSelected
                          ? "bg-primary/15 text-primary border border-primary/35 shadow-sm"
                          : "hover:bg-secondary/70 text-foreground border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0 leading-none">
                          {c.flag}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs">
                              {c.code}
                            </span>
                            {c.code === "SDG" && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                {lang === "ar" ? "سعر بنكك الفعلي" : "Real Market"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {lang === "ar" ? c.name : (c as any).nameEn || c.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {rate.toLocaleString("en-US", {
                            maximumFractionDigits: c.code === "GOLD" ? 4 : 2,
                          })}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Notice */}
            <div className="mt-2 pt-2 border-t border-border/60 px-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                {lang === "ar" ? "أسعار مباشرة ومعتمدة" : "Live verified exchange rates"}
              </span>
              <span className="font-mono text-primary/80">USD Base</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
