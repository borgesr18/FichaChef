'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import GlobalSearch from '@/components/ui/GlobalSearch'
import WorkflowPanel from '@/components/ui/WorkflowPanel'
import { WorkflowProvider } from '@/components/providers/WorkflowProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [workflowPanelOpen, setWorkflowPanelOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useKeyboardShortcuts({
    onGlobalSearch: () => setGlobalSearchOpen(true),
    onToggleFavorites: () => setWorkflowPanelOpen(!workflowPanelOpen)
  })

  return (
    <WorkflowProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <Header 
          onGlobalSearch={() => setGlobalSearchOpen(true)}
          onToggleWorkflow={() => setWorkflowPanelOpen(!workflowPanelOpen)}
        />
        <main className="lg:ml-64 pt-16">
          <div className="p-4 lg:p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
        
        <GlobalSearch 
          isOpen={globalSearchOpen} 
          onClose={() => setGlobalSearchOpen(false)} 
        />
        <WorkflowPanel 
          isOpen={workflowPanelOpen} 
          onClose={() => setWorkflowPanelOpen(false)} 
        />
      </div>
    </WorkflowProvider>
  )
}
