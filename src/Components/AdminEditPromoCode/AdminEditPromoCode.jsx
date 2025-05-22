import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

export default function AdminEditPromoCode() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  
  const TestToken = localStorage.getItem('userToken');
  const ITEMS_PER_PAGE = 10;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch promoCodes
        const promoCodesRes = await fetch('http://127.0.0.1:3000/api/v1/promocodes', {
          headers: { 'Access-Token': TestToken }
        });
        const promoCodesData = await promoCodesRes.json();
        setPromoCodes(promoCodesData.promoCodes || []);

        // Fetch cities
        const citiesRes = await fetch('http://127.0.0.1:3000/api/v1/places/city', {
          headers: { 'Access-Token': TestToken }
        });
        setCities(await citiesRes.json());

        // Fetch categories
        const categoriesRes = await fetch('http://127.0.0.1:3000/api/v1/categories', {
          headers: { 'Access-Token': TestToken }
        });
        setCategories(await categoriesRes.json());

        // Fetch users
        setLoadingUsers(true);
        const usersRes = await fetch('http://127.0.0.1:3000/api/v1/users', {
          headers: { 'Access-Token': TestToken }
        });
        const usersData = await usersRes.json();
        const customerUsers = Array.isArray(usersData) 
          ? usersData.filter(user => user.role === 'customer')
          : usersData.users?.filter(user => user.role === 'customer') || [];
        setUsers(customerUsers);

        toast.success('Data loaded successfully');
      } catch (error) {
        setError(error.message);
        toast.error(`Error loading data: ${error.message}`);
      } finally {
        setLoading(false);
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [TestToken]);

  // Sort and filter promoCodes
  const sortedAndFilteredPromoCodes = [...promoCodes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  }).filter(promoCode => 
    promoCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promoCode.id.toString().includes(searchTerm) ||
    (promoCode.name && promoCode.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const pageCount = Math.ceil(sortedAndFilteredPromoCodes.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPromoCodes = sortedAndFilteredPromoCodes.slice(offset, offset + ITEMS_PER_PAGE);

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    });
  };

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleDelete = async (id) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/promocodes/promocode', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete promo code');
      
      setPromoCodes(promoCodes.filter(promoCode => promoCode.id !== id));
      setDeleteConfirm(null);
      toast.success('Promo code deleted successfully');
    } catch (err) {
      toast.error(`Error deleting promo code: ${err.message}`);
    }
  };

  const fetchPromoCodeDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/v1/promocodes/promocode/${id}`, {
        headers: { 'Access-Token': TestToken }
      });
      if (!response.ok) throw new Error('Failed to fetch details');
      return (await response.json()).promoCode;
    } catch (err) {
      toast.error(`Error fetching details: ${err.message}`);
      return null;
    }
  };

  const handleEditClick = async (promoCode) => {
    const details = await fetchPromoCodeDetails(promoCode.id);
    if (details) {
      setEditModal({
        id: details.id,
        code: details.code,
        name: details.name,
        discountType: details.discountType,
        value: details.value,
        usageType: details.usageType,
        target: details.target,
        isActive: details.isActive,
        budget: details.budget,
        currentBudget: details.currentBudget,
        discountLimit: details.discountLimit,
        applyToDiscounted: details.applyToDiscounted,
        expirationDate: details.expirationDate?.split('T')[0] || '',
        categories: details.categories?.map(c => c.id) || [],
        users: details.usedBy?.map(u => u.id) || [],
        cities: details.cities?.map(c => c.id) || [],
        zones: details.zones?.map(z => z.id) || []
      });
    } else {
      setEditModal({
        ...promoCode,
        categories: [],
        users: [],
        cities: [],
        zones: []
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editModal.code || !editModal.name || !editModal.value || 
          (editModal.usageType === 'multi_use' && !editModal.budget)) {
        toast.error('Please fill all required fields');
        return;
      }

      const dataToSend = {
        id: editModal.id,
        code: editModal.code,
        name: editModal.name,
        discountType: editModal.discountType,
        value: parseFloat(editModal.value),
        usageType: editModal.usageType,
        target: editModal.target,
        isActive: editModal.isActive,
        budget: parseFloat(editModal.budget),
        discountLimit: editModal.discountLimit ? parseFloat(editModal.discountLimit) : null,
        applyToDiscounted: editModal.applyToDiscounted,
        expirationDate: editModal.expirationDate || null,
        categories: editModal.categories,
        cities: editModal.cities,
        zones: editModal.zones,
        userId: editModal.users
      };

      const response = await fetch('http://127.0.0.1:3000/api/v1/promocodes/promocode', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update promo code');
      }

      const updatedData = await response.json();
      setPromoCodes(promoCodes.map(pc => pc.id === editModal.id ? updatedData.promoCode : pc));
      setEditModal(null);
      toast.success(updatedData.message || 'Promo code updated successfully');
    } catch (err) {
      toast.error(`Error updating promo code: ${err.message}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleUserSelection = (userId) => {
    setEditModal(prev => ({
      ...prev,
      users: prev.users.includes(userId) 
        ? prev.users.filter(id => id !== userId)
        : [...prev.users, userId]
    }));
  };

  const toggleCategorySelection = (categoryId) => {
    setEditModal(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleCitySelection = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    const isAdding = !editModal.cities.includes(cityId);

    setEditModal(prev => {
      const newCities = isAdding 
        ? [...prev.cities, cityId]
        : prev.cities.filter(id => id !== cityId);

      const newZones = isAdding
        ? [...new Set([...prev.zones, ...city.zones.map(z => z.id)])]
        : prev.zones.filter(zoneId => 
            !city.zones.some(z => z.id === zoneId)
          );

      return {
        ...prev,
        cities: newCities,
        zones: newZones
      };
    });
  };

  const toggleZoneSelection = (zoneId) => {
    setEditModal(prev => ({
      ...prev,
      zones: prev.zones.includes(zoneId)
        ? prev.zones.filter(id => id !== zoneId)
        : [...prev.zones, zoneId]
    }));
  };

  const selectAllUsers = () => {
    setEditModal(prev => ({
      ...prev,
      users: users.map(user => user.id)
    }));
  };

  const deselectAllUsers = () => {
    setEditModal(prev => ({
      ...prev,
      users: []
    }));
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length > 0 && results.data[0].ids) {
          const ids = results.data.map(row => parseInt(row.ids)).filter(id => !isNaN(id));
          setEditModal(prev => ({
            ...prev,
            users: [...new Set([...prev.users, ...ids])]
          }));
          toast.success(`Added ${ids.length} user IDs from CSV`);
        } else {
          toast.error('CSV must contain an "ids" column');
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col justify-center p-4 font-alexandria font-light">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <Link to="/AdminAddNewPromoCode" className="p-2 bg-blue-600 text-white rounded-lg w-[12em] text-center">
          Add New Promo Code
        </Link>
        <input
          type="text"
          placeholder="Search promo codes..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
        />
      </div>

      {/* Promo Codes Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('id')}>
                ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('code')}>
                Code {sortConfig.key === 'code' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Discount Type</th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('value')}>
                Value {sortConfig.key === 'value' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('budget')}>
                Budget {sortConfig.key === 'budget' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left">Current Budget</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Controls</th>
            </tr>
          </thead>
          <tbody>
            {currentPromoCodes.length > 0 ? (
              currentPromoCodes.map((promoCode) => (
                <tr key={promoCode.id} className="border-t">
                  <td className="p-3">{promoCode.id}</td>
                  <td className="p-3 font-mono">{promoCode.code}</td>
                  <td className="p-3">{promoCode.name}</td>
                  <td className="p-3 capitalize">{promoCode.usageType.replace('_', ' ')}</td>
                  <td className="p-3 capitalize">{promoCode.discountType}</td>
                  <td className="p-3">
                    {promoCode.discountType === 'percentage' ? `${promoCode.value}%` : `${promoCode.value} EGP`}
                  </td>
                  <td className="p-3">{promoCode.budget} EGP</td>
                  <td className="p-3">{promoCode.currentBudget} EGP</td>
                  <td className="p-3">
                    <span className={`inline-block w-4 h-4 rounded-full ${
                      new Date(promoCode.expirationDate) >= new Date() && promoCode.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleEditClick(promoCode)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => setDeleteConfirm({ id: promoCode.id, code: promoCode.code })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-4 text-center text-gray-500">
                  No promo codes found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedAndFilteredPromoCodes.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-4">
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'flex items-center space-x-2'}
            pageClassName={'px-3 py-1 border rounded'}
            pageLinkClassName={'text-white-600'}
            activeClassName={'bg-blue-600 text-white'}
            previousClassName={'px-3 py-1 border rounded'}
            nextClassName={'px-3 py-1 border rounded'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete Promo Code</h3>
            <p className="mb-4">
              Are you sure you want to delete promo code &quot;{deleteConfirm.code}&quot; (ID: {deleteConfirm.id})?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Promo Code</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium mb-1">Code*</label>
                  <input
                    type="text"
                    name="code"
                    value={editModal.code}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={editModal.name}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Type*</label>
                  <select
                    name="usageType"
                    value={editModal.usageType}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="single_use">Single Use</option>
                    <option value="multi_use">Multi Use</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type*</label>
                  <select
                    name="discountType"
                    value={editModal.discountType}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="value">Fixed Value</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Target*</label>
                  <select
                    name="target"
                    value={editModal.target}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="cart">Cart Total</option>
                    <option value="delivery">Delivery Fee</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {editModal.discountType === 'percentage' ? 'Percentage Value*' : 'Fixed Value*'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={editModal.value}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required
                    min="0"
                    max={editModal.discountType === 'percentage' ? 100 : undefined}
                    step={editModal.discountType === 'percentage' ? "1" : "0.01"}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Budget* (for multi-use)</label>
                  <input
                    type="number"
                    name="budget"
                    value={editModal.budget}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    required={editModal.usageType === 'multi_use'}
                    min="0"
                    step="0.01"
                    disabled={editModal.usageType === 'single_use'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Current Budget</label>
                  <input
                    type="number"
                    name="currentBudget"
                    value={editModal.currentBudget}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Automatically calculated by the system
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount Limit</label>
                  <input
                    type="number"
                    name="discountLimit"
                    value={editModal.discountLimit}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    disabled={editModal.discountType !== 'percentage'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={editModal.expirationDate}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editModal.isActive}
                    onChange={handleEditChange}
                    className="mr-2"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="applyToDiscounted"
                    checked={editModal.applyToDiscounted}
                    onChange={handleEditChange}
                    className="mr-2"
                    id="applyToDiscounted"
                  />
                  <label htmlFor="applyToDiscounted" className="text-sm font-medium">Apply to Discounted Items</label>
                </div>

                {/* Categories Section */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Available for Specific Categories</label>
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditModal(prev => ({
                            ...prev,
                            categories: categories.map(category => category.id)
                          }));
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditModal(prev => ({
                            ...prev,
                            categories: []
                          }));
                        }}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded p-2 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={editModal.categories.includes(category.id)}
                            onChange={() => toggleCategorySelection(category.id)}
                            className="mr-2"
                          />
                          <label htmlFor={`category-${category.id}`} className="text-sm truncate">
                            {category.nameEn} / {category.nameAr}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave unselected to make available for all categories
                  </p>
                </div>

                {/* Users Section */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Available for Specific Users</label>
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={selectAllUsers}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        onClick={deselectAllUsers}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  {/* User Dropdown Selection */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <select 
                        className="flex-1 border p-2 rounded"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const userId = parseInt(e.target.value);
                            if (!editModal.users.includes(userId)) {
                              toggleUserSelection(userId);
                            }
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">-- Select User --</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.phone} (ID: {user.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* CSV Upload */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-1">Upload User IDs (CSV):</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <div className="p-2 border rounded cursor-pointer hover:bg-gray-100 text-center">
                          {csvFile ? csvFile.name : 'Select CSV File'}
                        </div>
                      </label>
                      <div className="text-xs text-gray-500">
                        CSV should contain one column named "ids" with user IDs
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Users */}
                  <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                    <h3 className="font-medium mb-2">Selected Users ({editModal.users.length})</h3>
                    {editModal.users.length > 0 ? (
                      <div className="space-y-2">
                        {editModal.users.map(userId => {
                          const user = users.find(u => u.id === userId);
                          return (
                            <div key={userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">
                                {user ? `${user.phone} (ID: ${userId})` : `User ID: ${userId}`}
                              </span>
                              <button
                                onClick={() => toggleUserSelection(userId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">No users selected</div>
                    )}
                  </div>
                </div>

                {/* Cities and Zones Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Available in Specific Cities/Zones</label>
                  <div className="border rounded p-2 max-h-60 overflow-y-auto">
                    {cities.length > 0 ? (
                      cities.map(city => (
                        <div key={city.id} className="mb-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`city-${city.id}`}
                              checked={editModal.cities.includes(city.id)}
                              onChange={() => toggleCitySelection(city.id)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-sm">{city.name}</span>
                          </label>
                          
                          {editModal.cities.includes(city.id) && city.zones?.length > 0 && (
                            <div className="ml-6 mt-2 pl-4 border-l-2 border-gray-200">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Zones:</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {city.zones.map(zone => (
                                  <label key={zone.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`zone-${zone.id}`}
                                      checked={editModal.zones.includes(zone.id)}
                                      onChange={() => toggleZoneSelection(zone.id)}
                                      className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="text-xs">{zone.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">No cities found</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave unselected to make available in all cities/zones
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}