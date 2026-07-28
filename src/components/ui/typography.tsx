import type { ReactNode, HTMLAttributes } from "react"

interface H1Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H1({ children, ...props }: H1Props) {
  return <h1 {...props}>{children}</h1>
}

interface H2Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H2({ children, ...props }: H2Props) {
  return <h2 {...props}>{children}</h2>
}

interface H3Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H3({ children, ...props }: H3Props) {
  return <h3 {...props}>{children}</h3>
}

interface H4Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H4({ children, ...props }: H4Props) {
  return <h4 {...props}>{children}</h4>
}

interface H5Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H5({ children, ...props }: H5Props) {
  return <h5 {...props}>{children}</h5>
}

interface H6Props extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

function H6({ children, ...props }: H6Props) {
  return <h6 {...props}>{children}</h6>
}

interface PProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

function P({ children, ...props }: PProps) {
  return <p {...props}>{children}</p>
}

interface SpanProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

function Span({ children, ...props }: SpanProps) {
  return <span {...props}>{children}</span>
}

interface SmallProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

function Small({ children, ...props }: SmallProps) {
  return <small {...props}>{children}</small>
}

export { H1, H2, H3, H4, H5, H6, P, Span, Small }
export type { H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PProps, SpanProps, SmallProps }
