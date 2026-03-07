import { useState, useRef } from "react";
import { useOutsideClick } from "rooks";
import { useTheme, THEMES } from "../contexts/ThemeContext";

const THEME_META = {
  default:    { label: "OS",  icon: "◉", desc: "Default" },
  brutalism:  { label: "BRU", icon: "▓", desc: "Brutalism" },
  futurism:   { label: "FUT", icon: "◈", desc: "Futurism" },
  retro:      { label: "RET", icon: "◍", desc: "Retro" },
  terminal:   { label: "TRM", icon: "█", desc: "Terminal" },
};

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => setOpen(false));

  const meta = THEME_META[theme];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        title={meta.desc}
        className="transition-colors cursor-pointer hover:text-black dark:hover:text-white flex items-center gap-1 text-[10px] font-mono tracking-widest"
        style={{ letterSpacing: "0.08em" }}
      >
        <span>{meta.icon}</span>
        <span className="hidden sm:inline">{meta.label}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 border border-black/15 dark:border-white/15 rounded-md overflow-hidden z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm"
          style={{ minWidth: "130px" }}
        >
          {THEMES.map(t => (
            <button
              key={t}
              onClick={() => { setTheme(t); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[10px] font-mono tracking-wider cursor-pointer transition-colors hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2 ${theme === t ? "opacity-100" : "opacity-55"}`}
            >
              <span>{THEME_META[t].icon}</span>
              <span>{THEME_META[t].desc}</span>
              {theme === t && <span className="ml-auto opacity-50">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
