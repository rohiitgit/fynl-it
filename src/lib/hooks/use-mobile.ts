import { useEffect, useState } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

// Mobile: < 1024px (matches lg breakpoint in Tailwind)
export function useMobile() {
  return useMediaQuery("(max-width: 1023px)")
}

// Tablet: 768px - 1023px
export function useTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}

// Desktop: >= 1024px
export function useDesktop() {
  return useMediaQuery("(min-width: 1024px)")
}
