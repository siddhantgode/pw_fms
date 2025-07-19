import React, { useState, useRef, useEffect } from 'react';

// Multi-select dropdown with search
export function MultiSelect({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle selection of an option
  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #888',
          padding: '6px 12px',
          borderRadius: 0,
          cursor: 'pointer',
          backgroundColor: '#fff',
          minHeight: 32
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value.length > 0 
            ? `${value.length} selected`
            : placeholder || 'Select options'}
        </div>
        <div>{isOpen ? '▲' : '▼'}</div>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: '#fff',
          border: '1px solid #888',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          maxHeight: 250,
          overflowY: 'auto',
          borderRadius: 0
        }}>
          {/* Search input */}
          <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: 0,
                fontSize: 12
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Select all/none */}
          <div 
            style={{ 
              padding: '8px 12px', 
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onChange(filteredOptions); 
              }}
              style={{
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: '#3d0066'
              }}
            >
              Select All
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onChange([]); 
              }}
              style={{
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: '#3d0066'
              }}
            >
              Clear All
            </button>
          </div>
          
          {/* Options list */}
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', color: '#888' }}>No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <div 
                key={option}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: value.includes(option) ? '#f0e6ff' : '#fff',
                  borderBottom: '1px solid #eee'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(option);
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => {}}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontSize: 13 }}>{option}</span>
                </label>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Column picker component
export function ColumnPicker({ options, selected, onChange, onClose }) {
  return (
    <div 
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        border: '1px solid #888',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: 250,
        maxHeight: 350,
        overflowY: 'auto',
        borderRadius: 0,
        padding: '12px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 14 }}>Configure Columns</div>
      {options.map((option) => (
        <div 
          key={option.value}
          style={{
            padding: '6px 0',
            borderBottom: '1px solid #eee'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => {
                if (selected.includes(option.value)) {
                  onChange(selected.filter(s => s !== option.value));
                } else {
                  onChange([...selected, option.value]);
                }
              }}
              style={{ marginRight: 8 }}
            />
            <span style={{ fontSize: 13 }}>{option.label}</span>
          </label>
        </div>
      ))}
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => onChange(options.map(opt => opt.value))}
          style={{
            padding: '4px 8px',
            fontSize: 12,
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: 0,
            cursor: 'pointer'
          }}
        >
          Select All
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '4px 8px',
            fontSize: 12,
            backgroundColor: '#3d0066',
            color: '#fff',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
