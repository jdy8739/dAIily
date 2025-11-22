"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import Chip from "./chip";

interface ChipListProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  description?: string;
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
  label,
  description,
  disabled = false,
  maxItems,
  variant = "default",
  size = "md",
  className = "",
  error,
}: ChipListProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

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
    if (e.key === "Enter" && !isComposing) {
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

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`w-full ${className}`}>
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

      <div
        className={`
          min-h-[3.5rem] p-3 border rounded-lg bg-input
          focus-within:ring-2 focus-within:ring-ring focus-within:border-ring
          ${error ? "border-accent" : "border-border"}
          ${disabled ? "bg-muted cursor-not-allowed" : "cursor-text"}
        `}
        onClick={e => {
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
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              disabled={disabled}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground disabled:cursor-not-allowed text-base"
            />
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-accent font-medium">{error}</p>
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
