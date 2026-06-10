export { DataTable } from './components/DataTable'
export type {
  DataTableProps,
  DataTablePaginationProp,
  DataTablePaginationConfig,
} from './components/DataTable'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/ui/table'

export { cn } from './lib/utils'

// Re-export TanStack Table types/helpers so consumers can define columns without a separate install
export type { ColumnDef, Row, CellContext, HeaderContext } from '@tanstack/react-table'
export { createColumnHelper } from '@tanstack/react-table'
