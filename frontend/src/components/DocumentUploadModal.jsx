import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import api from '../api/axios';

const DocumentUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large (max 5MB)');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setScanning(true);
    setError('');
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await api.post('/ocr/scan-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error scanning document');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setSaving(true);
    setError('');
    try {
      await api.post('/ocr/save-entry', preview);
      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewChange = (e) => {
    const { name, value } = e.target;
    setPreview(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Upload size={20} className="text-primary" />
            AI Document Scan
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!preview ? (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
              >
                <div className="p-4 bg-slate-100 rounded-full text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <FileText size={40} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">Click to upload or drag & drop</p>
                  <p className="text-sm text-slate-400">Upload JPG or PNG image</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png"
                />
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <FileText size={20} className="text-slate-600" />
                    </div>
                    <div className="max-w-[200px]">
                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={scanning}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                  >
                    {scanning ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    {scanning ? 'Scanning...' : 'Scan Now'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-2">
                <CheckCircle size={18} />
                Scanning Complete! Please verify the details below.
              </div>

              {preview.confidence !== 'high' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm flex flex-col gap-1 mb-4 font-medium">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" />
                    <span>Please verify extracted total amount.</span>
                  </div>
                  {preview.sourceLine && (
                    <p className="text-xs text-amber-600 mt-1 pl-6">
                      Extracted from: <span className="italic">"{preview.sourceLine}"</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPreview(p => ({...p, type: 'income'}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${preview.type === 'income' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      Income
                    </button>
                    <button 
                      onClick={() => setPreview(p => ({...p, type: 'expense'}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${preview.type === 'expense' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                  <input 
                    type="number" 
                    name="amount"
                    value={preview.amount} 
                    onChange={handlePreviewChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={preview.date} 
                    onChange={handlePreviewChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category / Source</label>
                  <input 
                    type="text" 
                    name={preview.type === 'income' ? 'source' : 'category'}
                    value={preview.type === 'income' ? preview.source : preview.category} 
                    onChange={handlePreviewChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={preview.type === 'income' ? 'Employer/Client' : 'Category'}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                  <textarea 
                    name="notes"
                    value={preview.notes} 
                    onChange={handlePreviewChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {preview && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Transaction'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
