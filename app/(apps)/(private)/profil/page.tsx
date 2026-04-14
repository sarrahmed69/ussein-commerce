"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ProfilRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/user/profil"); }, []);
  return null;
}