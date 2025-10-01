"use client";

import { useEffect, useState } from "react";

interface ClientDateProps {
  date: Date | string;
  className?: string;
}

const ClientDate = ({ date, className }: ClientDateProps) => {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFormattedDate(new Date(date).toLocaleDateString());
  }, [date]);

  if (!mounted) {
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
};

export default ClientDate;