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
      <style>{`
        .um-tiles-grid {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 16px !important;
          margin-bottom: 24px !important;
          width: 100% !important;
        }
        @media (max-width: 900px) {
          .um-tiles-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .um-tiles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .um-tiles-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
        }
        .um-tile {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>
      {/* Category navigation */}
      <div className="um-tiles-grid">
        {categories.map(({ label, icon }) => (
          <div
            key={label}
            className="um-tile"
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
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
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