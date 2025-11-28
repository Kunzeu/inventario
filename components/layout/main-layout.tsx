'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 overflow-y-auto bg-gray-900">
            <Sidebar />
          </div>
        </div>
      )}

      <main className="flex-1 bg-gray-50 p-4 md:p-8 min-w-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        {children}
      </main>
    </div>
  )
}

