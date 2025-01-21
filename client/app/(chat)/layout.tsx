import { SidebarDesktop } from '@/components/sidebar-desktop'
import  PersonaSidebar  from '@/components/persona-sidebar'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-250 peer-[[data-state=open]]:xl:pl-[300px]">
        <div className="flex justify-center h-full w-full">
          <div className="max-w-2xl w-full px-4 mr-[250px]">
            {children}
          </div>
        </div>
      </div>
      <PersonaSidebar />
    </div>
  )
}
