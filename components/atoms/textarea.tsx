"use client";

import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  description?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, description, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-foreground mb-2"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-4 border rounded-lg resize-none text-base
            bg-input text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-accent" : "border-border hover:border-border/80"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-accent font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
