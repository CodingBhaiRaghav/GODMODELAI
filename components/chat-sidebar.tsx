'use client'

import { useState } from 'react'
import { Bot, Sparkles, Zap, History, Settings, Plus, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export interface ModelOption {
  id: string
  name: string
  description: string
}

export interface Provider {
  id: string
  name: string
  icon: typeof Sparkles
  models: ModelOption[]
}

export const providers: Provider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: Sparkles,
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & efficient' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Balanced performance' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Lightweight & quick' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: Zap,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', description: 'Versatile powerhouse' },
      { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', description: 'Ultra-fast responses' },
      { id: 'llama-3.2-3b-preview', name: 'LLaMA 3.2 3B', description: 'Compact & efficient' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mixture of experts' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google open model' },
      { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', description: 'Advanced reasoning' },
    ],
  },
]

interface ChatSidebarProps {
  selectedProvider: string
  selectedModel: string
  onSelectModel: (provider: string, model: string) => void
  onNewChat: () => void
  onOpenSettings?: () => void
}

export function ChatSidebar({
  selectedProvider,
  selectedModel,
  onSelectModel,
  onNewChat,
  onOpenSettings,
}: ChatSidebarProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(selectedProvider)

  const toggleProvider = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId)
  }

  return (
    <aside className="w-72 sm:w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 pt-16 lg:pt-4">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-sm text-sidebar-foreground truncate">AI Chat Studio</h1>
          <p className="text-xs text-muted-foreground truncate">Developer Tools</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* New Chat Button */}
      <div className="p-3">
        <Button 
          onClick={onNewChat}
          variant="outline" 
          className="w-full justify-start gap-2 bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="truncate">New Chat</span>
        </Button>
      </div>

      {/* Model Selection */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
            Model Selection
          </span>
        </div>

        <div className="space-y-2">
          {providers.map((provider) => {
            const Icon = provider.icon
            const isExpanded = expandedProvider === provider.id
            const isProviderSelected = selectedProvider === provider.id
            const selectedModelInfo = provider.models.find(m => m.id === selectedModel)

            return (
              <div key={provider.id} className="rounded-lg overflow-hidden">
                {/* Provider Header */}
                <button
                  onClick={() => toggleProvider(provider.id)}
                  className={cn(
                    'w-full p-3 text-left transition-all duration-150 flex items-center gap-3',
                    'hover:bg-sidebar-accent',
                    isProviderSelected && !isExpanded
                      ? 'bg-sidebar-accent ring-1 ring-accent/50'
                      : 'bg-transparent'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0',
                    isProviderSelected 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium text-sm truncate',
                        isProviderSelected ? 'text-sidebar-foreground' : 'text-muted-foreground'
                      )}>
                        {provider.name}
                      </span>
                      {isProviderSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      )}
                    </div>
                    {isProviderSelected && selectedModelInfo && !isExpanded && (
                      <span className="text-xs text-muted-foreground font-mono truncate block">
                        {selectedModelInfo.name}
                      </span>
                    )}
                  </div>

                  <ChevronDown className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform shrink-0',
                    isExpanded && 'rotate-180'
                  )} />
                </button>

                {/* Model List */}
                {isExpanded && (
                  <div className="bg-sidebar-accent/50 py-1">
                    {provider.models.map((model) => {
                      const isModelSelected = selectedProvider === provider.id && selectedModel === model.id

                      return (
                        <button
                          key={model.id}
                          onClick={() => onSelectModel(provider.id, model.id)}
                          className={cn(
                            'w-full px-4 py-2.5 text-left transition-all duration-100',
                            'hover:bg-sidebar-accent flex items-center gap-3',
                            isModelSelected && 'bg-sidebar-accent'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded border flex items-center justify-center shrink-0',
                            isModelSelected 
                              ? 'bg-accent border-accent' 
                              : 'border-sidebar-border bg-transparent'
                          )}>
                            {isModelSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              'text-sm block truncate',
                              isModelSelected ? 'text-sidebar-foreground font-medium' : 'text-muted-foreground'
                            )}>
                              {model.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate block">
                              {model.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <button className="w-full p-2 rounded-lg text-left flex items-center gap-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <History className="w-4 h-4 shrink-0" />
          <span className="text-sm truncate">History</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full p-2 rounded-lg text-left flex items-center gap-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="text-sm truncate">API Keys</span>
        </button>
      </div>

      {/* Version */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground font-mono">v1.0.0</p>
      </div>
    </aside>
  )
}
