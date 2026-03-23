
import * as React from "react"
import { cn } from "@/lib/utils"

const AvatarContext = React.createContext<{
  hasImageError: boolean
  setHasImageError: (error: boolean) => void
} | null>(null)

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm" | "lg"
}) {
  const [hasImageError, setHasImageError] = React.useState(false)

  return (
    <AvatarContext.Provider value={{ hasImageError, setHasImageError }}>
      <div
        data-slot="avatar"
        data-size={size}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          "size-8 data-[size=lg]:size-10 data-[size=sm]:size-6",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, src, ...props }: React.ComponentProps<"img">) {
  const context = React.useContext(AvatarContext)

  if (!context) {
    throw new Error("AvatarImage must be used within an Avatar")
  }

  // If source is missing, treat as error immediately
  React.useEffect(() => {
    if (!src) {
      context.setHasImageError(true)
    } else {
      context.setHasImageError(false)
    }
  }, [src])

  if (context.hasImageError) {
    return null;
  }

  return (
    <img
      src={src}
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover", className)}
      onError={() => context.setHasImageError(true)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  const context = React.useContext(AvatarContext)

  if (!context) {
    throw new Error("AvatarFallback must be used within an Avatar")
  }

  if (!context.hasImageError) {
    return null
  }

  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2",
        "group-data-[size=default]/avatar:size-2.5",
        "group-data-[size=lg]/avatar:size-3",
        className
      )}
      {...props}
    />
  )
}

// Simple implementations for Group/Count to maintain API compatibility
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex -space-x-2 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
