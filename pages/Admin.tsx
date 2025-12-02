
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { AppData, AppFormData } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Plus, Trash2, Edit2, X, Loader2, Rocket, AlignLeft, Sparkles } from 'lucide-react';

const INITIAL_FORM: AppFormData = {
  name: '',
  tagline: '',
  description: '',
  launchStatus: 'Coming Soon',
  externalLink: '',
  launchDate: '',
  launchWeeks: 1,
};

// Helper function to add timeout to promises
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });
  
  return Promise.race([
    promise.then(res => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
};

export const Admin: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AppFormData>(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  useEffect(() => {
    const appsCollectionRef = collection(db, 'apps');
    const q = query(appsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppData[];
      setApps(appsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setIsEditing(null);
    setShowForm(false);
    setStatusMessage('');
  };

  const handleEdit = (app: AppData) => {
    setFormData({
      name: app.name,
      tagline: app.tagline || '',
      description: app.description || '',
      launchStatus: app.launchStatus,
      launchDate: app.launchDate || '',
      launchWeeks: app.launchWeeks || 1,
      externalLink: app.externalLink || '',
    });
    setIsEditing(app.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteDoc(doc(db, 'apps', confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting app:", error);
      alert("Failed to delete app.");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    if (formData.launchStatus === 'Coming in selected date' && !formData.launchDate) return false;
    if (formData.launchStatus === 'Coming in selected weeks' && (formData.launchWeeks === undefined || formData.launchWeeks < 0)) return false;
    return true;
  };

  const handleSaveAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setFormLoading(true);
    setStatusMessage('Saving details...');

    try {
      const payload = {
        name: formData.name,
        tagline: formData.tagline || '',
        description: formData.description || '',
        launchStatus: formData.launchStatus,
        launchDate: formData.launchStatus === 'Coming in selected date' ? formData.launchDate : null,
        launchWeeks: formData.launchStatus === 'Coming in selected weeks' ? Number(formData.launchWeeks) : null,
        externalLink: formData.externalLink || null,
        createdAt: isEditing ? (apps.find(a => a.id === isEditing)?.createdAt || Date.now()) : Date.now(),
      };

      // Remove undefined keys
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );

      if (isEditing) {
        await withTimeout(
          updateDoc(doc(db, 'apps', isEditing), cleanPayload),
          30000, 
          "Database update timed out."
        );
      } else {
        await withTimeout(
          addDoc(collection(db, 'apps'), cleanPayload),
          30000, 
          "Database save timed out."
        );
      }

      setStatusMessage('Done!');
      await new Promise(r => setTimeout(r, 500));
      resetForm();
      
    } catch (error: any) {
      console.error("Error saving app:", error);
      alert(`Error: ${error.message || "Failed to save app. Please check your connection."}`);
    } finally {
      setFormLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-red-900/20 rounded-lg border border-red-900/50">
             <Rocket className="text-red-500" size={24} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-white tracking-tight">App Dashboard</h1>
             <p className="text-zinc-500 text-sm">Manage your portfolio</p>
           </div>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} /> Add New App
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 mb-12 shadow-2xl animate-fade-in-up backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing ? <Edit2 size={20} className="text-red-500" /> : <Plus size={20} className="text-red-500" />}
              {isEditing ? 'Edit App' : 'Add New App'}
            </h2>
            <button 
              onClick={resetForm}
              disabled={formLoading}
              className={`p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors ${formLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveAttempt} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* App Name */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">App Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={formLoading}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-50 transition-all"
                  placeholder="e.g. Ludo Supreme"
                  required
                />
              </div>

              {/* Tagline */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   Tagline (Optional) <Sparkles size={12} className="text-yellow-500" />
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  disabled={formLoading}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-50 transition-all placeholder-zinc-700"
                  placeholder="e.g. The Ultimate Gaming Experience"
                />
              </div>

              {/* Status */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Launch Status *</label>
                <div className="relative">
                  <select
                    value={formData.launchStatus}
                    onChange={(e) => setFormData({...formData, launchStatus: e.target.value as any})}
                    disabled={formLoading}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Coming in selected date">Coming in selected date</option>
                    <option value="Coming in selected weeks">Coming in selected weeks</option>
                    <option value="Launched">Launched</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ArrowDown size={16} />
                  </div>
                </div>
              </div>

              {/* Conditional Status Fields */}
              {formData.launchStatus === 'Coming in selected date' && (
                <div className="col-span-1 animate-fade-in">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Date *</label>
                  <input
                    type="date"
                    value={formData.launchDate}
                    onChange={(e) => setFormData({...formData, launchDate: e.target.value})}
                    disabled={formLoading}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 focus:outline-none focus:border-red-600 [color-scheme:dark] disabled:opacity-50 transition-all"
                    required
                  />
                </div>
              )}

              {formData.launchStatus === 'Coming in selected weeks' && (
                <div className="col-span-1 animate-fade-in">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Number of Weeks *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.launchWeeks}
                    onChange={(e) => setFormData({...formData, launchWeeks: parseInt(e.target.value) || 0})}
                    disabled={formLoading}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 focus:outline-none focus:border-red-600 disabled:opacity-50 transition-all"
                    required
                  />
                </div>
              )}

              {/* External Link */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">External Link (Optional)</label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
                  disabled={formLoading}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 focus:outline-none focus:border-red-600 disabled:opacity-50 transition-all"
                  placeholder="https://example.com"
                />
              </div>

              {/* Description Field */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">App Description (Optional)</label>
                <div className="relative">
                  <AlignLeft className="absolute top-4 left-4 text-zinc-600" size={18} />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    disabled={formLoading}
                    rows={4}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3.5 pl-12 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-50 transition-all placeholder-zinc-700 resize-none"
                    placeholder="Enter a brief description of your app..."
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900">
              <button
                type="button"
                onClick={resetForm}
                disabled={formLoading}
                className={`px-6 py-3 rounded-xl bg-zinc-900 text-zinc-400 font-medium transition-colors ${
                  formLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-900/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait min-w-[160px] justify-center"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>{statusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  isEditing ? 'Update App' : 'Add App'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Section */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-black/40">
          <h2 className="text-lg font-bold text-white tracking-wide">Existing Apps <span className="text-zinc-500 ml-2 text-sm font-normal">({apps.length})</span></h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-red-600" size={32} />
          </div>
        ) : apps.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-600">
              <Rocket size={24} />
            </div>
            <p className="text-zinc-400 font-medium">No apps found.</p>
            <p className="text-zinc-600 text-sm mt-1">Add your first app to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black text-zinc-500 text-xs uppercase font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">App</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Link</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {apps.map((app) => (
                  <tr key={app.id} className="group hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base group-hover:text-red-500 transition-colors">{app.name}</span>
                        {app.tagline && (
                          <span className="text-red-400/80 text-[10px] uppercase tracking-wider font-bold mb-1">{app.tagline}</span>
                        )}
                        {app.description && (
                          <span className="text-zinc-600 text-xs truncate max-w-xs">{app.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <div className="inline-flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          app.launchStatus === 'Launched' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' :
                          app.launchStatus === 'Coming Soon' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-yellow-500'
                        }`}></span>
                        {app.launchStatus}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 pl-4">
                        {app.launchStatus === 'Coming in selected date' && `Target: ${app.launchDate}`}
                        {app.launchStatus === 'Coming in selected weeks' && `In ${app.launchWeeks} weeks`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 max-w-[200px] truncate">
                      {app.externalLink ? (
                        <a href={app.externalLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                          {app.externalLink}
                        </a>
                      ) : (
                        <span className="text-zinc-600 italic">No link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(app)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(app.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!confirmDeleteId}
        title="Delete App"
        message="Are you sure you want to delete this app? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="Delete"
        isDangerous={true}
      />

      <ConfirmationModal 
        isOpen={showSaveConfirm}
        title={isEditing ? "Update App" : "Add New App"}
        message={`Are you sure you want to ${isEditing ? 'update' : 'add'} this app?`}
        onConfirm={handleSave}
        onCancel={() => setShowSaveConfirm(false)}
        confirmText={isEditing ? "Update" : "Add App"}
      />

    </div>
  );
};

// Helper for arrow down icon in select
const ArrowDown = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
