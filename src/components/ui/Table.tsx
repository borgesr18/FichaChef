import React from 'react'
import { clsx } from 'clsx'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered'
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'min-w-full divide-y divide-slate-200'
    
    const variants = {
      default: '',
      striped: '[&_tbody_tr:nth-child(odd)]:bg-slate-50/50',
      bordered: 'border border-slate-200 [&_td]:border-r [&_td]:border-slate-200 [&_th]:border-r [&_th]:border-slate-200'
    }

    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table
            ref={ref}
            className={clsx(baseClasses, variants[variant], className)}
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    )
  }
)

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={clsx('bg-gradient-to-r from-slate-50 to-slate-100', className)}
        {...props}
      >
        {children}
      </thead>
    )
  }
)

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={clsx('bg-white divide-y divide-slate-200', className)}
        {...props}
      >
        {children}
      </tbody>
    )
  }
)

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={clsx(
          'transition-colors duration-200',
          hover && 'hover:bg-slate-50/80',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    )
  }
)

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={clsx(
          'px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
          className
        )}
        {...props}
      >
        {children}
      </th>
    )
  }
)

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={clsx(
          'px-6 py-4 text-sm text-slate-900 whitespace-nowrap',
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  }
)

Table.displayName = 'Table'
TableHeader.displayName = 'TableHeader'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableHead.displayName = 'TableHead'
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }

