"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  List,
  Wallet,
  Newspaper,
  BarChart2,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

import SidebarNavItem from "./SidebarNavItem";
import SidebarToggle from "./SidebarToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
    setMounted(true);
  }, []);

  // Save collapse state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", collapsed.toString());
    }
  }, [collapsed, mounted]);

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
    },
    {
      href: "/watchlist",
      icon: List,
      label: "Watchlist",
    },
    {
      href: "/portfolio",
      icon: Wallet,
      label: "Portfolio",
    },
    {
      href: "/market-news",
      icon: Newspaper,
      label: "Market News",
    },
    {
      href: "/earnings",
      icon: BarChart2,
      label: "Earnings",
    },
    {
      href: "/screener",
      icon: SlidersHorizontal,
      label: "Stock Screener",
      premium: true,
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <aside
      className={`
        sticky top-0 z-40 flex h-screen shrink-0 flex-col
        border-r border-blue-900/30
        bg-slate-950
        transition-[width] duration-200 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[220px]"}
      `}
    >
      {/* Brand */}
      <div
        className={`
          flex h-[72px] shrink-0 items-center border-b border-blue-900/30
          ${collapsed ? "justify-center px-2" : "justify-between px-4"}
        `}
      >
        <div
          className={`
            flex min-w-0 items-center
            ${collapsed ? "justify-center" : "gap-2.5"}
          `}
        >
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist"
            width={34}
            height={34}
            priority
            className="h-8 w-8 shrink-0"
          />

          {!collapsed && (
            <span className="truncate text-lg font-bold tracking-tight text-white">
              Signalist
            </span>
          )}
        </div>

        {!collapsed && (
          <SidebarToggle
            onToggle={() => setCollapsed((value) => !value)}
          />
        )}

        {collapsed && (
          <div className="absolute right-[-14px] top-5">
            <SidebarToggle
              onToggle={() => setCollapsed((value) => !value)}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={active}
                collapsed={collapsed}
                premium={item.premium}
              />
            );
          })}
        </div>
      </nav>

      {/* Bottom brand/status area */}
      {!collapsed && (
        <div className="border-t border-blue-900/30 p-3">
          <div className="rounded-xl bg-slate-900/50 px-3 py-2.5">
            <p className="text-xs font-medium text-slate-100">
              Signalist
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Market intelligence workspace
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}