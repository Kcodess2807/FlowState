import { useState, type ReactNode } from "react";
import { ArrowDown01Icon } from "hugeicons-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("divide-y divide-hairline rounded-lg border border-hairline bg-elevated", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-ink hover:bg-ink/[0.04]"
            >
              <span>{item.title}</span>
              <ArrowDown01Icon
                size={18}
                className={cn(
                  "shrink-0 text-ink-faint transition-transform duration-200",
                  open && "rotate-180 text-accent",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm leading-relaxed text-ink-muted">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
