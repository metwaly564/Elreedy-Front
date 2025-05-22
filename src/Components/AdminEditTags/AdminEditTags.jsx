import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const TagsTable = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { setTempTagData } = useContext(UserContext); // Changed from TempTagID to TempTagData
  const navigate = useNavigate();
  const TestToken = localStorage.getItem('userToken');

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:3000/api/v1/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEdit = (tag, e) => {  // Now receives the complete tag object
    e.preventDefault();
    setTempTagData(tag);  // Store the complete tag data
    navigate('/EditTag');
  };

  const handleDelete = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/tags/tag/${tagId}`,
        {
          method: 'DELETE',
          headers: {
            'Access-Token': TestToken
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete tag (status: ${response.status})`);
      }

      await fetchTags();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <Link 
        to="/AdminAddNewTag" 
        className='font-alexandria font-light  m-5 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'
      >
        Add new tag
      </Link>
      
      {error && (
        <div className=" font-alexandria font-light bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
        </div>
      )}
      
      <div className="relative overflow-x-auto font-alexandria font-light">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">English Name</th>
              <th scope="col" className="px-6 py-3">Arabic Name</th>
              <th scope="col" className="px-6 py-3">Category ID</th>
              <th scope="col" className="px-6 py-3">Hidden</th>
              <th scope="col" className="px-6 py-3">Rank</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag, index) => (
              <tr key={tag.id} className={`${index !== tags.length - 1 ? 'border-b' : ''} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {tag.id}
                </td>
                <td className="px-6 py-4">{tag.nameEn}</td>
                <td className="px-6 py-4">{tag.nameAr}</td>
                <td className="px-6 py-4">{tag.categoryId}</td>
                <td className="px-6 py-4">{tag.ishidden ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">{tag.rank}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <Link 
                    to="/EditTag"
                    onClick={(e) => handleEdit(tag, e)}  // Passing the complete tag object
                    className={`px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={deleteLoading}
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(tag.id)}
                    disabled={deleteLoading}
                    className={`px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TagsTable;