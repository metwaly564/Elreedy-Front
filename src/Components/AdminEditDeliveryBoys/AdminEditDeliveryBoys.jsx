import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import style from './AdminEditDeliveryBoys.module.css';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditDeliveryBoys() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentDeliveryBoy, setCurrentDeliveryBoy] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const TestToken = localStorage.getItem('userToken');


  // Constants for pagination
  const ITEMS_PER_PAGE = 10;

  // Fetch delivery boys
  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/users/all-deliveryBoys', {
          headers: {
            'Access-Token': TestToken
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDeliveryBoys(data);
        toast.success('Delivery boys loaded successfully');
      } catch (error) {
        setError(error.message);
        toast.error(`Error loading delivery boys: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryBoys();
  }, [TestToken]);

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter delivery boys
  const sortedAndFilteredDeliveryBoys = useMemo(() => {
    let sortableDeliveryBoys = [...deliveryBoys];
    
    // Filtering
    if (searchTerm) {
      sortableDeliveryBoys = sortableDeliveryBoys.filter(deliveryBoy => 
        deliveryBoy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryBoy.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deliveryBoy.id.toString().includes(searchTerm)
      );
    }
    
    // Sorting
    if (sortConfig.key) {
      sortableDeliveryBoys.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableDeliveryBoys;
  }, [deliveryBoys, sortConfig, searchTerm]);

  // Pagination logic
  const pageCount = Math.ceil(sortedAndFilteredDeliveryBoys.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentDeliveryBoys = sortedAndFilteredDeliveryBoys.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      phone: ''
    });
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEdit = (deliveryBoy) => {
    setCurrentDeliveryBoy(deliveryBoy);
    setFormData({
      name: deliveryBoy.name,
      phone: deliveryBoy.phone
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/v1/users/deliveryBoy/${id}`, {
        method: 'DELETE',
        headers: {
          'Access-Token': TestToken
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete delivery boy');
      }

      setDeliveryBoys(deliveryBoys.filter(deliveryBoy => deliveryBoy.id !== id));
      setDeleteConfirm(null);
      toast.success('Delivery boy deleted successfully');
    } catch (err) {
      toast.error(`Error deleting delivery boy: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/users/delivery-boy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add delivery boy');
      }

      const result = await response.text();
      toast.success(result);
      
      // Refresh the list
      const fetchResponse = await fetch('http://127.0.0.1:3000/api/v1/users/all-deliveryBoys', {
        headers: {
          'Access-Token': TestToken
        }
      });
      const data = await fetchResponse.json();
      setDeliveryBoys(data);
      
      setShowAddForm(false);
      setFormData({
        name: '',
        phone: ''
      });
    } catch (err) {
      toast.error(`Error adding delivery boy: ${err.message}`);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/users/delivery-boy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({
          id: currentDeliveryBoy.id,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update delivery boy');
      }

      const result = await response.text();
      toast.success(result);
      
      // Refresh the list
      const fetchResponse = await fetch('http://127.0.0.1:3000/api/v1/users/all-deliveryBoys', {
        headers: {
          'Access-Token': TestToken
        }
      });
      const data = await fetchResponse.json();
      setDeliveryBoys(data);
      
      setShowEditForm(false);
      setCurrentDeliveryBoy(null);
      setFormData({
        name: '',
        phone: ''
      });
    } catch (err) {
      toast.error(`Error updating delivery boy: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
    <div className='flex flex-col justify-center p-4 font-alexandria font-light'>
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <button 
          onClick={handleAdd}
          className='p-2 bg-blue-600 text-white rounded-lg w-[12em] text-center'
        >
          Add New Delivery Boy
        </button>
        
        <div className="flex-grow md:max-w-md">
          <input
            type="text"
            placeholder="Search delivery boys..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      {/* Add Delivery Boy Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Delivery Boy</h3>
          <form onSubmit={handleSubmitAdd}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Add Delivery Boy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Delivery Boy Form */}
      {showEditForm && currentDeliveryBoy && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Delivery Boy</h3>
          <form onSubmit={handleSubmitEdit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="edit-name">
                Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="edit-phone">
                Phone
              </label>
              <input
                type="text"
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Delivery Boy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Boys Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="p-3 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('id')}
              >
                ID {sortConfig.key === 'id' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('name')}
              >
                Name {sortConfig.key === 'name' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('phone')}
              >
                Phone {sortConfig.key === 'phone' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Controls</th>
            </tr>
          </thead>
          <tbody>
            {currentDeliveryBoys.length > 0 ? (
              currentDeliveryBoys.map((deliveryBoy) => (
                <tr key={deliveryBoy.id} className="border-t">
                  <td className="p-3">{deliveryBoy.id}</td>
                  <td className="p-3">{deliveryBoy.name}</td>
                  <td className="p-3">{deliveryBoy.phone}</td>
                  <td className="p-3">
                    {deliveryBoy.isDeleted ? (
                      <span className="text-red-600">Deleted</span>
                    ) : (
                      <span className="text-red-600">Active</span>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => handleEdit(deliveryBoy)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                      onClick={() => setDeleteConfirm({
                        id: deliveryBoy.id,
                        name: deliveryBoy.name
                      })}
                      disabled={deliveryBoy.isDeleted}
                    >
                      {deliveryBoy.isDeleted ? 'Deleted' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No delivery boys found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedAndFilteredDeliveryBoys.length > ITEMS_PER_PAGE && (
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
            <h3 className="text-lg font-semibold mb-4">Confirm Delete Delivery Boy</h3>
            <p className="mb-4">
              Are you sure you want to delete delivery boy "{deleteConfirm.name}" (ID: {deleteConfirm.id})?
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
    </div>
    </>
  );
}