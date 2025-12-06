import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

function AppLayoutContent() {
  const { isExpanded } = useSidebar()
  
  return (
    <div className="min-h-screen bg-[#FFFDF6]">
      <Navbar />
      <div className="flex pt-[60px] md:pt-20">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 px-4 md:px-6 lg:px-8 py-8 max-w-[1440px] mx-auto w-full pb-20 md:pb-8 transition-all duration-300",
            isExpanded ? "md:ml-[220px]" : "md:ml-[72px]"
          )}
        >
          <div className="space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  )
}

