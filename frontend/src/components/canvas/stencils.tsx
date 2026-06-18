import {
  IconApi,
  IconBolt,
  IconBucket,
  IconCloud,
  IconCpu,
  IconDatabase,
  IconDeviceDesktop,
  IconLock,
  IconMessage2,
  IconRouter,
  IconSearch,
  IconServer,
  IconServer2,
  IconStack2,
  IconUsers,
  IconWebhook,
  IconWorldWww,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

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
  icon: Icon;
  color: string;
}

export const STENCILS: Stencil[] = [
  { variant: "client", label: "Client", icon: IconDeviceDesktop, color: "#475569" },
  { variant: "users", label: "Users", icon: IconUsers, color: "#475569" },
  { variant: "apigateway", label: "API Gateway", icon: IconApi, color: "#0d9488" },
  { variant: "loadbalancer", label: "Load Balancer", icon: IconRouter, color: "#0891b2" },
  { variant: "server", label: "Server", icon: IconServer, color: "#0d9488" },
  { variant: "service", label: "Service", icon: IconServer2, color: "#6366f1" },
  { variant: "worker", label: "Worker", icon: IconCpu, color: "#6366f1" },
  { variant: "database", label: "Database", icon: IconDatabase, color: "#0f766e" },
  { variant: "cache", label: "Cache", icon: IconBolt, color: "#f59e0b" },
  { variant: "queue", label: "Queue", icon: IconStack2, color: "#6366f1" },
  { variant: "messagebroker", label: "Message Broker", icon: IconMessage2, color: "#6366f1" },
  { variant: "cdn", label: "CDN", icon: IconWorldWww, color: "#0891b2" },
  { variant: "storage", label: "Object Store", icon: IconBucket, color: "#0f766e" },
  { variant: "search", label: "Search", icon: IconSearch, color: "#f59e0b" },
  { variant: "webhook", label: "Webhook", icon: IconWebhook, color: "#f43f5e" },
  { variant: "auth", label: "Auth", icon: IconLock, color: "#f43f5e" },
];

export const STENCIL_MAP: Record<ComponentVariant, Stencil> = Object.fromEntries(
  STENCILS.map((s) => [s.variant, s]),
) as Record<ComponentVariant, Stencil>;

export const FALLBACK_STENCIL: Stencil = {
  variant: "service",
  label: "Component",
  icon: IconCloud,
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
