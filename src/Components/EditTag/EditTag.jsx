import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function EditTag() {
  const TestToken = localStorage.getItem('userToken');
  
  const { TempTagData } = useContext(UserContext); // Now using TempTagData instead of TempTagID
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: '',
    nameEn: '',
    nameAr: '',
    rank: '',
    categoryId: '',
    ishidden: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (TempTagData) {
      setFormData({
        id: TempTagData.id,
        nameEn: TempTagData.nameEn,
        nameAr: TempTagData.nameAr,
        rank: TempTagData.rank.toString(),
        categoryId: TempTagData.categoryId.toString(),
        ishidden: TempTagData.ishidden || false
      });
    } else {
      setError('No tag data provided');
      navigate('/tags'); // Redirect if no data
    }
  }, [TempTagData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        id: Number(formData.id),
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        rank: Number(formData.rank),
        categoryId: Number(formData.categoryId),
        ishidden: formData.ishidden
      };

      const response = await fetch('http://127.0.0.1:3000/api/v1/tags/tag', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => navigate('/tags'), 1500); // Redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!TempTagData) {
    return <div className="text-center py-8">Loading tag data...</div>;
  }

  if (error) {
    return (
      <>
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Tag #{formData.id}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">English Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Arabic Name</label>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Category ID</label>
          <input
            type="number"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            required
            />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="ishidden"
            checked={formData.ishidden}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          <label className="ml-2 block text-sm text-gray-700">Hidden</label>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
            {loading ? 'Updating...' : 'Update Tag'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/tags')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
            Cancel
          </button>
        </div>
        
        {success && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Tag updated successfully!
          </div>
        )}
      </form>
    </div>
        </>
  );
}