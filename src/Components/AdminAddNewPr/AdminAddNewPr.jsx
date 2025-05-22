import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminAddNewPr() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    skuId: '',
    nameEn: '',
    nameAr: '',
    company: '',
    cardDescriptionEn: '',
    cardDescriptionAr: '',
    descriptionEn: '',
    descriptionAr: '',
    priceBefore: 0,
    priceAfter: 0,
    availableStock: 0,
    maxOrderQuantity: 0,
    itemRank: 0,
  });
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]); // <-- Add this line
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });
  const TestToken = localStorage.getItem('userToken');

  // Fetch categories and tags from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/v1/categories');
        setAllCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setUploadStatus({ 
          message: 'Failed to load categories. Please try again.', 
          isError: true 
        });
      }
    };
    
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/v1/tags');
        setAllTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setUploadStatus({
          message: 'Failed to load tags. Please try again.',
          isError: true
        });
      }
    };
    
    fetchCategories();
    fetchTags();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
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

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...selectedFiles]);
    
    // Create preview URLs for new images
    const newPreviews = selectedFiles.map(file => ({
      file: file,
      url: URL.createObjectURL(file)
    }));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setUploadStatus({ message: 'Please select at least one image.', isError: true });
      return;
    }

    const formDataToSend = new FormData();
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') {
        formDataToSend.append(key, value);
      }
    });
    
    // Append arrays as JSON strings
    formDataToSend.append('categories', JSON.stringify(categories));
    formDataToSend.append('tags', JSON.stringify(tags));
    
    // Append all images with the same field name
    images.forEach(image => {
      formDataToSend.append('image', image); // Using same field name for all images
    });

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/products/product', {
        method: 'POST',
        headers: {
          'Access-Token': TestToken,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setUploadStatus({ message: 'Product added successfully!', isError: false });
        // Reset form after successful submission
        setFormData({
          skuId: '',
          nameEn: '',
          nameAr: '',
          company: '',
          cardDescriptionEn: '',
          cardDescriptionAr: '',
          descriptionEn: '',
          descriptionAr: '',
          priceBefore: 0,
          priceAfter: 0,
          availableStock: 0,
          maxOrderQuantity: 0,
          itemRank: 0,
        });
        setCategories([]);
        setTags([]);
        setImages([]);
        // Navigate back after 2 seconds
        setTimeout(() => navigate('/AdminEditProducts'), 2000);
      } else {
        const errorData = await response.json();
        setUploadStatus({ 
          message: errorData.message || 'Failed to add product', 
          isError: true 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        message: `Error: ${error.message}`, 
        isError: true 
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="skuId" className="block mb-2 text-sm font-medium text-gray-900">
              SKU ID
            </label>
            <input
              type="text"
              id="skuId"
              name="skuId"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.skuId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="nameEn" className="block mb-2 text-sm font-medium text-gray-900">
              Name (English)
            </label>
            <input
              type="text"
              id="nameEn"
              name="nameEn"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.nameEn}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="nameAr" className="block mb-2 text-sm font-medium text-gray-900">
              Name (Arabic)
            </label>
            <input
              type="text"
              id="nameAr"
              name="nameAr"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.nameAr}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Categories</label>
            <div className="flex flex-wrap gap-4">
              {allCategories.length > 0 ? (
                allCategories.map((category) => (
                  <div className="flex items-center" key={category.id}>
                    <input
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      type="checkbox"
                      value={category.nameEn}
                      id={`category-${category.id}`}
                      checked={categories.includes(category.nameEn)}
                      onChange={handleCategoryChange}
                    />
                    <label htmlFor={`category-${category.id}`} className="ms-2 text-sm font-medium text-gray-900">
                      {category.nameEn.charAt(0).toUpperCase() + category.nameEn.slice(1)}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">Loading categories...</div>
              )}
            </div>
          </div>
          
          <div>
            {/* // In your form rendering, replace the static tags section with: */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Tags</label>
              <div className="flex flex-wrap gap-4">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <div className="flex items-center" key={tag.id}>
                      <input
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        type="checkbox"
                        value={tag.nameEn}
                        id={`tag-${tag.id}`}
                        checked={tags.includes(tag.nameEn)}
                        onChange={handleTagChange}
                      />
                      <label htmlFor={`tag-${tag.id}`} className="ms-2 text-sm font-medium text-gray-900">
                        {tag.nameEn.charAt(0).toUpperCase() + tag.nameEn.slice(1)}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Loading tags...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cardDescriptionEn" className="block mb-2 text-sm font-medium text-gray-900">
              Card Description (English)
            </label>
            <input
              type="text"
              id="cardDescriptionEn"
              name="cardDescriptionEn"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.cardDescriptionEn}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="cardDescriptionAr" className="block mb-2 text-sm font-medium text-gray-900">
              Card Description (Arabic)
            </label>
            <input
              type="text"
              id="cardDescriptionAr"
              name="cardDescriptionAr"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.cardDescriptionAr}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="descriptionEn" className="block mb-2 text-sm font-medium text-gray-900">
              Description (English)
            </label>
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              rows="4"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={formData.descriptionEn}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="descriptionAr" className="block mb-2 text-sm font-medium text-gray-900">
              Description (Arabic)
            </label>
            <textarea
              id="descriptionAr"
              name="descriptionAr"
              rows="4"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={formData.descriptionAr}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="priceBefore" className="block mb-2 text-sm font-medium text-gray-900">
              Price Before
            </label>
            <input
              type="number"
              id="priceBefore"
              name="priceBefore"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.priceBefore}
              onChange={handleNumberChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="priceAfter" className="block mb-2 text-sm font-medium text-gray-900">
              Price After
            </label>
            <input
              type="number"
              id="priceAfter"
              name="priceAfter"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.priceAfter}
              onChange={handleNumberChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="availableStock" className="block mb-2 text-sm font-medium text-gray-900">
              Available Stock
            </label>
            <input
              type="number"
              id="availableStock"
              name="availableStock"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.availableStock}
              onChange={handleNumberChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="maxOrderQuantity" className="block mb-2 text-sm font-medium text-gray-900">
              Max Order Quantity
            </label>
            <input
              type="number"
              id="maxOrderQuantity"
              name="maxOrderQuantity"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.maxOrderQuantity}
              onChange={handleNumberChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="itemRank" className="block mb-2 text-sm font-medium text-gray-900">
              Item Rank
            </label>
            <input
              type="number"
              id="itemRank"
              name="itemRank"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={formData.itemRank}
              onChange={handleNumberChange}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Product Images (Multiple allowed)
            </label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (Multiple allowed)</p>
                </div>
                <input
                  id="images"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Selected images ({imagePreviews.length}):
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Save Product
          </button>
        </div>
      </form>

      {uploadStatus.message && (
        <div
          className={`mt-6 p-4 text-sm rounded-lg ${uploadStatus.isError ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'}`}
          role="alert"
        >
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}