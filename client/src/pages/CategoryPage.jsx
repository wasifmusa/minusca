import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as api from '../services/api';
import './CategoryPage.css';

function CategoryPage() {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchItems = useCallback(() => {
    api.getItemsByCategory(categoryName)
      .then(res => setItems(res.data))
      .catch(console.error);
  }, [categoryName]);

  useEffect(() => {
    fetchItems();
    api.getCategories()
      .then(res => {
        const currentCategory = res.data.find(c => c.name === decodeURIComponent(categoryName));
        setCategory(currentCategory);
      })
  }, [categoryName, fetchItems]);

  const filteredItems = useMemo(() =>
    items.filter(item =>
      (item.nomenclature?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ), [items, searchTerm]);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.exportCategory(categoryName);
      const csvData = await response.data.text();

      const lines = csvData.trim().split('\n');
      const body = lines.slice(1).map(line => {
        // This is a simple CSV parser that handles quoted fields.
        const cells = [];
        let currentCell = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                cells.push(currentCell.replace(/^"|"$/g, ''));
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        cells.push(currentCell.replace(/^"|"$/g, ''));
        return cells;
      });

      const displayHeaders = [ "Ser", "Nomenclature", "Description", "Ledger Svc", "Ledger Rep", "Ledger U/S", "Ground Svc", "Ground Rep", "Ground U/S", "Remarks"];

      const doc = new jsPDF({ orientation: 'landscape' });
      
      doc.setFontSize(18);
      doc.text(`${decodeURIComponent(categoryName)} Inventory Report`, 14, 22);

      autoTable(doc, {
        head: [displayHeaders],
        body: body,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [52, 93, 157] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 40 },
            2: { cellWidth: 'auto' },
            9: { cellWidth: 40 },
        }
      });

      doc.save(`${decodeURIComponent(categoryName)}-inventory.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleAddNew = () => {
    const newId = `new-${Date.now()}`;
    const newRow = { 
      id: newId, serial_number: (items.length > 0 ? Math.max(...items.map(i => i.serial_number)) + 1 : 1), 
      nomenclature: '', description: '', ledger_bal_svc: 0, ledger_bal_rep: 0, ledger_bal_us: 0,
      ground_bal_svc: 0, ground_bal_rep: 0, ground_bal_us: 0, remarks: '', isNew: true
    };
    setItems(prevItems => [...prevItems, newRow]);
    handleEdit(newRow);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleCancel = () => {
    if (String(editingId).startsWith('new-')) {
      setItems(items.filter(item => item.id !== editingId));
    }
    setEditingId(null);
  };

  const handleSave = async () => {
    const { id, isNew, ...formData } = editFormData;
    const payload = { ...formData, category_id: category.id };
    delete payload.id;

    try {
      if (isNew) {
        await api.createItem(payload);
      } else {
        await api.updateItem(id, payload);
      }
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditFormData({ ...editFormData, [name]: type === 'number' ? parseInt(value, 10) || 0 : value });
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await api.deleteItem(itemId);
        fetchItems();
        setEditingId(null);
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Could not delete the item. Please try again.");
      }
    }
  };

  const renderRow = (item) => {
    const isEditing = editingId === item.id;
    const data = isEditing ? editFormData : item;
    const total = (data.ledger_bal_svc || 0) + (data.ledger_bal_rep || 0) + (data.ground_bal_svc || 0) + (data.ground_bal_rep || 0);

    if (isEditing) {
      return (
        <tr key={data.id}>
          <td className="serial-cell">
            {!data.isNew && <button onClick={() => handleDelete(data.id)} className="btn-delete">×</button>}
            <input type="number" name="serial_number" value={data.serial_number} onChange={handleFormChange} />
          </td>
          <td><input type="text" name="nomenclature" value={data.nomenclature} onChange={handleFormChange} /></td>
          <td><input type="text" name="description" value={data.description} onChange={handleFormChange} /></td>
          <td><input type="number" name="ledger_bal_svc" value={data.ledger_bal_svc} onChange={handleFormChange} /></td>
          <td><input type="number" name="ledger_bal_rep" value={data.ledger_bal_rep} onChange={handleFormChange} /></td>
          <td><input type="number" name="ledger_bal_us" value={data.ledger_bal_us} onChange={handleFormChange} /></td>
          <td><input type="number" name="ground_bal_svc" value={data.ground_bal_svc} onChange={handleFormChange} /></td>
          <td><input type="number" name="ground_bal_rep" value={data.ground_bal_rep} onChange={handleFormChange} /></td>
          <td><input type="number" name="ground_bal_us" value={data.ground_bal_us} onChange={handleFormChange} /></td>
          <td>{total}</td>
          <td><input type="text" name="remarks" value={data.remarks} onChange={handleFormChange} /></td>
          <td><button onClick={handleSave} className="btn-save">Save</button><button onClick={handleCancel} className="btn-cancel">Cancel</button></td>
        </tr>
      );
    }
    return (
      <tr key={item.id}>
        <td>{item.serial_number}</td><td>{item.nomenclature}</td><td>{item.description}</td><td>{item.ledger_bal_svc}</td><td>{item.ledger_bal_rep}</td><td>{item.ledger_bal_us}</td><td>{item.ground_bal_svc}</td><td>{item.ground_bal_rep}</td><td>{item.ground_bal_us}</td><td>{total}</td><td>{item.remarks}</td>
        {isAdmin && <td><button onClick={() => handleEdit(item)}>Edit</button></td>}
      </tr>
    );
  };

  return (
    <div className="category-page">
      <div className="controls-container">
        <div className="action-buttons">
          {isAdmin && <button onClick={handleAddNew} disabled={editingId !== null}>Add new item</button>}
          <button onClick={handleDownloadPdf}>Download as PDF</button>
        </div>
        <div className="search-bar">
          <label htmlFor="search">Search</label>
          <input 
            type="text" 
            id="search" 
            placeholder="Search by name or desc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <h2 style={{ textTransform: 'capitalize', marginBottom: '1.5rem' }}>{decodeURIComponent(categoryName)}</h2>
      <div className='table-wrapper' id="inventory-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan="2">Ser</th><th rowSpan="2">Nomenclature</th><th rowSpan="2">Description</th><th colSpan="3">Ledger bal</th><th colSpan="3">Ground Bal</th><th rowSpan="2">Total available</th><th rowSpan="2">Remarks</th>
              {isAdmin && <th rowSpan="2">Edit</th>}
            </tr>
            <tr>
              <th>svc</th><th>rep</th><th>u/s</th><th>svc</th><th>rep</th><th>u/s</th>
            </tr>
          </thead>
          <tbody>{filteredItems.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryPage;
