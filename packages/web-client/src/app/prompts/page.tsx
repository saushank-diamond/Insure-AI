"use client";
import PromptsTable from "@/components/PromptsTable";

const Prompts = () => {
  return (
    <main className="dark dark:bg-bgBlue">
      <div className="grid min-h-screen">
        <div className="flex flex-col dark:bg-bgBlue relative">
          <PromptsTable />
        </div>
      </div>
    </main>
  );
};

export default Prompts;
