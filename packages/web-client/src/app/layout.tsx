"use client";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/lib/ReactQueryProvider";
import { DM_Sans } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import "./globals.css";

const dm = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  let title = "";
  switch (pathname) {
    case "/dashboard":
      title = "Dashboard";
      break;
    case "/organization":
      title = "Organization";
      break;
    case "/prompts":
      title = "Prompts";
      break;
    case "/sales":
      title = "Sales Managers";
      break;
    case "/practice":
      title = "Practice Call";
      break;
    case "/history":
      title = "Calls History";
      break;
    case "/funnel":
      title = "Funnel";
      break;
    default:
      title = "Refreshmint";
      break;
  }

  const path = usePathname();
  const excludePaths = ["/branch", "/login", "/register"];
  const shouldShowSidebarAndHeader = !excludePaths.includes(path);

  return (
    <ReactQueryClientProvider>
      <AuthProvider>
        <html lang="en" className="dark dark:bg-bgBlue">
          <head>
            <script src="https://sdk.cognicue.in/0.1.1/cognicue.min.js"></script>
          </head>
          <body className={dm.className}>
            {shouldShowSidebarAndHeader && (
              <div className="flex h-screen max-w-screen">
                <Sidebar />
                <div className="flex flex-col flex-1">
                  <Header title={title} />
                  <main className="flex-1 overflow-auto">{children}</main>
                  <Toaster />
                </div>
              </div>
            )}
            {!shouldShowSidebarAndHeader && (
              <div>
                <main>{children}</main>
              </div>
            )}
          </body>
        </html>
      </AuthProvider>
    </ReactQueryClientProvider>
  );
}
