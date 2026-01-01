import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export const DataTable = ({ 
  headers, 
  rows, 
  onDelete = null,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon = null,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  className="p-5 font-semibold text-slate-600 text-sm"
                >
                  {header}
                </th>
              ))}
              {onDelete && <th className="p-5 text-center text-slate-600 text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + (onDelete ? 1 : 0)} className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-slate-400"
                  >
                    {EmptyIcon && (
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <EmptyIcon size={32} className="text-slate-300" />
                      </div>
                    )}
                    <p className="text-lg font-medium text-slate-600">{emptyMessage}</p>
                  </motion.div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  className="group transition-colors"
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="p-4 text-sm text-slate-600 align-middle">
                      {cell}
                    </td>
                  ))}
                  {onDelete && (
                    <td className="p-4 text-center align-middle">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
