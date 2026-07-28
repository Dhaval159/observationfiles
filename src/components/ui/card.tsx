import type { ReactNode, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function Card({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardHeader({ children, ...props }: CardHeaderProps) {
  return <div {...props}>{children}</div>
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardBody({ children, ...props }: CardBodyProps) {
  return <div {...props}>{children}</div>
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function CardFooter({ children, ...props }: CardFooterProps) {
  return <div {...props}>{children}</div>
}

export { Card, CardHeader, CardBody, CardFooter }
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps }
