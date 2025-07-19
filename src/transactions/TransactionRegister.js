import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar, GridFilterOperator, GridFilterItem } from '@mui/x-data-grid';
import { FiDownload } from 'react-icons/fi';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Select, MenuItem, Checkbox, ListItemText, InputLabel, FormControl } from '@mui/material';

// Custom filter operator for multi-select
const multiSelectFilterOperator = {
  label: 'is any of',
  value: 'isAnyOf',
  getApplyFilterFn: (filter) => {
    if (!filter.value || !Array.isArray(filter.value) || filter.value.length === 0) {
      return null;
    }
    return (params) => filter.value.includes(params.value);
  },
  InputComponent: (props) => {
    const { item, applyValue, column } = props;
    const options = column.filterOptions || [];

    return (
      <FormControl sx={{ minWidth: 150, m: 1 }}>
        <InputLabel>{column.headerName}</InputLabel>
        <Select
          multiple
          value={item.value || []}
          onChange={(event) => applyValue({ ...item, value: event.target.value })}
          renderValue={(selected) => selected.join(', ')}
          label={column.headerName}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={item.value?.includes(option)} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  },
};

// Options
const costCenterOptions = ['Pearl Accomodation', 'Pearl Restaurant', 'Wellness Accomodation','Wellness Restaurant'];
const txnTypeOptions = ['Paytm Card','Paytm UPI','Mswipe Card','Mswipe UPI','Razorpay', 'Cash', 'Gpay'];

const TransactionRegister = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    guestName: '',
    costCenter: '',
    checkIn: '',
    checkOut: '',
    idsBookingId: '',
    amount: '',
    txnType: '',
    reference: '',
    remarks: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isWalkin, setIsWalkin] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCostCenters, setSelectedCostCenters] = useState([]);
  const [selectedTxnTypes, setSelectedTxnTypes] = useState([]);

  // Fetch transactions from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        console.log('Snapshot data:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const transactionsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date || '',
            guestName: data.guestName || '',
            costCenter: data.costCenter || '',
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
            idsBookingId: data.idsBookingId || '',
            amount: data.amount || '',
            txnType: data.txnType || '',
            reference: data.reference || '',
            remarks: data.remarks || '',
          };
        });
        setAllTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      },
      (error) => {
        console.error('Listen error:', error.message, error.stack);
        alert('Failed to listen to transactions: ' + error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    if (!form.date || !form.guestName || !form.costCenter || !form.amount || !form.txnType || !form.reference) {
      console.log('Validation failed:', form);
      alert('Please fill all required fields');
      return;
    }
    const cleanedForm = {
      date: form.date,
      guestName: form.guestName,
      costCenter: form.costCenter,
      checkIn: isWalkin ? '' : form.checkIn,
      checkOut: isWalkin ? '' : form.checkOut,
      idsBookingId: form.idsBookingId,
      amount: form.amount,
      txnType: form.txnType,
      reference: form.reference,
      remarks: form.remarks,
    };
    console.log('Cleaned form data:', cleanedForm);
    try {
      if (isEditing) {
        if (!form.id) throw new Error('Invalid document ID');
        console.log('Updating document with ID:', form.id);
        await updateDoc(doc(db, 'transactions', form.id), cleanedForm);
        const updatedTxn = { id: form.id, ...cleanedForm };
        setAllTransactions(allTransactions.map((txn) => (txn.id === form.id ? updatedTxn : txn)));
        setFilteredTransactions(filteredTransactions.map((txn) => (txn.id === form.id ? updatedTxn : txn)));
        setIsEditing(false);
        console.log('Document updated successfully');
      } else {
        console.log('Adding new document');
        const docRef = await addDoc(collection(db, 'transactions'), cleanedForm);
        console.log('Document added with ID:', docRef.id);
        const newTxn = { id: docRef.id, ...cleanedForm };
        setAllTransactions([...allTransactions, newTxn]);
        setFilteredTransactions([...filteredTransactions, newTxn]);
        console.log('Transaction saved successfully');
      }
      setForm({
        id: null,
        date: '',
        guestName: '',
        costCenter: '',
        checkIn: '',
        checkOut: '',
        idsBookingId: '',
        amount: '',
        txnType: '',
        reference: '',
        remarks: '',
      });
      setIsWalkin(false);
    } catch (error) {
      console.error('Error saving transaction:', error.message, error.stack);
      alert('Failed to save transaction: ' + error.message);
    }
  };

  const handleEdit = (txn) => {
    setForm(txn);
    setIsEditing(true);
    setIsWalkin(!txn.checkIn && !txn.checkOut);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        console.log('Deleting document with ID:', id);
        await deleteDoc(doc(db, 'transactions', id));
        setAllTransactions(allTransactions.filter((txn) => txn.id !== id));
        setFilteredTransactions(filteredTransactions.filter((txn) => txn.id !== id));
        console.log('Transaction deleted successfully');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction: ' + error.message);
      }
    }
  };

  const handleDeleteActiveEntry = async () => {
    if (isEditing && form.id && window.confirm('Are you sure you want to delete this active entry?')) {
      try {
        console.log('Deleting active entry with ID:', form.id);
        await deleteDoc(doc(db, 'transactions', form.id));
        setAllTransactions(allTransactions.filter((txn) => txn.id !== form.id));
        setFilteredTransactions(filteredTransactions.filter((txn) => txn.id !== form.id));
        setForm({
          id: null,
          date: '',
          guestName: '',
          costCenter: '',
          checkIn: '',
          checkOut: '',
          idsBookingId: '',
          amount: '',
          txnType: '',
          reference: '',
          remarks: '',
        });
        setIsEditing(false);
        setIsWalkin(false);
        console.log('Active entry deleted successfully');
      } catch (error) {
        console.error('Error deleting active entry:', error);
        alert('Failed to delete active entry: ' + error.message);
      }
    } else {
      alert('No active entry to delete.');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['ID,Date,Guest Name,Cost Center,Check In,Check Out,Booking ID,Amount,Txn Type,Reference,Remarks'];
    const rows = filteredTransactions.map((txn) =>
      `${txn.id},${txn.date},${txn.guestName},${txn.costCenter},${txn.checkIn},${txn.checkOut},${txn.idsBookingId},${txn.amount},${txn.txnType},${txn.reference},${txn.remarks}`
    ).join('\n');
    const csvContent = headers.join('\n') + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Filter transactions
  const filterTransactions = () => {
    let filtered = [...allTransactions];
    if (startDate) {
      filtered = filtered.filter((txn) => new Date(txn.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((txn) => new Date(txn.date) <= new Date(endDate));
    }
    if (selectedCostCenters.length > 0) {
      filtered = filtered.filter((txn) => selectedCostCenters.includes(txn.costCenter));
    }
    if (selectedTxnTypes.length > 0) {
      filtered = filtered.filter((txn) => selectedTxnTypes.includes(txn.txnType));
    }
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    filterTransactions();
  }, [startDate, endDate, selectedCostCenters, selectedTxnTypes, allTransactions]);

  const columns = [
    { field: 'date', headerName: 'Date', width: 120, sortable: true },
    { field: 'guestName', headerName: 'Guest Name', width: 150, sortable: true },
    {
      field: 'costCenter',
      headerName: 'Cost Center',
      width: 150,
      sortable: true,
      filterOperators: [multiSelectFilterOperator],
      filterOptions: costCenterOptions,
    },
    { field: 'checkIn', headerName: 'Check In', width: 120, sortable: true },
    { field: 'checkOut', headerName: 'Check Out', width: 120, sortable: true },
    { field: 'idsBookingId', headerName: 'Booking ID', width: 120, sortable: true },
    { field: 'amount', headerName: 'Amount', width: 120, sortable: true },
    {
      field: 'txnType',
      headerName: 'Txn Type',
      width: 120,
      sortable: true,
      filterOperators: [multiSelectFilterOperator],
      filterOptions: txnTypeOptions,
    },
    { field: 'reference', headerName: 'Reference', width: 120, sortable: true },
    { field: 'remarks', headerName: 'Remarks', width: 200, sortable: true },
  ];

  return (
    <div className="transaction-register-container" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      <h1 className="transaction-register-title">Transaction Register</h1>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <form onSubmit={handleSubmit} className="transaction-form" style={{ flexShrink: 0 }}>
          <input
            name="date"
            type="date"
            placeholder="Date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            name="guestName"
            type="text"
            placeholder="Guest Name"
            value={form.guestName}
            onChange={handleChange}
            required
          />
          <select
            name="costCenter"
            value={form.costCenter}
            onChange={handleChange}
            required
          >
            <option value="">Select Cost Center</option>
            <option value="Pearl Accomodation">Pearl Accomodation</option>
            <option value="Wellness Accomodation">Wellness Accomodation</option>
            <option value="Pearl Restaurant">Pearl Restaurant</option>
            <option value="Wellness Restaurant">Wellness Restaurant</option>
          </select>
          {!isWalkin && (
            <>
              <input
                name="checkIn"
                type="date"
                placeholder="Check In"
                value={form.checkIn}
                onChange={handleChange}
              />
              <input
                name="checkOut"
                type="date"
                placeholder="Check Out"
                value={form.checkOut}
                onChange={handleChange}
              />
            </>
          )}
          <input
            name="idsBookingId"
            type="text"
            placeholder="Booking ID"
            value={form.idsBookingId}
            onChange={handleChange}
          />
          <input
            name="amount"
            type="text"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <select
            name="txnType"
            value={form.txnType}
            onChange={handleChange}
            required
          >
            <option value="">Select Transaction Type</option>
            <option value="Paytm Card">Paytm Card</option>
            <option value="Paytm UPI">Paytm UPI</option>
            <option value="Mswipe Card">Mswipe Card</option>
            <option value="Mswipe UPI">Mswipe UPI</option>
            <option value="Razorpay">Razorpay</option>
            <option value="Cash">Cash</option>
            <option value="Gpay">Gpay</option>
          </select>
          <input
            name="reference"
            type="text"
            placeholder="Reference"
            value={form.reference}
            onChange={handleChange}
            required
          />
          <input
            name="remarks"
            type="text"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
          />
          <div className="guest-type-toggle">
            <label>Guest Type:</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isWalkin}
                onChange={() => setIsWalkin(!isWalkin)}
              />
              <span className="slider round"></span>
            </label>
            <span>{isWalkin ? 'Walkin' : 'Room Guest'}</span>
          </div>
          <div className="form-buttons" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                {isEditing ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => setForm({ ...form, date: '', guestName: '', costCenter: '', checkIn: '', checkOut: '', idsBookingId: '', amount: '', txnType: '', reference: '', remarks: '' })} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                Clear
              </button>
              <button type="button" onClick={() => { setForm({ id: null, date: '', guestName: '', costCenter: '', checkIn: '', checkOut: '', idsBookingId: '', amount: '', txnType: '', reference: '', remarks: '' }); setIsEditing(false); setIsWalkin(false); }} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                Reset
              </button>
              <button type="button" onClick={handleDeleteActiveEntry} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                Delete
              </button>
              <button type="button" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                Start Date
              </button>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="button" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
                End Date
              </button>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <FormControl sx={{ minWidth: 150, m: 1 }}>
                <InputLabel>Cost Center</InputLabel>
                <Select
                  multiple
                  value={selectedCostCenters}
                  onChange={(e) => setSelectedCostCenters(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <MenuItem value="">
                    <em>All Cost Centers</em>
                  </MenuItem>
                  {costCenterOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={selectedCostCenters.indexOf(option) > -1} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150, m: 1 }}>
                <InputLabel>Txn Type</InputLabel>
                <Select
                  multiple
                  value={selectedTxnTypes}
                  onChange={(e) => setSelectedTxnTypes(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <MenuItem value="">
                    <em>All Txn Types</em>
                  </MenuItem>
                  {txnTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={selectedTxnTypes.indexOf(option) > -1} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <button type="button" onClick={handleDownloadCSV} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} title="Download CSV">
                <FiDownload />
              </button>
            </div>
          </div>
        </form>

        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            onRowClick={(params) => handleEdit(params.row)}
            filterMode="client"
            slots={{ toolbar: GridToolbar }}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionRegister;