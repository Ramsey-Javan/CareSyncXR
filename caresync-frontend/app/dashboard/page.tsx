"use client";

import { useEffect, useState } from "react";
import { getRoleWelcome } from "@/lib/personalization";
import { getUser } from "@/lib/auth.utils";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  // ✅ THIS is where localStorage must be used
  useEffect(() => {
    const storedUser = getUser(); // safe wrapper around localStorage
    setUser(storedUser);
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-slate-500">
        Loading your care space...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">
        {getRoleWelcome(user.role, user.fullName)}
      </h1>
    </div>
  );
}