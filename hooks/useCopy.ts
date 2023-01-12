import { useEffect, useState } from 'react'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean> // Return success

function useCopy(): [CopiedValue, boolean, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [isCopying, setIsCopying] = useState<boolean>(false)

  useEffect(() => {
    if (!isCopying) return

    const timeout = setTimeout(() => {
      setIsCopying(false)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [isCopying])

  const copy: CopyFn = async text => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text)
      setIsCopying(true)
      setCopiedText(text)
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, isCopying, copy]
}

export default useCopy
