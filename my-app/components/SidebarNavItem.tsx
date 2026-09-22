"use client";
import Link from "next/link";
import React from "react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  premium?: boolean;
};

export default function SidebarNavItem({ href, icon: Icon, label, active, collapsed }: Props) {
  const pathname = usePathname();
  const isActive = active ?? pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded transition-all duration-200
        ${
          isActive
            ? "bg-blue-500/20 text-blue-300"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </Link>
  );
}