import React, { useState, useEffect } from 'react';
import './CategoryForm.css';
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
  const modalRef = React.useRef(null);

  // Add click outside handler to close the modal and manage body class
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && onClose) {
        onClose();
      }
    }
    
    // Add modal-open class to body to prevent white strips
    document.body.classList.add('modal-open');
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener and body class
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: Add Firestore add/update logic here
      // Example: await addDoc(...)
      setLoading(false);
      if (showToast) showToast('Saved successfully!');
      if (onItemAdded) onItemAdded();
      if (onItemUpdated) onItemUpdated();
      onClose();
    } catch (err) {
      setError('Error saving data.');
      setLoading(false);
    }
  };
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

  const [formData, setFormData] = useState(generateInitialData());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to split fields into up to 3 rows with even distribution
  const splitFieldsIntoRows = (fields, maxRows = 3) => {
    if (!fields || fields.length === 0) return [];
    
    // Determine actual number of rows needed, capping at maxRows
    const numRows = Math.min(maxRows, fields.length);
    const itemsPerRow = Math.ceil(fields.length / numRows);
    
    // Create rows with items distributed evenly
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      const startIdx = i * itemsPerRow;
      const endIdx = Math.min(startIdx + itemsPerRow, fields.length);
      
      // Only add row if there are fields to display
      if (startIdx < fields.length) {
        rows.push(fields.slice(startIdx, endIdx));
      }
    }
    
    return rows;
  };

  const fieldRows = splitFieldsIntoRows(columnDefinitions, 3);
  return (
    <div className="category-modal-overlay">
      <div className="category-modal" ref={modalRef}>
        <div className="category-modal-header">
          <h4 className="category-modal-title">
            {mode === 'edit' ? `Edit ${category}` : `Add ${category}`}
          </h4>
        </div>
        <div className="category-modal-inner">
          <form onSubmit={handleSubmit} style={{ fontSize: 13 }}>
            <div className="container-fluid">
              {fieldRows.map((rowFields, rowIdx) => (
                <div className="row category-form-row" key={`row-${rowIdx}`}>
                  {rowFields.map((field, idx) => {
                    // Calculate dynamic column width based on number of fields in the row
                    const colWidth = Math.floor(12 / rowFields.length);
                    // Use appropriate column class for responsive layout
                    const colClass = `col-12 col-md-${colWidth > 6 ? 6 : colWidth} mb-3`;
                    
                    return (
                      <div key={`field-${field.value || field.name}-${idx}`} className={colClass}>
                        <label htmlFor={field.value || field.name} className="form-label">
                          {field.label} {field.required && <span style={{ color: '#a30000' }}>*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            id={field.value || field.name}
                            name={field.value || field.name}
                            value={formData[field.value || field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options && field.options.map((option, oidx) => (
                              <option key={`${field.value || field.name}-opt-${oidx}`} value={option.value || option}>
                                {option.label || option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={field.value || field.name}
                            name={field.value || field.name}
                            value={formData[field.value || field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                            rows={3}
                          ></textarea>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            id={field.value || field.name}
                            name={field.value || field.name}
                            value={formData[field.value || field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="row">
                <div className="col-12 d-flex justify-content-end category-form-actions" style={{ gap: 8 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={onClose} 
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm category-save-btn" 
                    disabled={loading}
                  >
                    {mode === 'edit' ? `Save ${category}` : `Add ${category}`}
                  </button>
                </div>
              </div>
              {error && <div className="alert alert-danger mt-3 w-100">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
