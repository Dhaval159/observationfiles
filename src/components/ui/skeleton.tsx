import type { HTMLAttributes } from "react"

type SkeletonVariant = "text" | "circular" | "rectangular"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
}

function Skeleton({ variant = "text", width, height, ...props }: SkeletonProps) {
  return <div {...props} />
}

export { Skeleton, type SkeletonProps, type SkeletonVariant }
