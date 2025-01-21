import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat-history'
import { auth } from '@/auth'

export async function SidebarDesktop() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px] right-0">
      <ChatHistory userId={session.user.id} />
    </Sidebar>
  )
}
