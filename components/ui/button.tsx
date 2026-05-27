"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_30px_-12px_rgb(168_85_247/0.5)] hover:bg-primary/90 hover:shadow-[0_12px_40px_-12px_rgb(168_85_247/0.6)]",
        gradient:
          "relative text-white shadow-[0_8px_30px_-12px_rgb(168_85_247/0.5)] hover:shadow-[0_12px_40px_-12px_rgb(168_85_247/0.6)] bg-[linear-gradient(120deg,#7c3aed_0%,#a855f7_50%,#6366f1_100%)] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-500",
        outline:
          "border border-border bg-secondary/40 hover:bg-secondary/80 hover:border-white/20",
        ghost: "hover:bg-secondary/60",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
