import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgb(201_164_106/0.55)] hover:brightness-110",
        dark: "bg-foreground text-background hover:bg-foreground/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-ivory/30 bg-transparent text-ivory hover:border-brass hover:text-brass",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted",
        glass: "bg-white/10 text-white backdrop-blur-md border border-white/15 hover:bg-white/20",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-7 text-base",
        // Boutons du site : petites capitales espacées, comme le logo
        lux: "h-13 px-8 text-[0.72rem] uppercase tracking-[0.28em]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
