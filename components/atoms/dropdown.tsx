"use client";

import { forwardRef } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: DropdownOption[];
  placeholder?: string;
  description?: string;
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  (
    { error, label, description, className = "", id, options, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-foreground mb-2"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-14 px-4 py-3 border rounded-lg shadow-sm text-base
            bg-input text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
            disabled:bg-muted disabled:text-muted-foreground
            ${error ? "border-accent" : "border-border"}
            ${className}
          `}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-accent font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
