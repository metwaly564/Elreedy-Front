import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditBanners() {
  const TestToken = localStorage.getItem('userToken');

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBannerData, setNewBannerData] = useState({
    type: 'slider',
    linkUrl: '',
    rank: null,
    image: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Constants for pagination
  const ITEMS_PER_PAGE = 5;

  // Fetch all banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/banners/banner');
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        const data = await response.json();
        setBanners(data);
        toast.success('Banners loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(`Error loading banners: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Validate form functions
  const validateBannerForm = () => {
    const errors = {};
    if (!newBannerData.type) errors.type = 'Banner type is required';
    if (!newBannerData.linkUrl) errors.linkUrl = 'Link URL is required';
    if (newBannerData.rank !== null && isNaN(newBannerData.rank)) errors.rank = 'Rank must be a number';
    return errors;
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBanners = useMemo(() => {
    let sortableBanners = [...banners];
    if (sortConfig.key) {
      sortableBanners.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBanners;
  }, [banners, sortConfig]);

  // Filter banners based on search term
  const filteredBanners = sortedBanners.filter(banner => 
    banner.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.id.toString().includes(searchTerm) ||
    banner.linkUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.rank !== null && banner.rank.toString().includes(searchTerm))
  );

  // Pagination logic
  const pageCount = Math.ceil(filteredBanners.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentBanners = filteredBanners.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset to first page when changing items per page
  };

  // Banner CRUD operations
  const createBanner = async () => {
    const errors = validateBannerForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    const formData = new FormData();
    formData.append('image', newBannerData.image);
    formData.append('type', newBannerData.type);
    formData.append('url', newBannerData.linkUrl);
    if (newBannerData.rank !== null) {
      formData.append('rank', newBannerData.rank);
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/banners/banner', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create banner');

      const { imageUrl } = await response.json();
      
      // Create a new banner object with the returned imageUrl and the data we sent
      const newBanner = {
        id: Date.now(), // temporary ID until we get the real one from the server
        imageUrl,
        type: newBannerData.type,
        linkUrl: newBannerData.linkUrl,
        rank: newBannerData.rank
      };

      setBanners([...banners, newBanner]);
      setNewBannerData({
        type: 'slider',
        linkUrl: '',
        rank: null,
        image: null
      });
      setFormErrors({});
      toast.success('Banner created successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error creating banner: ${err.message}`);
    }
  };

  const updateBanner = async () => {
    if (!editingBanner) return;

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/banners/banner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({
          id: editingBanner.id,
          rank: editingBanner.rank,
          url: editingBanner.linkUrl,
          type: editingBanner.type
        })
      });

      if (!response.ok) throw new Error('Failed to update banner');

      setBanners(banners.map(banner => 
        banner.id === editingBanner.id ? editingBanner : banner
      ));
      setEditingBanner(null);
      toast.success('Banner updated successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating banner: ${err.message}`);
    }
  };

  const deleteBanner = async (bannerId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/banners/banner/${bannerId}`,
        {
          method: 'DELETE',
          headers: {
            'Access-Token': TestToken
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete banner');

      setBanners(banners.filter(banner => banner.id !== bannerId));
      setDeleteConfirm(null);
      toast.success('Banner deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error deleting banner: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading banners...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
    
    <div className="flex flex-col justify-center p-4 font-alexandria font-light ">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search banners by type, URL or rank..."
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex items-center space-x-2 font-alexandria font-light">
            <span className="whitespace-nowrap">Items per page:</span>
            <select 
              className="border p-2 rounded font-alexandria font-light"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option className="font-alexandria font-light" value={5}>5</option>
              <option className="font-alexandria font-light" value={10}>10</option>
              <option className="font-alexandria font-light" value={20}>20</option>
              <option className="font-alexandria font-light" value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Banner Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New Banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <select
              value={newBannerData.type}
              onChange={(e) => setNewBannerData({...newBannerData, type: e.target.value})}
              className={`border p-2 rounded w-full ${formErrors.type ? 'border-red-500' : ''}`}
            >
              <option value="slider">Slider</option>
              <option value="middle">Middle</option>
              <option value="fixed">Fixed</option>
            </select>
            {formErrors.type && (
              <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={newBannerData.linkUrl}
              onChange={(e) => setNewBannerData({...newBannerData, linkUrl: e.target.value})}
              placeholder="Link URL"
              className={`border p-2 rounded w-full ${formErrors.linkUrl ? 'border-red-500' : ''}`}
            />
            {formErrors.linkUrl && (
              <p className="text-red-500 text-sm mt-1">{formErrors.linkUrl}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={newBannerData.rank || ''}
              onChange={(e) => setNewBannerData({...newBannerData, rank: e.target.value ? parseInt(e.target.value) : null})}
              placeholder="Rank (optional)"
              className={`border p-2 rounded w-full ${formErrors.rank ? 'border-red-500' : ''}`}
            />
            {formErrors.rank && (
              <p className="text-red-500 text-sm mt-1">{formErrors.rank}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={(e) => setNewBannerData({...newBannerData, image: e.target.files[0]})}
              className="border p-2 rounded w-full"
              accept="image/*"
            />
            <button
              onClick={createBanner}
              className="bg-blue-600 pr-4 text-white p-2 rounded hover:bg-blue-700 whitespace-nowrap"
              disabled={!newBannerData.type || !newBannerData.linkUrl || !newBannerData.image}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th 
                className="p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('id')}
              >
                ID {sortConfig.key === 'id' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3">Image</th>
              <th 
                className="p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('type')}
              >
                Type {sortConfig.key === 'type' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3">Link URL</th>
              <th 
                className="p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('rank')}
              >
                Rank {sortConfig.key === 'rank' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3">Controls</th>
            </tr>
          </thead>
          <tbody>
            {currentBanners.length > 0 ? (
              currentBanners.map((banner) => (
                <tr key={banner.id} className="border-t">
                  <td className="p-3">{banner.id}</td>
                  <td className="p-3">
                    <img 
                      src={banner.imageUrl} 
                      alt={`Banner ${banner.id}`} 
                      className="w-24 h-auto object-contain"
                    />
                  </td>
                  <td className="p-3">
                    {editingBanner?.id === banner.id ? (
                      <select
                        value={editingBanner.type}
                        onChange={(e) => setEditingBanner({...editingBanner, type: e.target.value})}
                        className="border p-1 rounded"
                      >
                        <option value="slider">Slider</option>
                        <option value="middle">Middle</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    ) : (
                      banner.type
                    )}
                  </td>
                  <td className="p-3">
                    {editingBanner?.id === banner.id ? (
                      <input
                        type="text"
                        value={editingBanner.linkUrl}
                        onChange={(e) => setEditingBanner({...editingBanner, linkUrl: e.target.value})}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      <a 
                        href={banner.linkUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {banner.linkUrl}
                      </a>
                    )}
                  </td>
                  <td className="p-3">
                    {editingBanner?.id === banner.id ? (
                      <input
                        type="number"
                        value={editingBanner.rank || ''}
                        onChange={(e) => setEditingBanner({
                          ...editingBanner, 
                          rank: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      banner.rank || 'N/A'
                    )}
                  </td>
                  <td className="p-3 space-x-1">
                    {editingBanner?.id === banner.id ? (
                      <>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                          onClick={updateBanner}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-sm"
                          onClick={() => setEditingBanner(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                          onClick={() => setEditingBanner(banner)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                          onClick={() => setDeleteConfirm({
                            id: banner.id,
                            imageUrl: banner.imageUrl
                          })}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No banners found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredBanners.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mb-4">
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
            pageLinkClassName={'text-White-600'}
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
            <h3 className="text-lg font-semibold mb-4">Confirm Delete Banner</h3>
            <div className="mb-4">
              <img 
                src={deleteConfirm.imageUrl} 
                alt="Banner to delete" 
                className="w-full h-auto mb-2"
              />
              <p>Are you sure you want to delete this banner?</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBanner(deleteConfirm.id);
                }}
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