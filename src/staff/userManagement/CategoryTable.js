import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import CategoryForm from './CategoryForm';
import { MultiSelect, ColumnPicker } from './TableComponents';

export default function CategoryTable({ category, collectionName, columnDefinitions, initialVisibleColumns, filterDefinitions }) {
  const [items, setItems] = useState([]);
  const [filterMaps, setFilterMaps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns || []);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Fetch items and reference data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main collection items
        const itemsSnapshot = await getDocs(collection(db, collectionName));
        let itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by appropriate fields if available
        itemsList = itemsList.sort((a, b) => {
          if (a.firstName && b.firstName) {
            return a.firstName.localeCompare(b.firstName);
          } else if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          } else if (a.vendorName && b.vendorName) {
            return a.vendorName.localeCompare(b.vendorName);
          }
          return 0;
        });

        // Fetch reference data for filters
        const filterMapsData = {};
        
        if (filterDefinitions && filterDefinitions.length > 0) {
          for (const filter of filterDefinitions) {
            if (filter.refCollection) {
              const refSnapshot = await getDocs(collection(db, filter.refCollection));
              const refMap = {};
              refSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data[filter.idField] && data[filter.valueField]) {
                  refMap[data[filter.idField]] = data[filter.valueField];
                }
              });
              filterMapsData[filter.name] = refMap;
            }
          }
        }

        setItems(itemsList);
        setFilterMaps(filterMapsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to fetch data. Please try again.');
      }
      setLoading(false);
    };
    fetchData();
  }, [collectionName, filterDefinitions]);

  // Filtering logic
  const filteredItems = items.filter(item => {
    // Apply all active filters
    for (const filterKey in filters) {
      if (filters[filterKey] && filters[filterKey].length > 0) {
        const filterDef = filterDefinitions.find(fd => fd.name === filterKey);
        if (filterDef) {
          const itemValue = filterDef.refCollection 
            ? filterMaps[filterKey][item[filterDef.itemField]] || item[filterDef.itemField] || ''
            : item[filterDef.itemField] || '';
            
          if (!filters[filterKey].includes(itemValue)) return false;
        }
      }
    }
    return true;
  });

  // Toast handler
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // Item handlers
  const handleItemAdded = (item) => {
    setItems(prev => [...prev, item]);
    setShowAddItem(false);
  };

  const handleItemUpdated = (updatedItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setShowAddItem(false);
    setEditItem(null);
  };

  // Generate filter options for each filter
  const getFilterOptions = (filterName) => {
    const filterDef = filterDefinitions.find(fd => fd.name === filterName);
    if (!filterDef) return [];
    
    if (filterDef.refCollection) {
      return Object.values(filterMaps[filterName] || {});
    } else {
      return [...new Set(items.map(item => item[filterDef.itemField]).filter(Boolean))];
    }
  };

  return (
    <div>
      <style>{`
        .category-table td, .category-table th {
          padding: 4px 8px !important;
        }
        .category-table thead th {
          font-size: 13px !important;
          background: #3d0066 !important;
          color: #fff !important;
          text-align: center !important;
          vertical-align: middle !important;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .category-table tbody td {
          font-size: 13px;
        }
        .table-responsive {
          max-height: 70vh;
          overflow-y: auto;
        }
      `}</style>
      <h3>{category} List</h3>
      {/* Add/Edit/Delete buttons */}
      <div className="mb-2" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-primary sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #888' }}
          onClick={() => setShowAddItem(true)}
        >Add {category}</button>
        <button
          className="btn btn-secondary sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #888' }}
          disabled={!editItem}
          onClick={() => setShowAddItem('edit')}
        >Edit {category}</button>
        <button
          className="btn btn-danger sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #a30000', background: '#a30000', color: '#fff' }}
          disabled={!editItem}
          onClick={() => {
            if (!editItem) return;
            setToast({
              show: true,
              msg: (
                <span>
                  Are you sure you want to delete this {category.toLowerCase()}?&nbsp;
                  <button
                    style={{ background: '#a30000', color: '#fff', border: 'none', borderRadius: 0, padding: '2px 10px', marginLeft: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        // Delete from Firestore
                        await deleteDoc(doc(db, collectionName, editItem.id));
                        setItems(prev => prev.filter(u => u.id !== editItem.id));
                        setEditItem(null);
                        setToast({ show: true, msg: `${category} deleted successfully!`, type: 'success' });
                      } catch (err) {
                        console.error("Error deleting item:", err);
                        setToast({ show: true, msg: `Error deleting ${category.toLowerCase()}.`, type: 'error' });
                      }
                    }}
                  >Confirm</button>
                  <button
                    style={{ background: '#fff', color: '#a30000', border: '1px solid #a30000', borderRadius: 0, padding: '2px 10px', marginLeft: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setToast({ show: false, msg: '', type: 'success' }); }}
                  >Cancel</button>
                </span>
              ),
              type: 'error',
            });
          }}
        >Delete {category}</button>
      </div>
      {/* Add/Edit Item Modal */}
      {(showAddItem || showAddItem === 'edit') && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 0,
            border: '2px solid #888',
            minWidth: 800,
            maxWidth: 1000,
            width: '90%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 24,
            position: 'relative',
          }}>
            <button
              onClick={() => { setShowAddItem(false); setEditItem(null); }}
              style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 20, color: '#888', cursor: 'pointer', zIndex: 10 }}
              aria-label="Close"
            >&times;</button>
            <CategoryForm
              category={category}
              collectionName={collectionName}
              onItemAdded={handleItemAdded}
              onItemUpdated={handleItemUpdated}
              onClose={() => { setShowAddItem(false); setEditItem(null); }}
              showToast={showToast}
              editItem={showAddItem === 'edit' ? editItem : null}
              mode={showAddItem === 'edit' ? 'edit' : 'add'}
              columnDefinitions={columnDefinitions}
              filterMaps={filterMaps}
            />
          </div>
        </div>
      )}
      {/* Filter row */}
      {filterDefinitions && filterDefinitions.length > 0 && (
        <div className="mb-2" style={{ display: 'flex', alignItems: 'center', fontSize: 13, margin: 0, padding: 0 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            {filterDefinitions.map(filterDef => (
              <div key={filterDef.name} style={{ flex: 1, minWidth: 0 }}>
                <MultiSelect
                  options={getFilterOptions(filterDef.name)}
                  value={filters?.[filterDef.name] || []}
                  onChange={vals => setFilters(f => ({ ...f, [filterDef.name]: vals }))}
                  placeholder={`All ${filterDef.label || filterDef.name}`}
                />
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <button
                  className="btn btn-secondary mb-0 sharp-btn"
                  style={{ width: '100%', borderRadius: 0, fontSize: 13, padding: '4px 10px', border: '1px solid #888', minHeight: 32 }}
                  onClick={() => setShowColumnPicker(true)}
                >Reconfigure Columns</button>
                {showColumnPicker && (
                  <ColumnPicker
                    options={columnDefinitions}
                    selected={visibleColumns}
                    onChange={setVisibleColumns}
                    onClose={() => setShowColumnPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && <p>Loading {category.toLowerCase()}s...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && items.length === 0 && !error && <p>No {category.toLowerCase()}s found.</p>}
      {/* Table with clickable rows */}
      {!loading && items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped category-table">
            <thead>
              <tr>
                {columnDefinitions.filter(col => visibleColumns.includes(col.value)).map(col => (
                  <th key={col.value}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  {columnDefinitions.filter(col => visibleColumns.includes(col.value)).map((col, index) => {
                    // Make first column clickable
                    if (index === 0) {
                      return (
                        <td key={col.value} style={{ cursor: 'pointer', color: '#3d0066', textDecoration: 'underline' }}
                          onClick={() => setEditItem(item)}
                        >{item[col.value] || '-'}</td>
                      );
                    }
                    
                    // Handle reference fields
                    if (col.isRef && filterMaps[col.refMapName]) {
                      return <td key={col.value}>{filterMaps[col.refMapName][item[col.value]] || item[col.value] || '-'}</td>;
                    }
                    
                    // Default rendering
                    return <td key={col.value}>{item[col.value] || '-'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Toast message */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 3000,
          minWidth: 260,
          background: toast.type === 'error' ? '#a30000' : '#3d0066',
          color: '#fff',
          borderRadius: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          padding: '14px 24px',
          fontSize: 15,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ color: '#fff' }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
