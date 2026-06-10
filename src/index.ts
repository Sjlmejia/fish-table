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

// Re-exports de TanStack Table para definir columnas sin instalar la dependencia aparte
export type { ColumnDef, Row, CellContext, HeaderContext } from '@tanstack/react-table'
export { createColumnHelper } from '@tanstack/react-table'
