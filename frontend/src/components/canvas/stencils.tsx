import type { ComponentType } from "react";
import {
  ApiIcon,
  FlashIcon,
  BucketIcon,
  CloudIcon,
  CpuIcon,
  Database01Icon,
  ComputerIcon,
  SquareLock02Icon,
  BubbleChatIcon,
  DistributionIcon,
  Search01Icon,
  ServerStack01Icon,
  CloudServerIcon,
  Layers01Icon,
  UserMultipleIcon,
  WebhookIcon,
  GlobeIcon,
} from "hugeicons-react";

/** A Hugeicons component, accepting the props we use on the canvas. */
export type StencilIcon = ComponentType<{
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
}>;

export type ComponentVariant =
  | "client"
  | "users"
  | "apigateway"
  | "loadbalancer"
  | "server"
  | "service"
  | "database"
  | "cache"
  | "queue"
  | "messagebroker"
  | "cdn"
  | "storage"
  | "search"
  | "webhook"
  | "auth"
  | "worker";

export interface Stencil {
  variant: ComponentVariant;
  label: string;
  icon: StencilIcon;
  color: string;
}

export const STENCILS: Stencil[] = [
  { variant: "client", label: "Client", icon: ComputerIcon, color: "#64748b"},
  { variant: "users", label: "Users", icon: UserMultipleIcon, color: "#64748b"},
  { variant: "apigateway", label: "API Gateway", icon: ApiIcon, color: "#0d9488" },
  { variant: "loadbalancer", label: "Load Balancer", icon: DistributionIcon, color: "#0891b2" },
  { variant: "server", label: "Server", icon: ServerStack01Icon, color: "#0d9488" },
  { variant: "service", label: "Service", icon: CloudServerIcon, color: "#6366f1" },
  { variant: "worker", label: "Worker", icon: CpuIcon, color: "#6366f1" },
  { variant: "database", label: "Database", icon: Database01Icon, color: "#0f766e" },
  { variant: "cache", label: "Cache", icon: FlashIcon, color: "#d97706" },
  { variant: "queue", label: "Queue", icon: Layers01Icon, color: "#6366f1" },
  { variant: "messagebroker", label: "Message Broker", icon: BubbleChatIcon, color: "#6366f1" },
  { variant: "cdn", label: "CDN", icon: GlobeIcon, color: "#0891b2" },
  { variant: "storage", label: "Object Store", icon: BucketIcon, color: "#0f766e" },
  { variant: "search", label: "Search", icon: Search01Icon, color: "#d97706" },
  { variant: "webhook", label: "Webhook", icon: WebhookIcon, color: "#f43f5e" },
  { variant: "auth", label: "Auth", icon: SquareLock02Icon, color: "#f43f5e" },
];

export const STENCIL_MAP: Record<ComponentVariant, Stencil> = Object.fromEntries(
  STENCILS.map((s) => [s.variant, s]),
) as Record<ComponentVariant, Stencil>;

export const FALLBACK_STENCIL: Stencil = {
  variant: "service",
  label: "Component",
  icon: CloudIcon,
  color: "#0d9488",
};

export function stencilFor(variant: string | undefined): Stencil {
  if (variant && variant in STENCIL_MAP) {
    return STENCIL_MAP[variant as ComponentVariant];
  }
  return FALLBACK_STENCIL;
}

export const COMPONENT_W = 132;
export const COMPONENT_H = 84;
