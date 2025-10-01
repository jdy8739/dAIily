"use client";

import { useState, KeyboardEvent } from "react";
import Chip from "./chip";

interface ChipListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  maxItems?: number;
  variant?: "default" | "primary" | "secondary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  error?: string;
}

const ChipList = ({
  items,
  onChange,
  placeholder = "Type and press Enter to add...",
  label,
  disabled = false,
  maxItems,
  variant = "default",
  size = "md",
  className = "",
  error,
}: ChipListProps) => {
  const [inputValue, setInputValue] = useState("");

  const addItem = (value: string) => {
    const trimmedValue = value.trim();
    if (
      trimmedValue &&
      !items.includes(trimmedValue) &&
      (!maxItems || items.length < maxItems)
    ) {
      onChange([...items, trimmedValue]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === "Backspace" && !inputValue && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addItem(inputValue);
    }
  };

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
        </label>
      )}

      <div
        className={`
          min-h-[2.5rem] p-2 border rounded-md bg-input
          focus-within:ring-2 focus-within:ring-ring focus-within:border-ring
          ${error ? "border-warning" : "border-border"}
          ${disabled ? "bg-muted cursor-not-allowed" : "cursor-text"}
        `}
        onClick={(e) => {
          if (!disabled) {
            const input = e.currentTarget.querySelector("input");
            input?.focus();
          }
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <Chip
              key={index}
              variant={variant}
              size={size}
              removable={!disabled}
              onRemove={() => removeItem(index)}
              disabled={disabled}
            >
              {item}
            </Chip>
          ))}

          {(!maxItems || items.length < maxItems) && (
            <input
              id={inputId}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              placeholder={items.length === 0 ? placeholder : ""}
              disabled={disabled}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-warning font-medium">{error}</p>
      )}

      {maxItems && (
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length}/{maxItems} items
        </p>
      )}
    </div>
  );
};

export default ChipList;