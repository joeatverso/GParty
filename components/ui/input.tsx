"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-white/20 bg-jeopardy-blue-darker px-3 py-2 text-base text-clue-text placeholder:text-white/40 focus:border-jeopardy-gold-bright focus:outline-none focus:ring-2 focus:ring-jeopardy-gold-bright/40 transition",
        className,
      )}
      {...rest}
    />
  );
});
