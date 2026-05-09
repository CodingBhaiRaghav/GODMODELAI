'use client'

import { useState } from 'react'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatWindow } from '@/components/chat-window'
import { ApiKeysModal } from '@/components/api-keys-modal'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  const [selectedProvider, setSelectedProvider] = useState('google')
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [chatKey, setChatKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKeysModalOpen, setApiKeysModalOpen] = useState(false)

  const handleSelectModel = (provider: string, model: string) => {
    setSelectedProvider(provider)
    setSelectedModel(model)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-10 w-10 bg-sidebar border border-sidebar-border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:relative z-40 h-screen transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <ChatSidebar
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          onNewChat={handleNewChat}
          onOpenSettings={() => setApiKeysModalOpen(true)}
        />
      </div>

      {/* Chat Window */}
      <ChatWindow
        key={chatKey}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      {/* API Keys Modal */}
      <ApiKeysModal
        open={apiKeysModalOpen}
        onOpenChange={setApiKeysModalOpen}
        onKeysSaved={() => {
          setChatKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}
