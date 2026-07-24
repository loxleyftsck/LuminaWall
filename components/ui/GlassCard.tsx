import type { HTMLAttributes } from "react";

/** Shared glassmorphism surface used across panels and cards. */
export default function GlassCard({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`glass rounded-3xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] ${className}`}
      {...props}
    />
  );
}
