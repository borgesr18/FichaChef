'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'
import { BatchOperation } from '@/lib/batch-operations'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface ModernTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  searchable?: boolean
  filterable?: boolean
  pagination?: boolean
  pageSize?: number
  className?: string
  onRowClick?: (row: Record<string, unknown>) => void
  loading?: boolean
  selectable?: boolean
  batchOperations?: BatchOperation[]
  onBatchOperation?: (operation: BatchOperation, selectedIds: string[]) => void
}

export default function ModernTable({
  columns,
  data,
  searchable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick,
  loading = false,
}: ModernTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = data.filter(row =>
    searchTerm === '' || 
    columns.some(col => 
      String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aVal = a[sortColumn]
    const bVal = b[sortColumn]
    
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return sortDirection === 'asc' ? -1 : 1
    if (bVal == null) return sortDirection === 'asc' ? 1 : -1
    
    const aStr = String(aVal)
    const bStr = String(bVal)
    
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = pagination ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden ${className}`}>
      {/* Header with search and filters */}
      {(searchable || filterable) && (
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80">
          <div className="flex items-center justify-between space-x-4">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}
            
            {filterable && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100/80 to-slate-50/80 border-b border-slate-200/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-slate-200/50 transition-colors duration-200' : ''}
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="text-slate-400">
                        {getSortIcon(column.key) || <ChevronUp className="h-4 w-4 opacity-30" />}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`
                  group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-slate-800
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                    `}
                  >
                    {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {paginatedData.length === 0 && (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Tente ajustar sua busca' : 'Não há dados para exibir'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/80">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, sortedData.length)} de {sortedData.length} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Anterior
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
