import { nextTick, type Ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

type AnyEl = HTMLElement & { offsetTop: number }

type ScrollTarget = {
  scrollTo?: (options: { top: number; behavior?: ScrollBehavior }) => void
  scrollTop?: number
}

export interface AutoScrollOptions<T = unknown> {
  containerRef: Ref<T | null>
  lastItemRef: Ref<AnyEl | null>
  getOffsetTop?: (el: AnyEl) => number
}

export const useAutoScroll = <T = ScrollTarget>({
  containerRef,
  lastItemRef,
  getOffsetTop,
}: AutoScrollOptions<T>) => {
  const setLastItemRef = (
    el: Element | ComponentPublicInstance | null,
    _idx: number
  ) => {
    lastItemRef.value = (el as unknown as AnyEl) || null
  }

  const scrollToLast = async () => {
    await nextTick()
    const lastEl = lastItemRef.value
    const container = containerRef.value as unknown as ScrollTarget | undefined
    if (!lastEl || !container) return
    const top = getOffsetTop ? getOffsetTop(lastEl) : lastEl.offsetTop

    try {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top, behavior: 'smooth' })
        return
      }
    } catch {}

    // Fallback to direct scrollTop if available
    if ('scrollTop' in (container as any)) {
      ;(container as any).scrollTop = top
    }
  }

  return { setLastItemRef, scrollToLast }
}
