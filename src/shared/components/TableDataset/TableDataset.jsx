import { Search } from "lucide-react";
import "./table-dataset.css";

/**
 * Componente de Tabla reutilizable con estilo profesional.
 * 
 * @param {Array} columns - Configuración de columnas.
 *   Estructura: { 
 *     header: string,          // Título de la columna
 *     accessorKey: string,     // Clave del objeto data (opcional si usas cell)
 *     cell: (row) => node,     // Renderizado personalizado de la celda
 *     filter: node,            // Componente de input/select para filtrar en el header (opcional)
 *     className: string        // Clases extra para la columna (ej: 'text-right')
 *   }
 * @param {Array} data - Array de objetos a mostrar.
 * @param {boolean} isLoading - Estado de carga.
 * @param {string} emptyMessage - Mensaje cuando no hay datos.
 */
export default function TableDataset({ 
  columns = [], 
  data = [], 
  isLoading = false,
  emptyMessage = "No se encontraron datos." 
}) {
  
  if (isLoading) {
    return (
      <div className="table-dataset-container">
        <div className="table-loading">
          <div className="spinner"></div>
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-dataset-container">
      <div className="table-dataset-wrapper">
        <table className="dataset-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={col.className || ''}>
                  {col.header}
                  {/* Slot para filtros si se necesitan en el futuro */}
                  {col.filter && <div style={{marginTop: '8px'}}>{col.filter}</div>}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={col.className || ''}>
                      {col.cell 
                        ? col.cell(row) 
                        : (col.accessorKey ? row[col.accessorKey] : "-")
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Search size={24} color="#cbd5e1" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data.length > 0 && (
        <div className="table-dataset-footer">
            <span>Mostrando {data.length} resultados</span>
        </div>
      )}
    </div>
  );
}
