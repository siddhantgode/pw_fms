import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTruck, faStore, faHeadset, faStar } from '@fortawesome/free-solid-svg-icons';
import StaffTable from './StaffTable';
import CategoryTable from './CategoryTable';
import { 
  staffFields, 
  driverFields, 
  vendorFields, 
  supportFields, 
  importantFields,
  defaultVisibleColumns,
  collectionNames,
  filterDefinitions
} from './categoryFields';

const UserManagement = () => {
  const [activeCategory, setActiveCategory] = useState('Staff'); // Default category

  // Category configurations
  const categories = [
    { label: 'Staff', icon: faUsers, fields: staffFields, collection: collectionNames.staff },
    { label: 'Drivers', icon: faTruck, fields: driverFields, collection: collectionNames.driver },
    { label: 'Vendors', icon: faStore, fields: vendorFields, collection: collectionNames.vendor },
    { label: 'Support', icon: faHeadset, fields: supportFields, collection: collectionNames.support },
    { label: 'Important', icon: faStar, fields: importantFields, collection: collectionNames.important }
  ];

  // Get current category configuration
  const currentCategory = categories.find(cat => cat.label === activeCategory);

  return (
    <div className="container-fluid mt-4 px-4">
      <h1 className="mb-2">User Management</h1>
      
      {/* Category navigation */}
      <div className="row justify-content-center" style={{ gap: '16px', marginBottom: '24px' }}>
        {categories.map(({ label, icon }) => (
          <div
            key={label}
            className="col-6 col-md-2 mb-2 d-flex justify-content-center"
            style={{ minWidth: 120 }}
          >
            <div
              className="tile shadow-sm d-flex flex-row align-items-center justify-content-start"
              onClick={() => setActiveCategory(label)}
              style={{
                height: 38,
                width: 140,
                borderRadius: 0,
                border: activeCategory === label ? '2px solid #3d0066' : '1px solid #3d0066',
                background: activeCategory === label ? '#3d0066' : '#fff',
                color: activeCategory === label ? '#fff' : '#3d0066',
                boxShadow: activeCategory === label ? '0 4px 16px rgba(61,0,102,0.10)' : '0 2px 8px rgba(61,0,102,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: '0 10px',
                margin: 0,
                fontWeight: 500,
                fontSize: 13,
                letterSpacing: 0.2,
                outline: activeCategory === label ? '2px solid #3d0066' : 'none',
                outlineOffset: 0,
                position: 'relative',
              }}
            >
              <FontAwesomeIcon icon={icon} size="lg" style={{ marginRight: 10, color: activeCategory === label ? '#fff' : '#3d0066', fontSize: 18, transition: 'color 0.2s' }} />
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
              {activeCategory === label && (
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 10,
                  width: 120,
                  height: 2,
                  borderRadius: 0,
                  background: '#fff',
                  opacity: 0.7,
                  display: 'block',
                }}></span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Staff table (using legacy component) */}
      {activeCategory === 'Staff' && (
        <div className="mb-3">
          <StaffTable />
        </div>
      )}
      
      {/* Other category tables (using new generic component) */}
      {activeCategory !== 'Staff' && currentCategory && (
        <div className="mb-3">
          <CategoryTable 
            category={currentCategory.label}
            collectionName={currentCategory.collection}
            columnDefinitions={currentCategory.fields}
            initialVisibleColumns={defaultVisibleColumns[currentCategory.collection.replace('s', '')]}
            filterDefinitions={filterDefinitions[currentCategory.collection.replace('s', '')]}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;