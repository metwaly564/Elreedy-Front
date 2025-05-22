/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditCateg() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let { setTempCatData } = useContext(UserContext);
  const TestToken = localStorage.getItem('userToken');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:3000/api/v1/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setTempCatData(category);
    navigate('/AdminEditCategory');
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/categories/category/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Access-Token': TestToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refetch categories to ensure UI is in sync with server
      await fetchCategories();
      
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col justify-center font-alexandria font-light' >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            Error: {error}
          </div>
        )}
        
        <Link 
          to="/AdminAddNewCat" 
          className='p-4 bg-blue-600 text-white m-2 rounded-xl w-[12em] hover:bg-blue-700 transition-colors'
        >
          Add New Category
        </Link>
        
        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <table className="table m-4 table-striped table-bordered">
            <thead>
              <tr className="bg-gray-100">
                <th>ID</th>
                <th>Name (EN)</th>
                <th>Name (AR)</th>
                <th>In Navbar</th>
                <th>Hidden</th>
                <th>Rank</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.nameEn}</td>
                  <td>{category.nameAr}</td>
                  <td>{category.isInNavbar ? 'Yes' : 'No'}</td>
                  <td>{category.ishidden ? 'Yes' : 'No'}</td>
                  <td>{category.rank}</td>
                  <td className="text-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
                      onClick={() => handleEdit(category)}
                      disabled={deleteLoading}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}