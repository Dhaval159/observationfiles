import type { ReactNode, HTMLAttributes, TableHTMLAttributes } from "react"

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

function Table({ children, ...props }: TableProps) {
  return <table {...props}>{children}</table>
}

interface TheadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

function Thead({ children, ...props }: TheadProps) {
  return <thead {...props}>{children}</thead>
}

interface TbodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

function Tbody({ children, ...props }: TbodyProps) {
  return <tbody {...props}>{children}</tbody>
}

interface TfootProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

function Tfoot({ children, ...props }: TfootProps) {
  return <tfoot {...props}>{children}</tfoot>
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode
}

function Tr({ children, ...props }: TrProps) {
  return <tr {...props}>{children}</tr>
}

interface ThProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

function Th({ children, ...props }: ThProps) {
  return <th {...props}>{children}</th>
}

interface TdProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

function Td({ children, ...props }: TdProps) {
  return <td {...props}>{children}</td>
}

export { Table, Thead, Tbody, Tfoot, Tr, Th, Td }
export type { TableProps, TheadProps, TbodyProps, TfootProps, TrProps, ThProps, TdProps }
