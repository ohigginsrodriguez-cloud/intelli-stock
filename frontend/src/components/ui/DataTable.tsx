"use client";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-4 font-medium text-muted">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="text-right py-3 px-4 font-medium text-muted">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4">
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="text-primary hover:text-primary-dark text-sm font-medium">
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(item)} className="text-danger hover:text-red-700 text-sm font-medium">
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
