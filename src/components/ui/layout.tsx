import type { ReactNode, HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

function Container({ children, maxWidth: _maxWidth = "lg", ...props }: ContainerProps) {
  return <div {...props}>{children}</div>;
}

interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

function Row({ children, gap: _gap, align: _align, justify: _justify, ...props }: RowProps) {
  return <div {...props}>{children}</div>;
}

interface ColumnProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: number;
  offset?: number;
  className?: string;
}

function Column({ children, size: _size, offset: _offset, className }: ColumnProps) {
  return <div className={className}>{children}</div>;
}

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  gap?: number | string;
  wrap?: boolean;
}

function Flex({
  children,
  direction: _direction = "row",
  align: _align,
  justify: _justify,
  gap: _gap,
  wrap: _wrap,
  ...props
}: FlexProps) {
  return <div {...props}>{children}</div>;
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Section({ children, ...props }: SectionProps) {
  return <section {...props}>{children}</section>;
}

interface MainProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Main({ children, ...props }: MainProps) {
  return <main {...props}>{children}</main>;
}

interface AsideProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Aside({ children, ...props }: AsideProps) {
  return <aside {...props}>{children}</aside>;
}

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Header({ children, ...props }: HeaderProps) {
  return <header {...props}>{children}</header>;
}

interface FooterProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Footer({ children, ...props }: FooterProps) {
  return <footer {...props}>{children}</footer>;
}

export { Container, Row, Column, Flex, Section, Main, Aside, Header, Footer };
export type {
  ContainerProps,
  RowProps,
  ColumnProps,
  FlexProps,
  SectionProps,
  MainProps,
  AsideProps,
  HeaderProps,
  FooterProps,
};
