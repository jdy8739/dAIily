"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, description, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-foreground mb-2"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mb-3">
            {description}
          </p>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-14 px-4 py-3 border rounded-lg text-base
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

Input.displayName = "Input";

export default Input;
