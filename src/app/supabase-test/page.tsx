"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("Checking Supabase connection...");

  useEffect(() => {
    async function checkConnection() {
      const supabase = createClient();

      const { error } = await supabase.auth.getSession();

      if (error) {
        setStatus(`Supabase connected, but auth check failed: ${error.message}`);
        return;
      }

      setStatus("Supabase connected successfully.");
    }

    checkConnection();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-semibold">Supabase Test</h1>
      <p className="mt-6 text-slate-300">{status}</p>
    </main>
  );
}