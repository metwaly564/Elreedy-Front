import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';

const CreatePromoCode = () => {
  const [token] = useState(localStorage.getItem('userToken'));
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'value',
    value: '',
    usageType: 'multi_use',
    target: 'cart',
    isActive: true,
    budget: '',
    discountLimit: '',
    applyToDiscounted: false,
    expirationDate: '',
    categories: [],
    users: [],
    cities: [],
    zones: []
  });
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableZones, setAvailableZones] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cities
        const citiesRes = await fetch("http://127.0.0.1:3000/api/v1/places/city", {
          headers: { "Access-Token": token }
        });
        const citiesData = await citiesRes.json();
        setCities(citiesData);

        // Fetch categories
        const categoriesRes = await fetch("http://127.0.0.1:3000/api/v1/categories", {
          headers: { "Access-Token": token }
        });
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // Fetch users
        const usersRes = await fetch("http://127.0.0.1:3000/api/v1/users", {
          headers: { "Access-Token": token }
        });

        if (!usersRes.ok) {
          throw new Error(`Failed to fetch users: ${usersRes.status} ${usersRes.statusText}`);
        }

        const usersData = await usersRes.json();
        
        // Filter to only show customers
        const customerUsers = Array.isArray(usersData) 
          ? usersData.filter(user => user.role === 'customer')
          : usersData.users 
            ? usersData.users.filter(user => user.role === 'customer')
            : [];
        
        setUsers(customerUsers);
        setFilteredUsers(customerUsers);

      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(`Failed to fetch data: ${err.message}`);
        setUsers([]);
        setFilteredUsers([]);
        setCategories([]);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length > 0 && results.data[0].ids) {
          const ids = results.data.map(row => parseInt(row.ids)).filter(id => !isNaN(id));
          setFormData(prev => ({
            ...prev,
            users: [...new Set([...prev.users, ...ids])] // Remove duplicates
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle checkbox changes for arrays (categories, users, cities, zones)
  const handleArrayChange = (e, field) => {
    const { value, checked } = e.target;
    const numValue = parseInt(value);

    setFormData(prev => {
      const newArray = checked 
        ? [...prev[field], numValue]
        : prev[field].filter(item => item !== numValue);
      
      return {
        ...prev,
        [field]: newArray
      };
    });

    // If it's a city checkbox, update available zones
    if (field === 'cities') {
      const city = cities.find(c => c.id === numValue);
      if (checked && city) {
        setAvailableZones(prev => [...prev, ...city.zones]);
      } else {
        setAvailableZones(prev => prev.filter(z => z.cityId !== numValue));
        setFormData(prev => ({
          ...prev,
          zones: prev.zones.filter(zoneId => {
            const zone = availableZones.find(z => z.id === zoneId);
            return zone ? zone.cityId !== numValue : true;
          })
        }));
      }
    }
  };

  // Select all users
  const selectAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      users: filteredUsers.map(user => user.id)
    }));
  };

  // Deselect all users
  const deselectAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      users: []
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.code || !formData.name || !formData.value || 
        (formData.usageType === 'multi_use' && !formData.budget)) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/promocodes/promocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": token
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          discountType: formData.discountType,
          value: parseFloat(formData.value),
          usageType: formData.usageType,
          target: formData.target,
          isActive: formData.isActive,
          budget: parseFloat(formData.budget),
          discountLimit: formData.discountLimit ? parseFloat(formData.discountLimit) : null,
          applyToDiscounted: formData.applyToDiscounted,
          expirationDate: formData.expirationDate || null,
          categories: formData.categories,
          cities: formData.cities,
          zones: formData.zones,
          userId: formData.users
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Promo code created successfully!");
        // Reset form
        setFormData({
          code: '',
          name: '',
          discountType: 'value',
          value: '',
          usageType: 'multi_use',
          target: 'cart',
          isActive: true,
          budget: '',
          discountLimit: '',
          applyToDiscounted: false,
          expirationDate: '',
          categories: [],
          users: [],
          cities: [],
          zones: []
        });
        setAvailableZones([]);
        setCsvFile(null);
      } else {
        toast.error(`Error: ${responseData.message || "Failed to create promo code"}`);
      }
    } catch (err) {
      toast.error("Network error!");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading data...</div>;
  }

  return (
    <div className="flex flex-col justify-center p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Basic Information Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Promo Code Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Code*:</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              placeholder="SUMMER2023"
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Name*:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Summer Sale 2023"
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Usage Type*:</label>
            <select
              name="usageType"
              value={formData.usageType}
              onChange={handleInputChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="single_use">Single Use</option>
              <option value="multi_use">Multi Use</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Discount Type*:</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="value">Fixed Value</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Target*:</label>
            <select
              name="target"
              value={formData.target}
              onChange={handleInputChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="cart">Cart Total</option>
              <option value="delivery">Delivery Fee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Value*:</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              min="0"
              max={formData.discountType === 'percentage' ? 100 : undefined}
              step={formData.discountType === 'percentage' ? "1" : "0.01"}
              placeholder={formData.discountType === 'percentage' ? "10" : "50.00"}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Budget* (for multi-use):</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              required={formData.usageType === 'multi_use'}
              min="0"
              step="0.01"
              placeholder="1000.00"
              disabled={formData.usageType === 'single_use'}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Discount Limit:</label>
            <input
              type="number"
              name="discountLimit"
              value={formData.discountLimit}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="100.00"
              disabled={formData.discountType !== 'percentage'}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="applyToDiscounted"
              checked={formData.applyToDiscounted}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Apply to Discounted Items</label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Expiration Date:</label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <div className="border rounded-md p-4">
          <div className="flex flex-wrap gap-4">
            {categories.map(category => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={category.id}
                  checked={formData.categories.includes(category.id)}
                  onChange={(e) => handleArrayChange(e, 'categories')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm whitespace-nowrap">{category.nameEn || category.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Users</h2>
          <div className="flex space-x-2">
            <button 
              onClick={selectAllUsers}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 mr-2"
            >
              Select All
            </button>
            <button 
              onClick={deselectAllUsers}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* User Dropdown Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Select User by Phone:</label>
          <div className="flex items-center gap-2">
            <select 
              className="flex-1 border p-2 rounded"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const userId = parseInt(e.target.value);
                  if (!formData.users.includes(userId)) {
                    setFormData(prev => ({
                      ...prev,
                      users: [...prev.users, userId]
                    }));
                  }
                  e.target.value = ""; // Reset dropdown after selection
                }
              }}
            >
              <option value="">-- Select User --</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.phone} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* CSV Upload Section */}
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

        {/* Selected Users Display */}
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          <h3 className="font-medium mb-2">Selected Users ({formData.users.length})</h3>
          {formData.users.length > 0 ? (
            <div className="space-y-2">
              {formData.users.map(userId => {
                const user = filteredUsers.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {user ? `${user.phone} (ID: ${userId})` : `User ID: ${userId}`}
                    </span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          users: prev.users.filter(id => id !== userId)
                        }));
                      }}
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
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Cities & Zones</h2>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          {cities.length > 0 ? (
            cities.map(city => (
              <div key={city.id} className="mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={city.id}
                    checked={formData.cities.includes(city.id)}
                    onChange={(e) => handleArrayChange(e, 'cities')}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{city.name}</span>
                </label>
                
                {formData.cities.includes(city.id) && city.zones && city.zones.length > 0 && (
                  <div className="ml-6 mt-2 pl-4 border-l-2 border-gray-200">
                    {city.zones.map(zone => (
                      <label key={zone.id} className="flex items-center space-x-2 mb-1 ml-2">
                        <input
                          type="checkbox"
                          value={zone.id}
                          checked={formData.zones.includes(zone.id)}
                          onChange={(e) => handleArrayChange(e, 'zones')}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{zone.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No cities found</div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          Create Promo Code
        </button>
      </div>
    </div>
  );
};

export default CreatePromoCode;