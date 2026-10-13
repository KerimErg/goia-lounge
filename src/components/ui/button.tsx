import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Encre → balayage taupe au survol (couleurs du logo)
        default: "bg-ink text-ivory bg-[linear-gradient(var(--taupe),var(--taupe))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size,color,box-shadow] duration-500 ease-[var(--ease-lux)]",
        // Ivoire, pour les fonds sombres, taupe ou marbre
        light: "bg-ivory text-ink bg-[linear-gradient(var(--linen),var(--linen))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size,color] duration-500 ease-[var(--ease-lux)]",
        dark: "bg-foreground text-background hover:bg-foreground/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        // Contour qui prend la couleur du texte de la section
        outline: "border border-current/35 bg-transparent hover:border-current hover:bg-current/[0.06]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted",
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
