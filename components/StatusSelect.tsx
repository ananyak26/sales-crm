"use client";

import { ChevronDown } from "lucide-react";

export default function StatusSelect({
  value,
  onChange,
  options,
  colorMap,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  colorMap: Record<string, string>;
}) {
  return (
    <div
      className={`relative inline-flex items-center rounded-full border font-semibold transition-all duration-150 hover:shadow-sm ${
        colorMap[value] || "bg-gray-100 text-ink-500 border-gray-200"
      }`}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent border-0 pl-3 pr-7 py-1.5 text-[11.5px] tracking-wide cursor-pointer
          text-inherit font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 rounded-full"
      >
        {options.map((o) => (
          <option key={o} value={o} className="text-ink-800 bg-white font-medium">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={12} strokeWidth={2.5} className="absolute right-2 pointer-events-none opacity-60" />
    </div>
  );
}
