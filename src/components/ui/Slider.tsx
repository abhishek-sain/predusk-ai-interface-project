"use client";

import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export const Slider = ({ label, helperText, className, ...props }: SliderProps) => {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-700 dark:text-slate-200">
        {label}
      </span>
      <input
        type="range"
        className={clsx(
          "w-full accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full cursor-pointer",
          className
        )}
        {...props}
      />
      {helperText && (
        <span className="text-[11px] text-gray-500 dark:text-slate-400">
          {helperText}
        </span>
      )}
    </label>
  );
};
