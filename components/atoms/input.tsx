"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            bg-input text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
            disabled:bg-muted disabled:text-muted-foreground
            ${error ? "border-warning" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-warning font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
