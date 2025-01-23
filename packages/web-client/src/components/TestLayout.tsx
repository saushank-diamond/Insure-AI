import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface Props {
    children: ReactNode
}

const TestLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[200px_1fr]">
        <Sidebar />
        <div className="flex flex-col dark:bg-bgBlue">
          <Header title="Landing Page"/>
          {children}
        </div>
      </div>
    </>
  );
}

export default TestLayout;