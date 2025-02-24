'use client'
import './globals.css'
import './atom-one-dark.css'

import { CacheProvider } from '@chakra-ui/next-js'
import { Onboarding } from '@core/components/Onboarding'
import SplashScreen from '@core/components/SplashScreen'
import { MirrorfulThemeProvider } from '@core/components/ThemeProvider'
import useMirrorfulStore, {
  MirrorfulState,
} from '@core/store/useMirrorfulStore'
import { defaultShadowsV2, TMirrorfulStore } from '@core/types'
import { LayoutWrapper } from '@web/components/LayoutWrapper'
import { useFetchStoreData } from '@web/hooks/useFetchStoreData'
import { usePostStoreData } from '@web/hooks/usePostStoreData'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useCallback, useEffect, useRef, useState } from 'react'

if (typeof window !== 'undefined') {
  // This ensures that as long as we are client-side, posthog is always ready
  posthog.init('phc_Fi1SAV5Xhkmrf5VwIweTTmZDNnUIWmXkvXr7naLsNVV', {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
    },
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldForceSkipOnboarding, setShouldForceSkipOnboarding] =
    useState(false)
  const [showOnBoarding, setShowOnBoarding] = useState(false)
  const router = useRouter()

  const { setColors, setTypography, setShadows, setFileTypes } =
    useMirrorfulStore((state: MirrorfulState) => state)

  const [fetchStoreData] = useFetchStoreData()
  const [postStoreData] = usePostStoreData()

  // to fetch data
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const fetchStoredData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchStoreData()
      if (
        !data ||
        Object.keys(data).length === 0 ||
        Object.keys(data.primitives.colors).length === 0
      ) {
        setShowOnBoarding(true)
        return
      }

      setColors(data.primitives.colors ?? {})
      setTypography(data.primitives.typography)
      setShadows(data.primitives.shadows ?? defaultShadowsV2)
      setFileTypes(data.files)
    } catch (e) {
      // TODO: Handle error
    } finally {
      timeout.current = setTimeout(() => {
        setIsLoading(false)
      }, 1250)
    }
  }, [
    fetchStoreData,
    setColors,
    setFileTypes,
    setShowOnBoarding,
    setShadows,
    setTypography,
  ])

  useEffect(() => {
    // on initial load
    fetchStoredData()
  }, [])

  useEffect(() => {
    router.prefetch('/colors')
    router.prefetch('/typography')
    router.prefetch('/shadows')
    router.prefetch('/components')
  }, [router])

  const handleOnboardingSubmit = async (data: TMirrorfulStore) => {
    postStoreData(data)
    setColors(data.primitives.colors)
    setShadows(data.primitives.shadows)
    setTypography(data.primitives.typography)
    setFileTypes(data.files)
  }

  return (
    <html lang="en">
      <body>
        <CacheProvider>
          <MirrorfulThemeProvider>
            {isLoading && <SplashScreen></SplashScreen>}
            {!shouldForceSkipOnboarding && showOnBoarding ? (
              <Onboarding
                postStoreData={handleOnboardingSubmit}
                onFinishOnboarding={() => {
                  setShowOnBoarding(false)
                  setShouldForceSkipOnboarding(true)
                }}
                platform={'web'}
              />
            ) : (
              <LayoutWrapper>{children}</LayoutWrapper>
            )}
          </MirrorfulThemeProvider>
        </CacheProvider>
      </body>
    </html>
  )
}
