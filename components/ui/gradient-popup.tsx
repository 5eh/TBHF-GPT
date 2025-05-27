"use client";

import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Button } from "./button";

const gradients = [
  {
    name: "Purple to Violet",
    className: "from-purple-600 to-violet-600",
    preview: "linear-gradient(to right, rgb(147, 51, 234), rgb(124, 58, 237))"
  },
  {
    name: "Blue to Indigo",
    className: "from-blue-600 to-indigo-600",
    preview: "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))"
  },
  {
    name: "Green to Emerald",
    className: "from-green-600 to-emerald-600",
    preview: "linear-gradient(to right, rgb(22, 163, 74), rgb(5, 150, 105))"
  },
  {
    name: "Red to Rose",
    className: "from-red-600 to-rose-600",
    preview: "linear-gradient(to right, rgb(220, 38, 38), rgb(225, 29, 72))"
  },
  {
    name: "Orange to Amber",
    className: "from-orange-600 to-amber-600",
    preview: "linear-gradient(to right, rgb(234, 88, 12), rgb(217, 119, 6))"
  },
  {
    name: "Yellow to Orange",
    className: "from-yellow-600 to-orange-600",
    preview: "linear-gradient(to right, rgb(202, 138, 4), rgb(234, 88, 12))"
  },
  {
    name: "Teal to Cyan",
    className: "from-teal-600 to-cyan-600",
    preview: "linear-gradient(to right, rgb(13, 148, 136), rgb(8, 145, 178))"
  },
  {
    name: "Pink to Fuchsia",
    className: "from-pink-600 to-fuchsia-600",
    preview: "linear-gradient(to right, rgb(219, 39, 119), rgb(192, 38, 211))"
  }
];

interface GradientPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gradient: string) => void;
}

export default function GradientPopup({
  isOpen,
  onClose,
  onSelect,
}: GradientPopupProps) {
  const [selectedGradient, setSelectedGradient] = useState<typeof gradients[0] | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Select a Gradient
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {gradients.map((gradient) => (
            <button
              key={gradient.name}
              onClick={() => setSelectedGradient(gradient)}
              className="group relative aspect-square rounded-lg overflow-hidden transition duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div
                className="w-full h-full"
                style={{ background: gradient.preview }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                <span className="text-white text-xs text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2">
                  {gradient.name}
                </span>
              </div>
              {selectedGradient?.name === gradient.name && (
                <div className="absolute inset-0 ring-2 ring-primary rounded-lg" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Label className="block mb-2 dark:text-white">Preview</Label>
          <div
            className="w-full h-24 rounded-lg"
            style={{
              background: selectedGradient?.preview || "transparent"
            }}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedGradient) {
                onSelect(selectedGradient.className);
                onClose();
              }
            }}
            disabled={!selectedGradient}
          >
            Select Gradient
          </Button>
        </div>
      </div>
    </div>
  );
}