"use client";
import { useState } from "react";
import { Menu } from "lucide-react";

type Props = {
  onToggle: () => void;
};

export default function SidebarToggle({ onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-2 rounded-md hover:bg-gray-700"
    >
      <Menu className="h-5 w-5 text-gray-400" />
    </button>
  );
}
