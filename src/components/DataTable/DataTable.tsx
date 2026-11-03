'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
  GripVertical,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { cn } from '../../lib/utils'
import type { DataTablePaginationConfig, DataTableProps } from './types'

const DEFAULT_PAGE_SIZE = 10

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay resultados.',
  pagination,
  onRowClick,
  className,
  enableColumnReordering,
  columnOrderStorageKey,
}: DataTableProps<TData, TValue>) {
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const draggedColumn = React.useRef<string | null>(null)
  const canReorder = enableColumnReordering ?? Boolean(columnOrderStorageKey)

  React.useEffect(() => {
    let savedOrder: string[] = []
    if (columnOrderStorageKey) {
      try {
        const saved: unknown = JSON.parse(window.localStorage.getItem(columnOrderStorageKey) ?? 'null')
        if (Array.isArray(saved) && saved.every(id => typeof id === 'string')) {
          savedOrder = [...new Set(saved)]
        }
      } catch {
        // Storage may be unavailable or contain invalid JSON.
      }
    }
    setColumnOrder(savedOrder)
    draggedColumn.current = null
  }, [columnOrderStorageKey])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const isManualPagination = typeof pagination === 'object' && pagination !== null
  const isClientPagination = pagination === true

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
      ...(isManualPagination
        ? {
            pagination: {
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            },
          }
        : isClientPagination
          ? { pagination: internalPagination }
          : {}),
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(isClientPagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          onPaginationChange: setInternalPagination,
        }
      : {}),
    ...(isManualPagination
      ? {
          manualPagination: true,
          pageCount: Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
        }
      : {}),
    // Columns must opt in to sorting with `enableSorting: true`
    defaultColumn: { enableSorting: false },
  })

  const moveColumn = (sourceId: string, targetId: string) => {
    if (!canReorder || sourceId === targetId) return
    const source = table.getColumn(sourceId)
    const target = table.getColumn(targetId)
    // Keep grouped headers intact by moving leaves only within their group.
    if (!source || !target || source.columns.length || target.columns.length || source.parent?.id !== target.parent?.id) return
    const order = table.getAllLeafColumns().map(column => column.id)
    const from = order.indexOf(sourceId)
    const to = order.indexOf(targetId)
    if (from < 0 || to < 0) return
    order.splice(from, 1)
    order.splice(to, 0, sourceId)
    setColumnOrder(order)
    if (columnOrderStorageKey) {
      try {
        window.localStorage.setItem(columnOrderStorageKey, JSON.stringify(order))
      } catch {
        // Reordering still works when persistence is blocked or storage is full.
      }
    }
  }

  const rows = table.getRowModel().rows

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onDragOver={event => {
                      if (canReorder && draggedColumn.current && !header.column.columns.length) {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                      }
                    }}
                    onDrop={event => {
                      const source = draggedColumn.current
                      if (!source) return
                      event.preventDefault()
                      moveColumn(source, header.column.id)
                      draggedColumn.current = null
                    }}
                  >
                    {canReorder && !header.isPlaceholder && !header.column.columns.length && (
                      <button
                        type="button"
                        draggable
                        aria-label={`Mover columna ${header.column.id}`}
                        title="Arrastra para mover; usa las flechas izquierda y derecha con el teclado"
                        className="mr-1 inline-flex cursor-grab items-center align-middle active:cursor-grabbing"
                        onDragStart={event => {
                          draggedColumn.current = header.column.id
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', header.column.id)
                        }}
                        onDragEnd={() => { draggedColumn.current = null }}
                        onKeyDown={event => {
                          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
                          event.preventDefault()
                          const siblings = table.getAllLeafColumns().filter(column => column.parent?.id === header.column.parent?.id)
                          const index = siblings.findIndex(column => column.id === header.column.id)
                          const target = siblings[index + (event.key === 'ArrowLeft' ? -1 : 1)]
                          if (target) moveColumn(header.column.id, target.id)
                        }}
                      >
                        <GripVertical className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:text-foreground inline-flex cursor-pointer items-center gap-1 select-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="size-3.5" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                  <span className="text-muted-foreground inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando...
                  </span>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={onRowClick ? () => onRowClick(row.original, row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <DataTablePagination
          table={table}
          config={isManualPagination ? pagination : undefined}
        />
      )}
    </div>
  )
}

function DataTablePagination<TData>({
  table,
  config,
}: {
  table: TanstackTable<TData>
  config?: DataTablePaginationConfig
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const total = config?.total ?? table.getFilteredRowModel().rows.length

  const goToPage = (index: number) => {
    const clamped = Math.min(Math.max(0, index), pageCount - 1)
    if (config) {
      config.onPageChange(clamped)
    } else {
      table.setPageIndex(clamped)
    }
  }

  const startItem = total === 0 ? 0 : pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, total)

  const visiblePages = getVisiblePages(pageIndex, pageCount)

  return (
    <div className="text-muted-foreground flex items-center justify-between py-3 text-sm">
      <div>
        Mostrando{' '}
        <span className="text-foreground font-medium">
          {startItem} - {endItem}
        </span>{' '}
        de <span className="text-foreground font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-1">
        <PagerButton
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 0}
          ariaLabel="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </PagerButton>

        {visiblePages.map(p => (
          <PagerButton
            key={p}
            onClick={() => goToPage(p)}
            active={p === pageIndex}
            ariaLabel={`Página ${p + 1}`}
          >
            {p + 1}
          </PagerButton>
        ))}

        <PagerButton
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          ariaLabel="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </PagerButton>
      </div>
    </div>
  )
}

function PagerButton({
  children,
  onClick,
  disabled,
  active,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {children}
    </button>
  )
}

function getVisiblePages(pageIndex: number, pageCount: number, maxVisible = 5): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }

  let start = Math.max(0, pageIndex - Math.floor(maxVisible / 2))
  const end = Math.min(pageCount - 1, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
