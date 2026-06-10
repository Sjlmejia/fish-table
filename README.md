# fish-table-lib

Tabla genérica reutilizable construida con **React + TypeScript**, **shadcn/ui** como base visual y **@tanstack/react-table** como motor de datos.

Pensada para instalarse en cualquier proyecto como dependencia local o paquete npm.

## Características

- Componente genérico `DataTable<TData, TValue>` con tipado completo.
- Estados de `loading` y vacío (`emptyMessage`) integrados.
- Paginación client-side (automática) o server-side (controlada).
- Ordenamiento por columna (opt-in con `enableSorting: true`).
- Filas clickeables vía `onRowClick`.
- Estilos shadcn/ui (Tailwind CSS v4 + variables CSS del tema).
- Exporta también los primitivos `Table`, `TableHeader`, `TableRow`, etc. y `createColumnHelper` / `ColumnDef` de TanStack para no instalar la dependencia aparte.

## Instalación local

```bash
# 1. Compilar la librería
cd fish-table-lib
npm install
npm run build

# 2. Instalarla en tu proyecto (queda en node_modules)
cd ../mi-proyecto
npm install ../fish-table-lib
```

Esto agrega en tu `package.json`:

```json
{
  "dependencies": {
    "fish-table-lib": "file:../fish-table-lib"
  }
}
```

> También puedes publicarla en un registry y hacer `npm install fish-table-lib`.

### Requisitos del proyecto consumidor

- React 18+.
- Tailwind CSS v4 con el tema de shadcn/ui (variables `--background`, `--foreground`, `--muted`, `--primary`, `--border`, etc.).
- Indicarle a Tailwind que escanee la librería para generar sus clases. En tu CSS global:

```css
@import 'tailwindcss';

@source '../node_modules/fish-table-lib/src';
```

(ajusta la ruta relativa según la ubicación de tu CSS).

## Uso básico

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
    header: 'Nombre',
    enableSorting: true, // habilita ordenamiento en esta columna
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Perfil',
    cell: ({ row }) => <span className="font-medium">{row.original.role}</span>,
  },
]

export function UsersTable({ users }: { users: User[] }) {
  return <DataTable columns={columns} data={users} />
}
```

## Props

| Prop           | Tipo                                          | Default               | Descripción                                                       |
| -------------- | --------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| `columns`      | `ColumnDef<TData, TValue>[]`                  | — (requerido)         | Definición de columnas de TanStack Table.                         |
| `data`         | `TData[]`                                     | — (requerido)         | Filas a renderizar.                                                |
| `loading`      | `boolean`                                     | `false`               | Muestra una fila de carga con spinner.                             |
| `emptyMessage` | `React.ReactNode`                             | `'No hay resultados.'`| Contenido a mostrar cuando no hay filas.                           |
| `pagination`   | `boolean \| DataTablePaginationConfig`        | `undefined`           | `true` = client-side; objeto = server-side; omitido = sin paginar. |
| `onRowClick`   | `(row: TData, tableRow: Row<TData>) => void`  | `undefined`           | Callback al hacer click en una fila (agrega `cursor-pointer`).     |
| `className`    | `string`                                      | `undefined`           | Clases extra para el contenedor raíz.                              |

## Ejemplos

### Loading y mensaje vacío

```tsx
<DataTable
  columns={columns}
  data={users}
  loading={isLoading}
  emptyMessage="No se encontraron usuarios"
/>
```

### Paginación client-side

TanStack pagina internamente (10 filas por página por defecto):

```tsx
<DataTable columns={columns} data={users} pagination />
```

### Paginación server-side (controlada)

Tú controlas el estado y haces el fetch por página. `pageIndex` es **0-based**:

```tsx
import { DataTable, type DataTablePaginationConfig } from 'fish-table-lib'

function UsersTable() {
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20

  const { users, total, loading } = useUsers({ page: pageIndex + 1, limit: pageSize })

  const pagination: DataTablePaginationConfig = {
    pageIndex,
    pageSize,
    total, // total de filas en el servidor
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

### Fila clickeable

```tsx
<DataTable
  columns={columns}
  data={users}
  onRowClick={user => router.push(`/users/${user.id}`)}
/>
```

### Columnas con `createColumnHelper` (tipado más estricto)

```tsx
import { DataTable, createColumnHelper } from 'fish-table-lib'

const helper = createColumnHelper<User>()

const columns = [
  helper.accessor('name', { header: 'Nombre', enableSorting: true }),
  helper.accessor('email', { header: 'Email' }),
  helper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <button onClick={() => edit(row.original)}>Editar</button>,
  }),
]
```

### Columna de acciones sin disparar `onRowClick`

Detén la propagación en el contenido de la celda:

```tsx
helper.display({
  id: 'actions',
  cell: ({ row }) => (
    <button onClick={e => { e.stopPropagation(); remove(row.original.id) }}>
      Eliminar
    </button>
  ),
})
```

## Ordenamiento

El ordenamiento está deshabilitado por defecto en todas las columnas. Actívalo por columna con `enableSorting: true`; el header se vuelve clickeable y muestra los indicadores (▲ / ▼ / ↕).

## Estructura de la librería

```
fish-table-lib/
├── src/
│   ├── components/
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx   # Componente principal + paginador
│   │   │   ├── types.ts        # DataTableProps, DataTablePaginationConfig
│   │   │   └── index.ts
│   │   └── ui/
│   │       └── table.tsx       # Primitivos shadcn/ui (Table, TableRow, ...)
│   ├── lib/
│   │   └── utils.ts            # cn() (clsx + tailwind-merge)
│   └── index.ts                # Punto de entrada público
├── dist/                       # Salida de build (ESM + CJS + .d.ts)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Scripts

```bash
npm run build       # Compila a dist/ (ESM + CJS + tipos)
npm run dev         # Build en modo watch
npm run type-check  # tsc --noEmit
```

## Notas

- El bundle incluye `'use client'`, por lo que funciona directo en Next.js App Router.
- `react` y `react-dom` son `peerDependencies`: se usa la versión de tu proyecto.
