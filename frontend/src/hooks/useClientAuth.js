"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth";

export function useClientAuth() {
  const [auth, setAuth] = useState({
    user: null,
    role: null,
    ready: false,
  });

  useEffect(() => {
    const user = getStoredUser();
    setAuth({
      user,
      role: user?.role ?? null,
      ready: true,
    });
  }, []);

  function hasRole(...roles) {
    return auth.role ? roles.includes(auth.role) : false;
  }

  return {
    user: auth.user,
    role: auth.role,
    ready: auth.ready,
    isAdmin: auth.role === "admin",
    isPm: auth.role === "pm",
    isMember: auth.role === "member",
    hasRole,
  };
}
