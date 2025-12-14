"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const presetColors = [
    "#000000",
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
  ];

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600",
          "hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        )}
        style={{ backgroundColor: value }}
        title="Pick color"
      />
      {isOpen && (
        <div className="absolute z-50 right-0 top-full mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64">
          <div className="space-y-3">
            {/* Color wheel input */}
            <div>
              <input
                type="color"
                value={value}
                onChange={handleColorChange}
                className="w-full h-32 cursor-pointer rounded"
              />
            </div>
            {/* Preset colors */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Presets
              </div>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all",
                      value === color
                        ? "border-blue-500 scale-110"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {/* Hex input */}
            <div>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const hex = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                    onChange(hex);
                  }
                }}
                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
