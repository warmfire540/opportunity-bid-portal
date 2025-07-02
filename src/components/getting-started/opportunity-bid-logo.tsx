import { Target } from "lucide-react";

import { cn } from "@lib/utils";

type Props = {
  size?: "sm" | "lg";
  className?: string;
  logoOnly?: boolean;
};

const Logo = ({ size = "sm", className, logoOnly = false }: Props) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        {
          "gap-x-3 md:gap-x-4": size === "lg",
          "gap-x-1 md:gap-x-2": size === "sm",
        },
        className
      )}
    >
      <div
        className={cn({
          "h-8 w-8 md:h-10 md:w-10": size === "lg",
          "h-6 w-6 md:h-8 md:w-8": size === "sm",
        })}
      >
        <Target className="h-full w-full text-primary" />
      </div>
      {!logoOnly && (
        <h1
          className={cn("font-semibold", {
            "text-2xl md:text-4xl": size === "lg",
            "text-lg md:text-xl": size === "sm",
          })}
        >
          Opportunity Bid Portal
        </h1>
      )}
    </div>
  );
};

export default Logo;
