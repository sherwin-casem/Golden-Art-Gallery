import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "btn outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary btn-md",
        destructive: "btn-destructive btn-md",
        outline: "btn-outline btn-md",
        secondary: "btn-outline-gold btn-md",
        ghost: "btn-ghost btn-md",
        link: "text-primary underline-offset-4 hover:underline bg-transparent border-none p-0 h-auto",
        gold: "btn-primary btn-md font-bold",
        "gold-outline": "btn-outline-gold btn-md",
        wallet: "btn-wallet btn-md",
        toggle: "btn-toggle btn-md",
        "toggle-active": "btn-toggle-active btn-md",
      },
      size: {
        default: "",
        sm: "btn-sm",
        lg: "btn-lg",
        icon: "btn-icon size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
