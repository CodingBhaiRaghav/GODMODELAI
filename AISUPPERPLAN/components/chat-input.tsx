'use client'

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Send, Paperclip, Code2, Mic, MicOff, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function ChatInput({ onSend, isLoading, placeholder = 'Send a message...' }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }

      if (finalTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript)
        setInterimTranscript('')
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setInterimTranscript('')
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    return recognition
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return

    const recognition = initRecognition()
    if (recognition) {
      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
      }
    }
  }, [isSupported, isListening, initRecognition])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input, interimTranscript])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    if (isListening) stopListening()
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const displayValue = input + (interimTranscript ? (input ? ' ' : '') + interimTranscript : '')

  return (
    <div className="border-t border-border bg-background p-3 sm:p-4">
      <div className="max-w-3xl mx-auto">
        <div className={cn(
          "relative flex items-end gap-1 sm:gap-2 bg-card border rounded-xl p-1.5 sm:p-2 transition-colors",
          isListening ? "border-red-500/50 bg-red-500/5" : "border-border"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => {
              setInput(e.target.value)
              setInterimTranscript('')
            }}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : placeholder}
            disabled={isLoading}
            className={cn(
              'flex-1 min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground text-sm py-2 px-2 sm:px-0',
              isListening && 'placeholder:text-red-400'
            )}
            rows={1}
          />

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <Code2 className="w-4 h-4" />
            </Button>

            {isSupported && (
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-lg transition-all',
                  isListening 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 animate-pulse' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                'h-8 w-8 sm:h-8 sm:w-8 rounded-lg transition-all',
                input.trim() && !isLoading
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-2">
          <div className="hidden sm:flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd>
              {' '}to send
            </p>
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording...
              </span>
            )}
          </div>
          <div className="flex sm:hidden">
            {isListening && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording...
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {input.length} chars
          </p>
        </div>
      </div>
    </div>
  )
}
