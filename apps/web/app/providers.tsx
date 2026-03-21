'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

type PostHogProviderProps = {
  children: React.ReactNode
}

let hasInitialized = false

export function CSPostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    if (hasInitialized) {
      return
    }

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) {
      return
    }

    posthog.init(key, {
      api_host: '/ingest',
      ui_host: host,
      defaults: '2026-01-30',
      capture_pageview: true,
      capture_pageleave: true,
    })

    hasInitialized = true
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
