import * as React from "react"
import { cn } from "@/lib/utils"

// ✅ CORRIGIDO: Interfaces com pelo menos uma propriedade para evitar erro ESLint
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped'
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  variant?: 'default' | 'compact'
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  variant?: 'default' | 'summary'
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  variant?: 'default' | 'selected' | 'hover'
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  position?: 'top' | 'bottom'
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          variant === 'striped' && "table-striped",
          className
        )}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b",
        sticky && "sticky top-0 bg-background",
        className
      )}
      {...props}
    />
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        "[&_tr:last-child]:border-0",
        variant === 'compact' && "text-xs",
        className
      )}
      {...props}
    />
  )
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        variant === 'summary' && "bg-primary/5",
        className
      )}
      {...props}
    />
  )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors",
        variant === 'hover' && "hover:bg-muted/50",
        variant === 'selected' && "bg-muted",
        "data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable = false, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        sortable && "cursor-pointer hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        align === 'center' && "text-center",
        align === 'right' && "text-right",
        className
      )}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, position = 'bottom', ...props }, ref) => (
    <caption
      ref={ref}
      className={cn(
        "mt-4 text-sm text-muted-foreground",
        position === 'top' && "caption-top mt-0 mb-4",
        className
      )}
      {...props}
    />
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

