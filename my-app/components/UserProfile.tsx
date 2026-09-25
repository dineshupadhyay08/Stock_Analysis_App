"use client";
import UserDropDown from "./UserDropDown";

export default function UserProfile({ user }: { user?: any }) {
  return <UserDropDown user={user} initialStocks={[]} />;
}
