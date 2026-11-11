import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2 group ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700/80 hover:border-amber-400/50 shadow-md'
          : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:-rotate-12 text-slate-700" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
