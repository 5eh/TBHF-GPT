"use client";

import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label = "Write your message",
  placeholder = "Write your markdown here...",
}) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-bold">{label}</Label>
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {isPreview ? "Edit" : "Preview"}
        </button>
      </div>

      <div className="min-h-[200px] rounded-lg border border-gray-600 bg-white/5">
        {isPreview ? (
          <div className="p-4 prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || "*No content yet*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="size-full min-h-[200px] bg-transparent p-4 outline-none resize-y"
          />
        )}
      </div>

      <div className="text-sm text-gray-400">
        Supports markdown features like **bold**, *italic*,
        [links](https://example.com), and more.
      </div>
    </div>
  );
};

export default MarkdownEditor;
