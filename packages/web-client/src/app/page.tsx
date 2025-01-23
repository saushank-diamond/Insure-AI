"use client";
import { AuthProvider } from "@/components/AuthProvider";
import { ReactQueryClientProvider } from "@/lib/ReactQueryProvider";

export default function Home() {
  return (
    <ReactQueryClientProvider>
      <AuthProvider>
        <main className="dark dark:bg-bgBlue"></main>
      </AuthProvider>
    </ReactQueryClientProvider>
  );
}
