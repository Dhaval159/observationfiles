import type { HTMLAttributes } from "react"

type LoadingSize = "sm" | "md" | "lg"

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoadingSize
  label?: string
}

function Loading({ size = "md", label, ...props }: LoadingProps) {
  return <div {...props} />
}

export { Loading, type LoadingProps, type LoadingSize }
