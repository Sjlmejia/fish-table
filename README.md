# fish-table-lib

Generic, reusable data table built with **React + TypeScript**, **shadcn/ui** for styling, and **@tanstack/react-table** as the data engine.

**Demo:** [fish-table-page.vercel.app](https://fish-table-page.vercel.app/)

> [Versión en español](README.es.md)

## Features

- Generic `DataTable<TData, TValue>` component with full TypeScript support.
- Built-in `loading` and empty (`emptyMessage`) states.
- Client-side (automatic) or server-side (controlled) pagination.
- Column sorting (opt-in with `enableSorting: true`).
- Clickable rows via `onRowClick`.
- shadcn/ui styling (Tailwind CSS v4 + theme CSS variables).
- Also exports `Table`, `TableHeader`, `TableRow`, etc. primitives and TanStack's `createColumnHelper` / `ColumnDef` so you don't need a separate `@tanstack/react-table` install for column definitions.

## Installation

```bash
npm install fish-table-lib
```

With yarn or pnpm:

```bash
yarn add fish-table-lib
pnpm add fish-table-lib
```

### Consumer project requirements

- React 18+.
- Tailwind CSS v4 with a shadcn/ui theme (CSS variables: `--background`, `--foreground`, `--muted`, `--primary`, `--border`, etc.).
- Tell Tailwind to scan the library so it generates the utility classes. In your global CSS:

```css
@import 'tailwindcss';

@source '../node_modules/fish-table-lib/src';
```

(adjust the relative path based on where your CSS file lives).

## Basic usage

```tsx
import { DataTable, type ColumnDef } from 'fish-table-lib'

interface User {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true, // enable sorting on this column
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <span className="font-medium">{row.original.role}</span>,
  },
]

export function UsersTable({ users }: { users: User[] }) {
  return <DataTable columns={columns} data={users} />
}
```

## Props

| Prop           | Type                                          | Default              | Description                                                          |
| -------------- | --------------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `columns`      | `ColumnDef<TData, TValue>[]`                  | — (required)         | TanStack Table column definitions.                                   |
| `data`         | `TData[]`                                     | — (required)         | Rows to render.                                                      |
| `loading`      | `boolean`                                     | `false`              | Shows a loading row with a spinner.                                  |
| `emptyMessage` | `React.ReactNode`                             | `'No hay resultados.'` | Content shown when there are no rows.                              |
| `pagination`   | `boolean \| DataTablePaginationConfig`        | `undefined`          | `true` = client-side; object = server-side; omitted = no pagination. |
| `onRowClick`   | `(row: TData, tableRow: Row<TData>) => void`  | `undefined`          | Row click handler (adds `cursor-pointer`).                           |
| `className`    | `string`                                      | `undefined`          | Extra classes for the root container.                                |

## Examples

### Loading and empty state

```tsx
<DataTable
  columns={columns}
  data={users}
  loading={isLoading}
  emptyMessage="No users found"
/>
```

### Client-side pagination

TanStack handles pagination internally (10 rows per page by default):

```tsx
<DataTable columns={columns} data={users} pagination />
```

### Server-side pagination (controlled)

You control state and fetch per page. `pageIndex` is **0-based**:

```tsx
import { DataTable, type DataTablePaginationConfig } from 'fish-table-lib'

function UsersTable() {
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20

  const { users, total, loading } = useUsers({ page: pageIndex + 1, limit: pageSize })

  const pagination: DataTablePaginationConfig = {
    pageIndex,
    pageSize,
    total, // total rows on the server
    onPageChange: setPageIndex,
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      pagination={pagination}
    />
  )
}
```

### Clickable rows

```tsx
<DataTable
  columns={columns}
  data={users}
  onRowClick={user => router.push(`/users/${user.id}`)}
/>
```

### Columns with `createColumnHelper` (stricter typing)

```tsx
import { DataTable, createColumnHelper } from 'fish-table-lib'

const helper = createColumnHelper<User>()

const columns = [
  helper.accessor('name', { header: 'Name', enableSorting: true }),
  helper.accessor('email', { header: 'Email' }),
  helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <button onClick={() => edit(row.original)}>Edit</button>,
  }),
]
```

### Action column without triggering `onRowClick`

Stop propagation on the cell content:

```tsx
helper.display({
  id: 'actions',
  cell: ({ row }) => (
    <button onClick={e => { e.stopPropagation(); remove(row.original.id) }}>
      Delete
    </button>
  ),
})
```

## Sorting

Sorting is disabled by default on all columns. Enable it per column with `enableSorting: true`; the header becomes clickable and shows sort indicators (▲ / ▼ / ↕).

## Library structure

```
fish-table-lib/
├── src/
│   ├── components/
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx   # Main component + paginator
│   │   │   ├── types.ts        # DataTableProps, DataTablePaginationConfig
│   │   │   └── index.ts
│   │   └── ui/
│   │       └── table.tsx       # shadcn/ui primitives (Table, TableRow, ...)
│   ├── lib/
│   │   └── utils.ts            # cn() (clsx + tailwind-merge)
│   └── index.ts                # Public entry point
├── dist/                       # Build output (ESM + CJS + .d.ts)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Scripts

```bash
npm run build       # Build to dist/ (ESM + CJS + types)
npm run dev         # Watch mode
npm run type-check  # tsc --noEmit
```

## Notes

- The bundle includes `'use client'`, so it works out of the box with Next.js App Router.
- `react` and `react-dom` are `peerDependencies` — your project supplies the version.

## Local installation (development)

If you're working on the library repo itself:

```bash
cd fish-table
npm install
npm run build
npm link   # optional: link globally
```

In your consumer project:

```bash
npm link fish-table-lib
# or
npm install ../fish-table
```
