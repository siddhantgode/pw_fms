import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';

export default function CategoryForm({ 
  category, 
  collectionName, 
  onItemAdded, 
  onItemUpdated, 
  onClose, 
  showToast, 
  editItem, 
  mode,
  columnDefinitions,
  filterMaps
}) {
  // Generate initial form data from column definitions
  const generateInitialData = () => {
    const initialData = {};
    columnDefinitions.forEach(col => {
      if (editItem && editItem[col.value] !== undefined) {
        // Handle date fields
        if (col.type === 'date' && editItem[col.value]) {
          initialData[col.value] = editItem[col.value].slice(0, 10); // YYYY-MM-DD format
        } else {
          initialData[col.value] = editItem[col.value];
        }
      } else {
        // Set default values based on type
        if (col.type === 'select') {
          initialData[col.value] = col.options && col.options.length > 0 ? col.options[0] : '';
        } else {
          initialData[col.value] = '';
        }
      }
    });
    return initialData;
  };

  const [formData, setFormData] = useState(generateInitialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form data when editItem changes
  useEffect(() => {
    if (editItem) {
      setFormData(generateInitialData());
    }
  }, [editItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = columnDefinitions.filter(col => col.required).map(col => col.value);
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`${columnDefinitions.find(col => col.value === field)?.label || field} is required.`);
        }
      }

      if (mode === 'edit' && editItem) {
        // Update existing item
        const itemRef = doc(db, collectionName, editItem.id);
        await updateDoc(itemRef, formData);
        
        showToast(`${category} updated successfully!`, 'success');
        onItemUpdated && onItemUpdated({ id: editItem.id, ...formData });
      } else {
        // Add new item
        // Check for duplicate ID if applicable
        if (formData.empId || formData.employeeId || formData.licenseNo || formData.vendorId) {
          const idField = formData.empId ? 'empId' : 
                          formData.employeeId ? 'employeeId' : 
                          formData.licenseNo ? 'licenseNo' : 'vendorId';
          
          const snap = await getDocs(collection(db, collectionName));
          const exists = snap.docs.some(doc => doc.data()[idField] === formData[idField]);
          
          if (exists) {
            showToast(`${category} with this ${idField} already exists.`, 'error');
            setLoading(false);
            return;
          }
        }
        
        // Add new document
        const docRef = await addDoc(collection(db, collectionName), {
          ...formData,
          createdAt: new Date()
        });
        
        showToast(`${category} added successfully!`, 'success');
        onItemAdded && onItemAdded({ id: docRef.id, ...formData, createdAt: new Date() });
      }
      
      // Close form
      onClose && onClose();
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || `Failed to ${mode === 'edit' ? 'update' : 'add'} ${category.toLowerCase()}`);
      showToast(err.message || `Failed to ${mode === 'edit' ? 'update' : 'add'} ${category.toLowerCase()}`, 'error');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <div style={{
        background: '#3d0066',
        color: '#fff',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: '14px 24px 10px 24px',
        margin: '-24px -24px 18px -24px',
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
      }}>
        <h4 style={{ fontSize: 20, margin: 0, color: '#fff', fontWeight: 600, letterSpacing: 0.5 }}>
          {mode === 'edit' ? `Edit ${category}` : `Add New ${category}`}
        </h4>
      </div>
      
      <form onSubmit={handleSubmit} style={{ fontSize: 13 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {columnDefinitions.map(col => (
            <div key={col.value} style={{ flex: '1 0 30%', minWidth: '250px', marginBottom: '10px' }}>
              <label htmlFor={col.value} className="form-label">
                {col.label} {col.required && <span style={{ color: '#a30000' }}>*</span>}
              </label>
              
              {col.type === 'select' ? (
                <select
                  id={col.value}
                  name={col.value}
                  value={formData[col.value] || ''}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  style={{ borderRadius: 0, fontSize: 13 }}
                  required={col.required}
                >
                  <option value="">Select {col.label}</option>
                  {col.options && col.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : col.type === 'textarea' ? (
                <textarea
                  id={col.value}
                  name={col.value}
                  value={formData[col.value] || ''}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  style={{ borderRadius: 0, fontSize: 13 }}
                  required={col.required}
                  rows={3}
                ></textarea>
              ) : (
                <input
                  type={col.type || 'text'}
                  id={col.value}
                  name={col.value}
                  value={formData[col.value] || ''}
                  onChange={handleChange}
                  className="form-control form-control-sm"
                  style={{ borderRadius: 0, fontSize: 13 }}
                  required={col.required}
                />
              )}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            style={{ borderRadius: 0, border: '1px solid #888' }} 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary btn-sm" 
            style={{ borderRadius: 0, border: '1px solid #888', background: '#3d0066', color: '#fff' }} 
            disabled={loading}
          >
            {mode === 'edit' ? `Save ${category}` : `Add ${category}`}
          </button>
        </div>
        
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}
