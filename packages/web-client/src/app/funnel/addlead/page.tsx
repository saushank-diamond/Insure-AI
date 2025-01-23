"use client";
import { BackIcon } from "@/components/ui/icons";
import Link from "next/link";

import dynamic from "next/dynamic";

const AddSuspectForm = dynamic(() => import("@/components/AddSuspectForm"), {
  ssr: false,
});

export default function AddSuspect() {
  return (
    <>
      <main className="dark">
        <div className="grid min-h-screen">
          <div className="flex flex-col dark:bg-bgBlue relative">
            <div className="flex flex-row items-center ml-5 mt-2 max-w-full">
              <Link href="/funnel">
                <button className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle">
                  <BackIcon />
                </button>
              </Link>
              <span className="text-base dark:text-white ml-2 mr-96 whitespace-nowrap">
                Create Lead Profile
              </span>
            </div>
            <div className="flex flex-col">
              <AddSuspectForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
