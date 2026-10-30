import { useLayoutEffect, useRef, useState, type PointerEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LiquiGlass } from "@liqui-design/glass"
import type { LucideIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Item = {
  title: string
  shortTitle?: string
  url: string
  icon: LucideIcon
}

export function GlassNavigation({
  items,
  footerItems = [],
  orientation = "vertical",
  onNavigate,
}: {
  items: Item[]
  footerItems?: Item[]
  orientation?: "vertical" | "horizontal"
  onNavigate?: () => void
}) {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLElement>(null)
  const gesture = useRef<{
    pointerId: number
    x: number
    y: number
    dragging: boolean
    url: string
  } | null>(null)
  const suppressClick = useRef(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [indicator, setIndicator] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const selected = preview ?? pathname
  const horizontal = orientation === "horizontal"
  const params = new URLSearchParams(search)
  params.delete("incident")
  const query = params.size ? "?" + params.toString() : ""
  const destination = (url: string) =>
    url + (url === "/statistics" || url === "/map" ? query : "")

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const link = Array.from(
        root.querySelectorAll<HTMLAnchorElement>("[data-glass-link]")
      ).find((item) => item.dataset.glassLink === selected)
      if (!link) {
        setIndicator(null)
        return
      }
      const bounds = link.getBoundingClientRect()
      const container = root.getBoundingClientRect()
      setIndicator({
        x: bounds.left - container.left + root.scrollLeft,
        y: bounds.top - container.top + root.scrollTop,
        width: bounds.width,
        height: bounds.height,
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    root
      .querySelectorAll("[data-glass-link]")
      .forEach((link) => observer.observe(link))
    const frame = requestAnimationFrame(measure)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [selected])

  function nearest(event: PointerEvent<HTMLElement>) {
    return Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>(
        "[data-glass-link]"
      )
    ).reduce<HTMLAnchorElement | null>((best, link) => {
      const box = link.getBoundingClientRect()
      const bestBox = best?.getBoundingClientRect()
      const coordinate = horizontal ? event.clientX : event.clientY
      const distance = Math.abs(
        coordinate -
          (horizontal ? box.left + box.width / 2 : box.top + box.height / 2)
      )
      const bestDistance = bestBox
        ? Math.abs(
            coordinate -
              (horizontal
                ? bestBox.left + bestBox.width / 2
                : bestBox.top + bestBox.height / 2)
          )
        : Infinity
      return distance < bestDistance ? link : best
    }, null)
  }

  function cancelGesture() {
    const pointer = gesture.current
    gesture.current = null
    setPreview(null)
    if (pointer && rootRef.current?.hasPointerCapture(pointer.pointerId))
      rootRef.current.releasePointerCapture(pointer.pointerId)
  }

  function link(item: Item) {
    const label = horizontal ? (item.shortTitle ?? item.title) : item.title
    return (
      <Tooltip key={item.url}>
        <TooltipTrigger
          render={
            <Link
              to={destination(item.url)}
              aria-label={label}
              aria-current={pathname === item.url ? "page" : undefined}
              data-glass-link={item.url}
              data-selected={selected === item.url || undefined}
              className="glass-nav-link"
              draggable={false}
              onClick={(event) => {
                if (
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey &&
                  event.button === 0
                )
                  onNavigate?.()
              }}
            />
          }
        >
          <item.icon className="size-5" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side={horizontal ? "top" : "right"} sideOffset={16}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <nav
      ref={rootRef}
      className={"glass-navigation glass-navigation-" + orientation}
      aria-label={horizontal ? "Main navigation" : "Workspace navigation"}
      data-dragging={preview !== null || undefined}
      onPointerDown={(event) => {
        if (
          event.button !== 0 ||
          !event.isPrimary ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const target = (event.target as Element).closest<HTMLElement>(
          "[data-glass-link]"
        )
        if (target?.dataset.glassLink)
          gesture.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            dragging: false,
            url: target.dataset.glassLink,
          }
      }}
      onPointerMove={(event) => {
        const pointer = gesture.current
        if (!pointer || pointer.pointerId !== event.pointerId) return
        if (
          !pointer.dragging &&
          Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 8
        )
          return
        pointer.dragging = true
        event.currentTarget.setPointerCapture(event.pointerId)
        const target = nearest(event)
        if (target?.dataset.glassLink) {
          pointer.url = target.dataset.glassLink
          setPreview(pointer.url)
        }
      }}
      onPointerUp={(event) => {
        const pointer = gesture.current
        if (!pointer || pointer.pointerId !== event.pointerId) return
        if (pointer.dragging) {
          event.preventDefault()
          suppressClick.current = true
          window.setTimeout(() => {
            suppressClick.current = false
          }, 0)
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX >= bounds.left - 24 &&
            event.clientX <= bounds.right + 24 &&
            event.clientY >= bounds.top - 24 &&
            event.clientY <= bounds.bottom + 24
          ) {
            navigate(destination(pointer.url))
            onNavigate?.()
          }
        }
        cancelGesture()
      }}
      onPointerCancel={cancelGesture}
      onLostPointerCapture={(event) => {
        // Touch transfers its implicit capture from the link to this track.
        if (event.target === event.currentTarget) cancelGesture()
      }}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancelGesture()
          return
        }
        const forward = horizontal ? "ArrowRight" : "ArrowDown"
        const back = horizontal ? "ArrowLeft" : "ArrowUp"
        if (![forward, back, "Home", "End"].includes(event.key)) return
        const links = Array.from(
          event.currentTarget.querySelectorAll<HTMLAnchorElement>(
            "[data-glass-link]"
          )
        )
        const index = links.indexOf(document.activeElement as HTMLAnchorElement)
        if (index < 0) return
        event.preventDefault()
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? links.length - 1
              : (index + (event.key === forward ? 1 : -1) + links.length) %
                links.length
        links[next]?.focus()
      }}
    >
      {indicator && (
        <LiquiGlass
          aria-hidden="true"
          className="glass-nav-indicator"
          contentClassName="h-full"
          material="auto"
          radius={24}
          frost={0.45}
          blur={4}
          refraction={28}
          bezel={12}
          specular={0.35}
          dispersion={0}
          style={{
            width: indicator.width,
            height: indicator.height,
            transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
          }}
        />
      )}
      <div
        data-slot={horizontal ? undefined : "sidebar-content"}
        className="glass-nav-main"
      >
        {items.map(link)}
      </div>
      {footerItems.length > 0 && (
        <div
          data-slot="sidebar-footer"
          className="glass-nav-account"
          aria-label="Account navigation"
        >
          {footerItems.map(link)}
        </div>
      )}
    </nav>
  )
}
