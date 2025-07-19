import { faList, faExchangeAlt, faBook, faPlane, faChartBar, faClipboardList, faUtensils, faHome, faWarehouse, faUsers } from '@fortawesome/free-solid-svg-icons';

const tileOptions = [
  // Front Office
  { label: 'Transaction Register', icon: faList, path: '/transaction-register', section: 'Front Office' },
  { label: 'Shift Handover', icon: faExchangeAlt, path: '/shift-handover', section: 'Front Office' },
  { label: 'Log Book', icon: faBook, path: '/log-book', section: 'Front Office' },
  { label: 'Travel Desk', icon: faPlane, path: '/travel-desk', section: 'Front Office' },
  { label: 'Front Office Checklists', icon: faClipboardList, path: '/front-office-checklist', section: 'Front Office' },
  // Housekeeping
  { label: 'Housekeeping Checklists', icon: faHome, path: '/housekeeping-checklist', section: 'Housekeeping' },
  // F&B
  { label: 'Restaurant Checklists', icon: faUtensils, path: '/restaurant-checklist', section: 'F&B' },
  // Stores
  { label: 'Stores Checklists', icon: faWarehouse, path: '/stores-checklist', section: 'Stores' },
  // Team Lead
  { label: 'Reports', icon: faChartBar, path: '/reports', section: 'Team Lead' },
  { label: 'User Management', icon: faUsers, path: '/user-management', section: 'Team Lead' },
];

export default tileOptions;