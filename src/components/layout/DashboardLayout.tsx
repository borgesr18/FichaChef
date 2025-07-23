'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import GlobalSearch from '@/components/ui/GlobalSearch'
import WorkflowPanel from '@/components/ui/WorkflowPanel'
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt'
import OfflineIndicator from '@/components/ui/OfflineIndicator'
import { WorkflowProvider } from '@/components/providers/WorkflowProvider'
import { PWAProvider } from '@/components/providers/PWAProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useProfileInterface } from '@/hooks/useProfileInterface'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [workflowPanelOpen, setWorkflowPanelOpen] = useState(false)
  const { config, getColorClasses } = useProfileInterface()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useKeyboardShortcuts({
    onGlobalSearch: () => setGlobalSearchOpen(true),
    onToggleFavorites: () => setWorkflowPanelOpen(!workflowPanelOpen)
  })

  return (
    <PWAProvider>
      <WorkflowProvider>
        <div className={`min-h-screen ${getColorClasses('background')}`}>
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <Header 
            onGlobalSearch={() => setGlobalSearchOpen(true)}
            onToggleWorkflow={() => setWorkflowPanelOpen(!workflowPanelOpen)}
          />
          <main className={`pt-16 transition-all duration-300 ${config?.compactMode ? 'lg:ml-56' : 'lg:ml-64'}`}>
            <div className={`${config?.compactMode ? 'p-3 lg:p-4' : 'p-4 lg:p-6'}`}>
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
          <PWAInstallPrompt />
          <OfflineIndicator />
        </div>
      </WorkflowProvider>
    </PWAProvider>
  )
}
