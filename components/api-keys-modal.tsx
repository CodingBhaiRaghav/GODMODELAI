'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { getApiKeys, saveApiKeys, getOrCreateSessionId } from '@/lib/supabase-client'

interface ApiKeysModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeysSaved?: () => void
}

export function ApiKeysModal({ open, onOpenChange, onKeysSaved }: ApiKeysModalProps) {
  const [groqKey, setGroqKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [showGoogleKey, setShowGoogleKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [groqStatus, setGroqStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const initializeKeys = async () => {
      const id = await getOrCreateSessionId()
      setSessionId(id)
      const keys = await getApiKeys(id)
      if (keys.groq_api_key) setGroqKey(keys.groq_api_key)
      if (keys.google_api_key) setGoogleKey(keys.google_api_key)
    }
    initializeKeys()
  }, [])

  const testGroqKey = async (key: string) => {
    if (!key) {
      setGroqStatus('invalid')
      return false
    }

    try {
      setValidating(true)
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'groq', apiKey: key }),
      })

      if (response.ok) {
        setGroqStatus('valid')
        return true
      } else {
        setGroqStatus('invalid')
        return false
      }
    } catch (error) {
      console.error('Error testing Groq key:', error)
      setGroqStatus('invalid')
      return false
    } finally {
      setValidating(false)
    }
  }

  const testGoogleKey = async (key: string) => {
    if (!key) {
      setGoogleStatus('invalid')
      return false
    }

    try {
      setValidating(true)
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', apiKey: key }),
      })

      if (response.ok) {
        setGoogleStatus('valid')
        return true
      } else {
        setGoogleStatus('invalid')
        return false
      }
    } catch (error) {
      console.error('Error testing Google key:', error)
      setGoogleStatus('invalid')
      return false
    } finally {
      setValidating(false)
    }
  }

  const handleSave = async () => {
    if (!groqKey && !googleKey) {
      alert('Please enter at least one API key')
      return
    }

    setLoading(true)
    try {
      await saveApiKeys(sessionId, groqKey || null, googleKey || null)
      onKeysSaved?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving API keys:', error)
      alert('Failed to save API keys. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Keys Configuration</DialogTitle>
          <DialogDescription>
            Enter your API keys to use with the chat application. Keys are stored locally and never shared.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Groq API Key */}
          <div className="space-y-2">
            <Label htmlFor="groq-key" className="text-sm font-medium">
              Groq API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="groq-key"
                  type={showGroqKey ? 'text' : 'password'}
                  placeholder="Enter your Groq API key"
                  value={groqKey}
                  onChange={(e) => {
                    setGroqKey(e.target.value)
                    setGroqStatus('idle')
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showGroqKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testGroqKey(groqKey)}
                disabled={!groqKey || validating}
              >
                {validating ? <Spinner className="h-4 w-4" /> : 'Test'}
              </Button>
            </div>
            {groqStatus === 'valid' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 size={16} />
                Key validated successfully
              </div>
            )}
            {groqStatus === 'invalid' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                Invalid API key
              </div>
            )}
            <p className="text-xs text-gray-500">
              Get your key at{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.groq.com/keys
              </a>
            </p>
          </div>

          {/* Google API Key */}
          <div className="space-y-2">
            <Label htmlFor="google-key" className="text-sm font-medium">
              Google Gemini API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="google-key"
                  type={showGoogleKey ? 'text' : 'password'}
                  placeholder="Enter your Google API key"
                  value={googleKey}
                  onChange={(e) => {
                    setGoogleKey(e.target.value)
                    setGoogleStatus('idle')
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showGoogleKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testGoogleKey(googleKey)}
                disabled={!googleKey || validating}
              >
                {validating ? <Spinner className="h-4 w-4" /> : 'Test'}
              </Button>
            </div>
            {googleStatus === 'valid' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 size={16} />
                Key validated successfully
              </div>
            )}
            {googleStatus === 'invalid' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                Invalid API key
              </div>
            )}
            <p className="text-xs text-gray-500">
              Get your key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                aistudio.google.com/app/apikey
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || (!groqKey && !googleKey)}>
            {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
            Save Keys
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
