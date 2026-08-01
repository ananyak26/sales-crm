"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type StatusTone = "gray" | "blue" | "green" | "red" | "amber";

export type StatusOption = {
  value: string;
  tone: StatusTone;
};

const toneStyles: Record<StatusTone, { text: string; bg: string; dot: string; ring: string }> = {
  gray: { text: "text-ink-500", bg: "bg-gray-100", dot: "bg-gray-400", ring: "ring-gray-200" },
  blue: { text: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500", ring: "ring-blue-100" },
  green: { text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", ring: "ring-emerald-100" },
  red: { text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500", ring: "ring-rose-100" },
  amber: { text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500", ring: "ring-amber-100" },
};

export default function StatusDropdown({
  value,
  options,
  onChange,
  disabled,
  className = "",
  align = "left",
}: {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const current = options.find((o) => o.value === value) ?? options[0];
  const tone = toneStyles[current?.tone ?? "gray"];

  const select = async (next: string) => {
    if (next === value) {
      setOpen(false);
      return;
    }
    setOpen(false);
    setUpdating(true);
    try {
      await onChange(next);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`group inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-[11px] font-semibold tracking-wide
          ${tone.bg} ${tone.text} ring-1 ${tone.ring}
          transition-all duration-150 hover:brightness-[0.97] active:scale-[0.97]
          disabled:opacity-50 disabled:pointer-events-none
          ${open ? "ring-2 ring-offset-1" : ""}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot} ${updating ? "animate-pulse" : ""}`} />
        {current?.value ?? value}
        <ChevronDown
          size={12}
          className={`opacity-50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute z-30 mt-1.5 w-40 origin-top ${align === "right" ? "right-0" : "left-0"}
          rounded-xl border border-gray-100 bg-white p-1 shadow-lg
          transition-all duration-150
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
      >
        {options.map((opt) => {
          const t = toneStyles[opt.tone];
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium
                transition-colors duration-100 hover:bg-gray-50 ${active ? "text-ink-900" : "text-ink-600"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
              <span className="flex-1">{opt.value}</span>
              {active && <Check size={13} className="text-brand-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
