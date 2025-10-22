"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const HomeIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const FileText = ({ className = "w-5 h-5" }) => (
<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.75" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    className={className}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M10 9H8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
  </svg>
);
const Pengaduan = ({ className = "w-5 h-5" }) => (
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    className={className}
  >
    <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>
  </svg>
);
const LayananIcon = ({ className = "w-5 h-5" }) => (
<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.75" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);
const EpasarIcon = ({ className = "w-5 h-5" }) => (
<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.75" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    className={className}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
    <path d="M2 7h20"/>
    <path d="M22 7v3a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7"/>
  </svg>
);
interface Tab {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: never;
}
interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}
type TabItem = Tab | Separator;
interface ExpandedTabsProps {
  tabs: TabItem[];
  className?: string;
  onChange?: (index: number | null) => void;
  activeTab?: string;
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: {
    width: "auto",
    opacity: 1,
    transition: { delay: 0.05, duration: 0.2, ease: "easeOut" as const },
  },
  exit: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

function ExpandedTabs({ tabs, className, onChange, activeTab }: ExpandedTabsProps) {
  const [selected, setSelected] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set active tab based on activeTab prop
    if (activeTab) {
      const tabMap = ['beranda', 'berita', 'pengaduan', 'layanan', 'epasar', null, 'profile'];
      const index = tabMap.indexOf(activeTab);
      if (index !== -1) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => setSelected(index), 0);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelected(null);
        if (onChange) onChange(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onChange]);

  const handleSelect = (index: number) => {
    setSelected(index);
    if (onChange) onChange(index);
  };

  const SeparatorComponent = () => (
    <div
      className="h-6 w-px bg-border flex-shrink-0 sm:h-8"
      aria-hidden="true"
    />
  );

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-1 rounded-full border border-border bg-background/70 backdrop-blur-sm p-1 shadow-md w-[412px] max-w-[90vw] sm:max-w-none ${className || ""}`}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <SeparatorComponent key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isSelected = selected === index;

        return (
          <button
            key={tab.title}
            onClick={() => handleSelect(index)}
            className={`relative z-10 flex items-center rounded-full px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-colors focus:outline-none flex-1
              ${
                isSelected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="pill"
                className="absolute inset-0 z-0 rounded-full bg-background backdrop-blur-sm border border-primary/50 shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8" />
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="overflow-hidden whitespace-nowrap text-xs sm:text-sm"
                  >
                    {tab.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function Tabs2({ onChange, activeTab }: { onChange?: (index: number | null) => void; activeTab?: string }) {
  const TABS: TabItem[] = [
    { title: "Home", icon: HomeIcon },
    { title: "Berita", icon: FileText },
    { title: "Pengaduan", icon: Pengaduan },
    { title: "Layanan", icon: LayananIcon },
    { title: "e-Pasar", icon: EpasarIcon },
    { type: "separator" },
    { title: "Profile", icon: UserIcon },
//    { title: "Settings", icon: SettingsIcon },
  ];

  return <ExpandedTabs tabs={TABS} onChange={onChange} activeTab={activeTab} />;
}