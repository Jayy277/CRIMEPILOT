import React, { useState, useMemo } from 'react';
import './AdminDataTable.css';

/**
 * Reusable CrimePilot Admin DataTable Component
 * Features:
 * - Smooth vertical scrollable body (no page-level pagination)
 * - Sticky table header (column titles stay pinned on scroll)
 * - 65-75vh responsive height container
 * - Custom 6px cyan scrollbar with hover glow inside container
 * - Real-time instant multi-column search & clear button
 * - Instant column sorting (asc / desc)
 * - High-performance rendering for large dataset registries
 */
const AdminDataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  title = null,
  actions = null,
  emptyMessage = 'No records found.',
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // 1. Filtered Data (Search)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        let val = null;
        if (col.searchValue && typeof col.searchValue === 'function') {
          val = col.searchValue(row);
        } else if (col.key) {
          val = col.key.split('.').reduce((acc, part) => acc?.[part], row);
        }

        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, columns, searchTerm]);

  // 2. Sorted Data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const colObj = columns.find((c) => c.key === sortColumn);
    if (!colObj) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = colObj.sortValue
        ? colObj.sortValue(a)
        : colObj.key.split('.').reduce((acc, part) => acc?.[part], a);
      let valB = colObj.sortValue
        ? colObj.sortValue(b)
        : colObj.key.split('.').reduce((acc, part) => acc?.[part], b);

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Handle Sort Click
  const handleSort = (colKey, sortableFlag) => {
    if (!sortableFlag && sortableFlag !== undefined) return;
    if (sortColumn === colKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`admin-datatable-wrapper ${className}`}>
      {/* Top Header / Controls Bar */}
      {(title || actions || searchable) && (
        <div className="admin-datatable-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {title && typeof title === 'string' ? (
              <h3 style={{ fontSize: '18px', color: '#FFF', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {title}
              </h3>
            ) : (
              title
            )}

            {searchable && (
              <div className="admin-datatable-search">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="admin-datatable-search-clear" onClick={() => setSearchTerm('')}>
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold' }}>
              Showing {sortedData.length} Records
            </span>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}

      {/* Smooth 70vh Scrollable Table Body */}
      <div className="admin-datatable-container">
        <table className="admin-datatable-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isSortable = col.sortable !== false && col.key;
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key || idx}
                    className={isSortable ? 'sortable' : ''}
                    onClick={() => isSortable && handleSort(col.key, col.sortable)}
                    style={{ textAlign: col.align || 'left', ...col.headerStyle }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col.label}</span>
                      {isSortable && (
                        <span style={{ fontSize: '10px', color: isSorted ? '#00D9FF' : 'rgba(255,255,255,0.3)' }}>
                          {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="admin-datatable-empty">
                  Loading records...
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="admin-datatable-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx}>
                  {columns.map((col, colIdx) => {
                    const cellContent = col.render
                      ? col.render(row, rowIdx)
                      : col.key
                      ? col.key.split('.').reduce((acc, part) => acc?.[part], row)
                      : '';
                    return (
                      <td key={col.key || colIdx} style={{ textAlign: col.align || 'left', ...col.style }}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDataTable;
