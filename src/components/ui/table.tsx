import type { ReactNode, HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TheadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

function Thead({ children, className, ...props }: TheadProps) {
  return (
    <thead className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  );
}

interface TbodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

function Tbody({ children, className, ...props }: TbodyProps) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
}

interface TfootProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

function Tfoot({ children, className, ...props }: TfootProps) {
  return (
    <tfoot
      className={cn("bg-surface border-t font-medium [&_tr]:last:border-b-0", className)}
      {...props}
    >
      {children}
    </tfoot>
  );
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

function Tr({ children, className, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        "border-border hover:bg-surface-alt border-b transition-colors duration-150",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface ThProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

function Th({ children, className, ...props }: ThProps) {
  return (
    <th
      className={cn(
        "text-muted h-10 px-3 text-left align-middle text-xs font-medium tracking-wider uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TdProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

function Td({ children, className, ...props }: TdProps) {
  return (
    <td className={cn("p-3 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export { Table, Thead, Tbody, Tfoot, Tr, Th, Td };
export type { TableProps, TheadProps, TbodyProps, TfootProps, TrProps, ThProps, TdProps };
