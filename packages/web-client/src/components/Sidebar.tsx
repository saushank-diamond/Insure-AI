"use client";
import { useAuthenticationGetMe } from "@/api/authentication/authentication";
import { User } from "@/api/schemas/user";
import {
  CallsIcon,
  DashboardIcon,
  FunnelIcon,
  OrgIcon,
  PromptsIcon,
  ReportsIcon,
} from "@/components/ui/icons";
import Logo from "@/components/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const { data, error } = useAuthenticationGetMe<User>();
  const isAdmin = data?.role === "admin" ? true : false;
  const pathname = usePathname();
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="border-r border-borderBlue bg-gray-100/40 md:block h-full">
      <div className="flex h-full flex-col gap-2 dark:bg-otherBlue">
        <div className="flex h-14 justify-center items-center border-b border-borderBlue px-4 lg:h-[60px] lg:px-6">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <nav className="grid items-start px-2 text-sm lg:px-4 overflow-hidden">
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                isActive("/dashboard")
                  ? "dark:bg-buttonGray dark:text-white"
                  : "text-white"
              } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
              href="/dashboard"
            >
              <DashboardIcon /> Dashboard
            </Link>
            {isAdmin && (
              <Link
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                  isActive("/prompts")
                    ? "dark:bg-buttonGray dark:text-white"
                    : "text-gray-500"
                } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
                href="/prompts"
              >
                <PromptsIcon /> Prompts
              </Link>
            )}
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                isActive("/funnel")
                  ? "dark:bg-buttonGray dark:text-white"
                  : "text-white"
              } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
              href="/funnel"
            >
              <FunnelIcon /> Funnel
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                isActive("/organization")
                  ? "dark:bg-buttonGray dark:text-white"
                  : "text-white"
              } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
              href="/organization"
            >
              <OrgIcon /> Organization
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                isActive("/practice")
                  ? "dark:bg-buttonGray dark:text-white"
                  : "text-gray-500"
              } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
              href="/practice"
            >
              <CallsIcon /> Practice Call
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-dm ${
                isActive("/history")
                  ? "dark:bg-buttonGray dark:text-white"
                  : "text-gray-500"
              } transition-all hover:text-gray-900 dark:text-white dark:hover:text-gray-50`}
              href="/history"
            >
              <ReportsIcon /> Calls History
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
