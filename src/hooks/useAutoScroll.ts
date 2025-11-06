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

    const container = containerRef.value as any
    if (!container) return

    try {
      // NScrollbar 컴포넌트 처리
      if (container.$el) {
        const scrollbarEl = container.$el as HTMLElement
        const contentEl = scrollbarEl.querySelector('.n-scrollbar-container') as HTMLElement | null

        if (contentEl) {
          contentEl.scrollTo({
            top: contentEl.scrollHeight,
            behavior: 'smooth'
          })
          return
        }
      }

      // lastItemRef 사용 (기존 로직)
      const lastEl = lastItemRef.value
      if (lastEl) {
        const top = getOffsetTop ? getOffsetTop(lastEl) : lastEl.offsetTop
        if (typeof container.scrollTo === 'function') {
          container.scrollTo({ top, behavior: 'smooth' })
          return
        }
        if ('scrollTop' in container) {
          container.scrollTop = top
          return
        }
      }

      // 최종 fallback
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 1e9, behavior: 'smooth' })
      }
    } catch (err) {
      console.warn('Auto scroll failed:', err)
    }
  }

  return { setLastItemRef, scrollToLast }
}
