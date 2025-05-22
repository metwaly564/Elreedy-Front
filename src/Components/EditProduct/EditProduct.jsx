/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../Context/UserContext';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProduct() {
  const { TempSkuID: contextSkuId } = useContext(UserContext);
  const [TempSkuID, setTempSkuID] = useState(contextSkuId || localStorage.getItem('TempSkuID'));
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editingRankId, setEditingRankId] = useState(null);
  const [newRank, setNewRank] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    company: '',
    cardDescriptionEn: '',
    cardDescriptionAr: '',
    descriptionEn: '',
    descriptionAr: '',
    priceBefore: '',
    priceAfter: '',
    availableStock: '',
    maxOrderQuantity: '',
    itemRank: '',
  });

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  let TestToken = localStorage.getItem('userToken');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/categories', {
          headers: {
            'Access-Token': TestToken,
          },
        });
        const data = await response.json();
        setAllCategories(data || []);  // Fallback to empty array
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/tags', {
          headers: {
            'Access-Token': TestToken,
          },
        });
        const data = await response.json();
        setAllTags(data || []); // Fallback to empty array      
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchCategories();
    fetchTags();
  }, [TestToken]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/products/product/${TempSkuID}`, {
          headers: {
            'Access-Token': TestToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }

        const data = await response.json();
        setProductData(data);

        // Set form data
        setFormData({
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          company: data.company,
          cardDescriptionEn: data.cardDescriptionEn,
          cardDescriptionAr: data.cardDescriptionAr,
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          priceBefore: String(data.priceBefore),
          priceAfter: String(data.priceAfter),
          availableStock: String(data.availableStock),
          maxOrderQuantity: String(data.maxOrderQuantity),
          itemRank: String(data.itemRank),
        });

        // Set categories - extract category IDs from productCategories
        if (data.productCategories && data.productCategories.length > 0) {
          const categoryIds = data.productCategories.map(cat => 
            cat.category && cat.category.id ? cat.category.id.toString() : null
          ).filter(id => id !== null);
          setCategories(categoryIds);
        } else {
          setCategories([]);
        }
        
        // Set tags - extract tag IDs from tags
        if (data.tags && data.tags.length > 0) {
          const tagIds = data.tags.map(tag => 
            tag.tag && tag.tag.id ? tag.tag.id.toString() : null
          ).filter(id => id !== null);
          setTags(tagIds);
        } else {
          setTags([]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (TempSkuID) {
      fetchProductData();
    }
  }, [TempSkuID, TestToken, refreshTrigger]);

  // Update localStorage when TempSkuID changes
  useEffect(() => {
    if (TempSkuID) {
      localStorage.setItem('TempSkuID', TempSkuID);
    }
  }, [TempSkuID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setCategories(prev =>
      checked ? [...prev, value] : prev.filter(cat => cat !== value)
    );
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setTags(prev =>
      checked ? [...prev, value] : prev.filter(tag => tag !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Map selected category IDs to names
      const selectedCategoryNames = allCategories
        .filter(cat => categories.includes(cat.id.toString()))
        .map(cat => cat.nameEn);

      // Map selected tag IDs to names
      const selectedTagNames = allTags
        .filter(tag => tags.includes(tag.id.toString()))
        .map(tag => tag.nameEn);

      // Create the request body with only the fields that have changed
      const requestBody = {
        ...formData,
        skuId: TempSkuID,
        priceBefore: parseInt(formData.priceBefore, 10),
        priceAfter: parseInt(formData.priceAfter, 10),
        availableStock: parseInt(formData.availableStock, 10),
        maxOrderQuantity: parseInt(formData.maxOrderQuantity, 10),
        itemRank: parseInt(formData.itemRank, 10),
      };

      // Only include categories if they've changed
      if (selectedCategoryNames.length > 0) {
        requestBody.categories = selectedCategoryNames;
      }

      // Only include tags if they've changed
      if (selectedTagNames.length > 0) {
        requestBody.tags = selectedTagNames;
      }

      const response = await fetch('http://127.0.0.1:3000/api/v1/products/product', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success('Product updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await response.json();
        toast.error(`Error updating product: ${errorData.message || response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error(`Error updating product: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!newImage) {
      setUploadStatus('Please select an image first');
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', newImage);
    formData.append('id', TempSkuID); // Add the product ID to the form data

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/products/image', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const imageData = await response.json();
      const imageId = imageData.id;

      // Assign the uploaded image to the product with default rank 1
      const assignResponse = await fetch('http://127.0.0.1:3000/api/v1/products/product-image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken,
        },
        body: JSON.stringify({
          id: imageId,
          productId: TempSkuID,
          rank: 1
        }),
      });

      setUploadStatus('Image uploaded and assigned successfully!');
      
      // Refresh product data after successful upload
      const fetchResponse = await fetch(`http://127.0.0.1:3000/api/v1/products/product/${TempSkuID}`, {
        headers: {
          'Access-Token': TestToken,
        },
      });
      const data = await fetchResponse.json();
      setProductData(data);
    } catch (error) {
      setUploadStatus(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
      setNewImage(null);
      // Reset file input
      document.getElementById('image-upload').value = '';
    }
  };

  const handleUpdateRank = async (imageId) => {
    if (!newRank) {
      setUploadStatus('Please enter a rank value');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/products/product-image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken,
        },
        body: JSON.stringify({
          id: imageId,
          rank: parseInt(newRank, 10),
        }),
      });

      if (response.ok) {
        setUploadStatus('Image rank updated successfully!');
        // Refresh product data to show updated ranks
        const fetchResponse = await fetch(`http://127.0.0.1:3000/api/v1/products/product/${TempSkuID}`, {
          headers: {
            'Access-Token': TestToken,
          },
        });
        const data = await fetchResponse.json();
        setProductData(data);
      } else {
        const errorData = await response.json();
        setUploadStatus(`Error updating image rank: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setUploadStatus(`Error updating image rank: ${error.message}`);
    } finally {
      setEditingRankId(null);
      setNewRank('');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/products/product-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken,
        },
        body: JSON.stringify({
          id: imageId,
        }),
      });

      if (response.ok) {
        setUploadStatus('Image deleted successfully!');
        // Refresh product data to show updated images
        const fetchResponse = await fetch(`http://127.0.0.1:3000/api/v1/products/product/${TempSkuID}`, {
          headers: {
            'Access-Token': TestToken,
          },
        });
        const data = await fetchResponse.json();
        setProductData(data);
      } else {
        const errorData = await response.json();
        setUploadStatus(`Error deleting image: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setUploadStatus(`Error deleting image: ${error.message}`);
    }
  };

  const startEditingRank = (imageId, currentRank) => {
    setEditingRankId(imageId);
    setNewRank(currentRank.toString());
  };

  const cancelEditingRank = () => {
    setEditingRankId(null);
    setNewRank('');
  };

  if (loading) {
    return <div className="p-6 text-center">Loading product data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!productData) {
    return <div className="p-6 text-center">No product data found</div>;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product - {TempSkuID}</h2>
        </div>

        <div className="mb-2">
          <strong className="text-gray-900">Product Categories:</strong>
          {(!productData.productCategories || productData.productCategories.length === 0) ? (
            <div className="text-gray-900">There are no categories added</div>
          ) : (
            <ul>
              {productData.productCategories.map(pc => (
                <li key={pc.categoryId} className="text-gray-900">
                  {pc.category?.nameEn}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-2">
          <strong className="text-gray-900">Product Tags:</strong>
          {(!productData.tags || productData.tags.length === 0) ? (
            <div className="text-gray-900">There are no tags added</div>
          ) : (
            <ul>
              {productData.tags.map(pt => (
                <li key={pt.tagId} className="text-gray-900">
                  {pt.tag?.nameEn}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="nameEn" className="block mb-2 text-sm font-medium text-gray-900">Name (English)</label>
              <input
                type="text"
                id="nameEn"
                name="nameEn"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.nameEn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="nameAr" className="block mb-2 text-sm font-medium text-gray-900">Name (Arabic)</label>
              <input
                type="text"
                id="nameAr"
                name="nameAr"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.nameAr}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Categories</label>
              <div className="flex flex-wrap gap-4">
                {allCategories.map((category) => (
                  <div className="flex items-center" key={category.id}>
                    <input
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      type="checkbox"
                      value={category.id}
                      id={`category-${category.id}`}
                      checked={categories.includes(category.id.toString())}
                      onChange={handleCategoryChange}
                    />
                    <label htmlFor={`category-${category.id}`} className="ms-2 text-sm font-medium text-gray-900">
                      {category.nameEn}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Tags</label>
              <div className="flex flex-wrap gap-4">
                {allTags.map((tag) => (
                  <div className="flex items-center" key={tag.id}>
                    <input
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      type="checkbox"
                      value={tag.id}
                      id={`tag-${tag.id}`}
                      checked={tags.includes(tag.id.toString())}
                      onChange={handleTagChange}
                    />
                    <label htmlFor={`tag-${tag.id}`} className="ms-2 text-sm font-medium text-gray-900">
                      {tag.nameEn}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cardDescriptionEn" className="block mb-2 text-sm font-medium text-gray-900">Card Description (English)</label>
              <input
                type="text"
                id="cardDescriptionEn"
                name="cardDescriptionEn"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.cardDescriptionEn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cardDescriptionAr" className="block mb-2 text-sm font-medium text-gray-900">Card Description (Arabic)</label>
              <input
                type="text"
                id="cardDescriptionAr"
                name="cardDescriptionAr"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.cardDescriptionAr}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="descriptionEn" className="block mb-2 text-sm font-medium text-gray-900">Description (English)</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                rows="4"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="descriptionAr" className="block mb-2 text-sm font-medium text-gray-900">Description (Arabic)</label>
              <textarea
                id="descriptionAr"
                name="descriptionAr"
                rows="4"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={formData.descriptionAr}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="priceBefore" className="block mb-2 text-sm font-medium text-gray-900">Price Before</label>
              <input
                type="number"
                id="priceBefore"
                name="priceBefore"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.priceBefore}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="priceAfter" className="block mb-2 text-sm font-medium text-gray-900">Price After</label>
              <input
                type="number"
                id="priceAfter"
                name="priceAfter"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.priceAfter}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="availableStock" className="block mb-2 text-sm font-medium text-gray-900">Available Stock</label>
              <input
                type="number"
                id="availableStock"
                name="availableStock"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.availableStock}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="maxOrderQuantity" className="block mb-2 text-sm font-medium text-gray-900">Max Order Quantity</label>
              <input
                type="number"
                id="maxOrderQuantity"
                name="maxOrderQuantity"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.maxOrderQuantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="itemRank" className="block mb-2 text-sm font-medium text-gray-900">Item Rank</label>
              <input
                type="number"
                id="itemRank"
                name="itemRank"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={formData.itemRank}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Product Images</label>
              <div className="border rounded-lg p-4 bg-gray-50">
                {/* Add New Image Section */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Add New Image
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                      />
                      <div className="p-2 border rounded cursor-pointer hover:bg-gray-100 text-center">
                        {newImage ? newImage.name : 'Select Image'}
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={!newImage || isUploadingImage}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>

                {/* Existing Images */}
                {productData.Images && productData.Images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {productData.Images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Product ${index}`}
                          className="w-full h-32 object-contain rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 flex justify-between items-center">
                          <span>Rank: {image.rank}</span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => startEditingRank(image.id, image.rank)}
                              className="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                            >
                              Edit Rank
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image.id)}
                              className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editingRankId === image.id && (
                          <div className="absolute top-0 left-0 right-0 bg-white p-2 shadow-lg rounded-b-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={newRank}
                                onChange={(e) => setNewRank(e.target.value)}
                                className="w-20 p-1 border rounded"
                                placeholder="New rank"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateRank(image.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingRank}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images available</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Link to="/AdminEditProducts"
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Update Product
            </button>
          </div>
        </form>

        {uploadStatus && (
          <div
            className={`mt-6 p-4 text-sm rounded-lg ${uploadStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
            role="alert"
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </>
  );
}