/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import style from './AdminEditCategory.module.css';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditCategory() {
  const TestToken = localStorage.getItem('userToken');
  const [formData, setFormData] = useState({
    id: '',
    nameEn: '',
    nameAr: '',
    rank: '',
    isInNavbar: false,
    ishidden: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { TempCatData } = useContext(UserContext); // Get the stored category data

  useEffect(() => {
    if (TempCatData) {
      setFormData({
        id: TempCatData.id,
        nameEn: TempCatData.nameEn,
        nameAr: TempCatData.nameAr,
        rank: TempCatData.rank,
        isInNavbar: TempCatData.isInNavbar,
        ishidden: TempCatData.ishidden
      });
    }
  }, [TempCatData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/categories/category', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/AdminEditCateg'); // Redirect back to categories list
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      
      {success && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Category updated successfully!
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID</label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2"
            />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Name (English)</label>
          <input
            type="text"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
            />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Name (Arabic)</label>
          <input
            type="text"
            name="nameAr"
            value={formData.nameAr}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
            />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Rank</label>
          <input
            type="number"
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
            />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isInNavbar"
            checked={formData.isInNavbar}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          <label className="ml-2 block text-sm text-gray-700">Show in Navbar</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="ishidden"
            checked={formData.ishidden}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          <label className="ml-2 block text-sm text-gray-700">Hidden</label>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
            {isLoading ? 'Updating...' : 'Update Category'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/AdminEditCateg')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
            Cancel
          </button>
        </div>
      </form>
    </div>
            </>
  );
}