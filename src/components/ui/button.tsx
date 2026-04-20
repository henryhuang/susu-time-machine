import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

const variants = {
  primary: "bg-peach-500 text-white hover:bg-peach-600 border-peach-500",
  secondary: "bg-white text-susu-text hover:bg-peach-50 border-susu-line",
  ghost: "bg-transparent text-peach-600 hover:bg-peach-50 border-transparent",
  danger: "bg-susu-red text-white hover:brightness-95 border-susu-red"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5"
};

export function buttonClassName({
  variant = "secondary",
  size = "md",
  className = ""
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return `inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return <Link className={buttonClassName({ variant, size, className })} {...props} />;
}
