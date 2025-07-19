// Category field definitions

// Staff category fields
export const staffFields = [
  { value: 'firstName', label: 'First Name', type: 'text', required: true },
  { value: 'lastName', label: 'Last Name', type: 'text', required: true },
  { value: 'empId', label: 'Employee ID', type: 'text', required: true },
  { value: 'emailId', label: 'Email', type: 'email', required: true },
  { value: 'mobileNo', label: 'Mobile Number', type: 'tel', required: true },
  { value: 'designation', label: 'Designation', type: 'select', options: [
    'Manager', 'Supervisor', 'Team Lead', 'Staff', 'Trainee'
  ], required: true },
  { value: 'team', label: 'Team', type: 'select', options: [
    'Front Office', 'Housekeeping', 'F&B', 'Maintenance', 'Security', 'Administration'
  ], required: true },
  { value: 'defaultLocation', label: 'Default Location', type: 'text' },
  { value: 'aadharNo', label: 'Aadhar Number', type: 'text' },
  { value: 'panNo', label: 'PAN Number', type: 'text' },
  { value: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'], required: true },
  { value: 'joiningDate', label: 'Joining Date', type: 'date' },
  { value: 'address', label: 'Address', type: 'textarea' },
  { value: 'emergencyContact', label: 'Emergency Contact', type: 'tel' },
  { value: 'bloodGroup', label: 'Blood Group', type: 'select', options: [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ]},
  { value: 'createdAt', label: 'Created At', type: 'datetime', hidden: true }
];

// Driver category fields
export const driverFields = [
  { value: 'firstName', label: 'First Name', type: 'text', required: true },
  { value: 'lastName', label: 'Last Name', type: 'text', required: true },
  { value: 'driverId', label: 'Driver ID', type: 'text', required: true },
  { value: 'mobileNo', label: 'Mobile Number', type: 'tel', required: true },
  { value: 'emailId', label: 'Email', type: 'email' },
  { value: 'licenseNo', label: 'License Number', type: 'text', required: true },
  { value: 'licenseExpiry', label: 'License Expiry', type: 'date', required: true },
  { value: 'vehicleType', label: 'Vehicle Type', type: 'select', options: [
    'Car', 'Van', 'Bus', 'Truck', 'Two-wheeler'
  ], required: true },
  { value: 'vehicleNo', label: 'Vehicle Number', type: 'text', required: true },
  { value: 'aadharNo', label: 'Aadhar Number', type: 'text' },
  { value: 'address', label: 'Address', type: 'textarea' },
  { value: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'], required: true },
  { value: 'joiningDate', label: 'Joining Date', type: 'date' },
  { value: 'emergencyContact', label: 'Emergency Contact', type: 'tel' },
  { value: 'createdAt', label: 'Created At', type: 'datetime', hidden: true }
];

// Vendor category fields
export const vendorFields = [
  { value: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
  { value: 'vendorId', label: 'Vendor ID', type: 'text', required: true },
  { value: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
  { value: 'mobileNo', label: 'Mobile Number', type: 'tel', required: true },
  { value: 'emailId', label: 'Email', type: 'email', required: true },
  { value: 'category', label: 'Category', type: 'select', options: [
    'Food Supplier', 'Maintenance', 'Housekeeping', 'Electronics', 'Furniture', 'Stationery', 'Other'
  ], required: true },
  { value: 'gstNo', label: 'GST Number', type: 'text' },
  { value: 'panNo', label: 'PAN Number', type: 'text' },
  { value: 'address', label: 'Address', type: 'textarea', required: true },
  { value: 'city', label: 'City', type: 'text', required: true },
  { value: 'state', label: 'State', type: 'text', required: true },
  { value: 'pincode', label: 'Pincode', type: 'text', required: true },
  { value: 'bankName', label: 'Bank Name', type: 'text' },
  { value: 'accountNo', label: 'Account Number', type: 'text' },
  { value: 'ifscCode', label: 'IFSC Code', type: 'text' },
  { value: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Blacklisted'], required: true },
  { value: 'remarks', label: 'Remarks', type: 'textarea' },
  { value: 'createdAt', label: 'Created At', type: 'datetime', hidden: true }
];

// Support category fields
export const supportFields = [
  { value: 'name', label: 'Name', type: 'text', required: true },
  { value: 'supportId', label: 'Support ID', type: 'text', required: true },
  { value: 'department', label: 'Department', type: 'select', options: [
    'IT', 'HR', 'Finance', 'Operations', 'Maintenance', 'General'
  ], required: true },
  { value: 'mobileNo', label: 'Mobile Number', type: 'tel', required: true },
  { value: 'emailId', label: 'Email', type: 'email', required: true },
  { value: 'designation', label: 'Designation', type: 'text', required: true },
  { value: 'company', label: 'Company', type: 'text', required: true },
  { value: 'location', label: 'Location', type: 'text' },
  { value: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true },
  { value: 'remarks', label: 'Remarks', type: 'textarea' },
  { value: 'createdAt', label: 'Created At', type: 'datetime', hidden: true }
];

// Important Contacts category fields
export const importantFields = [
  { value: 'name', label: 'Name', type: 'text', required: true },
  { value: 'category', label: 'Category', type: 'select', options: [
    'Emergency', 'Police', 'Fire', 'Medical', 'Utility', 'Government', 'Other'
  ], required: true },
  { value: 'contactNo', label: 'Contact Number', type: 'tel', required: true },
  { value: 'alternateNo', label: 'Alternate Number', type: 'tel' },
  { value: 'emailId', label: 'Email', type: 'email' },
  { value: 'address', label: 'Address', type: 'textarea' },
  { value: 'description', label: 'Description', type: 'textarea', required: true },
  { value: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
  { value: 'createdAt', label: 'Created At', type: 'datetime', hidden: true }
];

// Define default visible columns for each category
export const defaultVisibleColumns = {
  staff: ['firstName', 'lastName', 'empId', 'mobileNo', 'emailId', 'designation', 'team', 'status'],
  driver: ['firstName', 'lastName', 'driverId', 'mobileNo', 'licenseNo', 'vehicleNo', 'status'],
  vendor: ['vendorName', 'vendorId', 'contactPerson', 'mobileNo', 'emailId', 'category', 'status'],
  support: ['name', 'supportId', 'department', 'mobileNo', 'emailId', 'company', 'status'],
  important: ['name', 'category', 'contactNo', 'description', 'priority']
};

// Define collection names for each category
export const collectionNames = {
  staff: 'staff',
  driver: 'drivers',
  vendor: 'vendors',
  support: 'supports',
  important: 'importantContacts'
};

// Define filter definitions for each category
export const filterDefinitions = {
  staff: [
    { name: 'team', label: 'Team', itemField: 'team' },
    { name: 'designation', label: 'Designation', itemField: 'designation' },
    { name: 'status', label: 'Status', itemField: 'status' }
  ],
  driver: [
    { name: 'vehicleType', label: 'Vehicle Type', itemField: 'vehicleType' },
    { name: 'status', label: 'Status', itemField: 'status' }
  ],
  vendor: [
    { name: 'category', label: 'Category', itemField: 'category' },
    { name: 'status', label: 'Status', itemField: 'status' },
    { name: 'city', label: 'City', itemField: 'city' }
  ],
  support: [
    { name: 'department', label: 'Department', itemField: 'department' },
    { name: 'status', label: 'Status', itemField: 'status' }
  ],
  important: [
    { name: 'category', label: 'Category', itemField: 'category' },
    { name: 'priority', label: 'Priority', itemField: 'priority' }
  ]
};
