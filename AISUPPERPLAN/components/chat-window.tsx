'use client'

import { useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessage, TypingIndicator } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { Bot, Sparkles, Zap } from 'lucide-react'
import { providers } from '@/components/chat-sidebar'

interface ChatWindowProps {
  selectedProvider: string
  selectedModel: string
  onToggleSidebar?: () => void
}

const providerIcons: Record<string, typeof Sparkles> = {
  google: Sparkles,
  groq: Zap,
}

export function ChatWindow({ selectedProvider, selectedModel, onToggleSidebar }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const provider = providers.find(p => p.id === selectedProvider)
  const modelInfo = provider?.models.find(m => m.id === selectedModel)
  const ModelIcon = providerIcons[selectedProvider] || Sparkles

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: { provider: selectedProvider, model: selectedModel },
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Reset messages when model changes
  useEffect(() => {
    setMessages([])
  }, [selectedProvider, selectedModel, setMessages])

  const handleSend = (text: string) => {
    sendMessage({ text }, { body: { provider: selectedProvider, model: selectedModel } })
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background w-full">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-background">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <ModelIcon className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="font-medium text-sm truncate">{modelInfo?.name || 'Select a model'}</h2>
            <p className="text-xs text-muted-foreground truncate">
              {provider?.name} &middot; {modelInfo?.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            {isLoading ? 'Generating...' : 'Ready'}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6"
      >
        <div className="max-w-3xl mx-auto py-6">
          {messages.length === 0 ? (
            <EmptyState 
              modelName={modelInfo?.name || 'AI'} 
              providerName={provider?.name || ''} 
              onSuggestionClick={handleSend}
            />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && status === 'submitted' && <TypingIndicator />}
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput 
        onSend={handleSend} 
        isLoading={isLoading}
        placeholder={`Message ${modelInfo?.name || 'AI'}...`}
      />
    </div>
  )
}

function EmptyState({ 
  modelName, 
  providerName,
  onSuggestionClick 
}: { 
  modelName: string
  providerName: string
  onSuggestionClick: (text: string) => void
}) {
  const suggestions = [
    'Explain quantum computing in simple terms',
    'Write a Python function for binary search',
    'What are the best practices for REST APIs?',
    'Help me debug this code snippet',
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 sm:mb-6">
        <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 text-center px-4">Start a conversation</h3>
      <p className="text-muted-foreground text-xs sm:text-sm text-center max-w-md mb-6 sm:mb-8 px-4">
        You&apos;re chatting with <span className="font-mono text-accent">{modelName}</span> via {providerName}. 
        Ask anything to get started.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-lg px-4">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-border bg-card text-left text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
