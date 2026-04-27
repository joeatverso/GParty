"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-display tracking-wider uppercase transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeopardy-gold-bright focus-visible:ring-offset-2 focus-visible:ring-offset-jeopardy-blue-darker";

const variants: Record<Variant, string> = {
  primary:
    "bg-jeopardy-gold text-jeopardy-blue-darker hover:bg-jeopardy-gold-bright shadow-md",
  secondary:
    "bg-jeopardy-blue text-clue-text hover:bg-jeopardy-blue-deep border border-jeopardy-gold/40",
  ghost:
    "bg-transparent text-clue-text hover:bg-white/10 border border-white/20",
  danger: "bg-red-600 text-white hover:bg-red-500",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
});
