"use client";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationButton() {
  return (
    <Link href="/notifications" className="p-2 rounded-md hover:bg-gray-700 relative">
      <Bell className="h-5 w-5 text-gray-400" />
      {/* Badge placeholder */}
      <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500" />
    </Link>
  );
}
