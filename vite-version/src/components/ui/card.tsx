import * as React from "react"
import { cn } from "cn"
import { LiquiGlass } from "@liqui-design/glass"

/* Glass card. data-slot/data-glass are what the CSS hooks into,
   and data-size makes the `sm` variants actually work. */
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof LiquiGlass> & { size?: "default" | "sm" }) {
  return (
    <LiquiGlass
      data-slot="card"
      data-glass
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing)",
        "overflow-hidden rounded-xl",
        "py-(--card-spacing) text-sm text-card-foreground",
        "[--card-spacing:--spacing(6)]",
        "data-[size=sm]:[--card-spacing:--spacing(3)]",
        className
      )}
      {...props}
    />
  )
}

/* Solid, non-glass surface. Use for tables, charts, anything
   that should NOT look like glass. */
function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "surface-panel flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(6)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

/* Transparent footer with a faint divider, so the glass reads as one surface. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t border-[var(--lq-rim-lo)] bg-transparent p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  Panel,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
