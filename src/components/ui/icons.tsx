import type { SVGAttributes, ReactNode } from "react"

interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  children: ReactNode
}

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

interface IconWrapperProps {
  icon: ReactNode
  size?: number | string
  className?: string
}

function IconWrapper({ icon, size = 24, className }: IconWrapperProps) {
  return <span className={className}>{icon}</span>
}

export { Icon, IconWrapper, type IconProps, type IconWrapperProps }
