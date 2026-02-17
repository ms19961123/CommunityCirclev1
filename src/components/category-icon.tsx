import {
  TreePine,
  Sun,
  BookOpen,
  Palette,
  Trophy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EventCategory =
  | "WALK"
  | "PLAYGROUND"
  | "LIBRARY"
  | "CRAFTS"
  | "SPORTS"
  | "OTHER";

export interface CategoryConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

export const categoryConfig: Record<EventCategory, CategoryConfig> = {
  WALK: {
    icon: TreePine,
    label: "Walk",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  PLAYGROUND: {
    icon: Sun,
    label: "Playground",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/40",
  },
  LIBRARY: {
    icon: BookOpen,
    label: "Library",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  CRAFTS: {
    icon: Palette,
    label: "Crafts",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
  },
  SPORTS: {
    icon: Trophy,
    label: "Sports",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/40",
  },
  OTHER: {
    icon: Sparkles,
    label: "Other",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/40",
  },
};

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const config =
    categoryConfig[category as EventCategory] ?? categoryConfig.OTHER;
  const Icon = config.icon;

  return <Icon className={cn("h-5 w-5", config.color, className)} />;
}
