import Link from "next/link";
import { PenTool } from "lucide-react";

interface WriteNewEntryLinkProps {
  href?: string;
  className?: string;
}

const WriteNewEntryLink = ({
  href = "/write",
  className = "",
}: WriteNewEntryLinkProps) => {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-300 ease-out border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 text-primary hover:scale-105 hover:shadow-md hover:from-primary/25 hover:to-primary/10 hover:border-primary/60 font-semibold gap-2 whitespace-nowrap ${className}`}
    >
      <PenTool className="w-4 h-4" />
      Write New Entry
    </Link>
  );
};

export default WriteNewEntryLink;
