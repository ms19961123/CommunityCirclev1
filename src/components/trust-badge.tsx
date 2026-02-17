import { Shield, ShieldCheck, Mail, Phone, IdCardIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  trustScore: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  size?: "sm" | "md";
}

export function TrustBadge({
  trustScore,
  emailVerified,
  phoneVerified,
  idVerified,
  size = "md",
}: TrustBadgeProps) {
  const isSmall = size === "sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Trust Score */}
      {trustScore > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="teal"
              className={cn(
                "gap-1",
                isSmall && "px-1.5 py-0"
              )}
            >
              {trustScore >= 80 ? (
                <ShieldCheck className={cn("shrink-0", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
              ) : (
                <Shield className={cn("shrink-0", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
              )}
              {!isSmall && (
                <span className="text-xs">{trustScore}</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Trust Score: {trustScore}/100</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Email Verified */}
      {emailVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="teal"
              className={cn(
                "gap-1",
                isSmall && "px-1.5 py-0"
              )}
            >
              <Mail className={cn("shrink-0", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
              {!isSmall && (
                <span className="text-xs">Email Verified</span>
              )}
            </Badge>
          </TooltipTrigger>
          {isSmall && (
            <TooltipContent>
              <p>Email Verified</p>
            </TooltipContent>
          )}
        </Tooltip>
      )}

      {/* Phone Verified */}
      {phoneVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="sunny"
              className={cn(
                "gap-1",
                isSmall && "px-1.5 py-0"
              )}
            >
              <Phone className={cn("shrink-0", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
              {!isSmall && (
                <span className="text-xs">Phone Verified</span>
              )}
            </Badge>
          </TooltipTrigger>
          {isSmall && (
            <TooltipContent>
              <p>Phone Verified</p>
            </TooltipContent>
          )}
        </Tooltip>
      )}

      {/* ID Verified (Coming Soon) */}
      {idVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 opacity-60",
                isSmall && "px-1.5 py-0"
              )}
            >
              <IdCardIcon className={cn("shrink-0", isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
              {!isSmall && (
                <span className="text-xs">ID Verified (Coming Soon)</span>
              )}
            </Badge>
          </TooltipTrigger>
          {isSmall && (
            <TooltipContent>
              <p>ID Verified (Coming Soon)</p>
            </TooltipContent>
          )}
        </Tooltip>
      )}
    </div>
  );
}
