"use client"

import { forwardRef, type ImgHTMLAttributes } from "react"

type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: AvatarSize
  fallback?: string
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
  { size = "md", fallback, ...props },
  ref
) {
  return <img ref={ref} {...props} />
})

export { Avatar, type AvatarProps, type AvatarSize }
