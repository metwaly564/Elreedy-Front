import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const AdminSalesDashboard = () => {
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState('');
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    cities: true,
    zones: true,
    products: true
  });

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    extraPhones: [''],
    cityId: '',
    zoneId: '',
    address: '',
    promocode: '',
    paymentMethod: 'online',
    paymentState: 'completed',
    platform: 'facebook',
    items: [{ product: '', quantity: 1 }],
    image: null
  });

  // API endpoints
  const endpoints = {
    city: 'http://127.0.0.1:3000/api/v1/places/city',
    zone: 'http://127.0.0.1:3000/api/v1/places/zone',
    product: 'http://127.0.0.1:3000/api/v1/products/product',
    orderSubmit: 'http://127.0.0.1:3000/api/v1/orders/sales-order'
  };

  // Get token from local storage
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
    } else {
      toast.error('Authentication token not found. Please login again.');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch initial data
  useEffect(() => {
    if (!userToken) return;

    const fetchData = async () => {
      try {
        // Fetch cities (which includes zones)
        const citiesResponse = await fetch(endpoints.city, {
          headers: { 'Access-Token': userToken }
        });
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesResponse.json();
        setCities(citiesData);

        // Fetch all zones separately
        const zonesResponse = await fetch(endpoints.zone, {
          headers: { 'Access-Token': userToken }
        });
        if (!zonesResponse.ok) throw new Error('Failed to fetch zones');
        const zonesData = await zonesResponse.json();
        setZones(zonesData);

        // Fetch products
        const productsResponse = await fetch(endpoints.product, {
          headers: { 'Access-Token': userToken }
        });
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        setLoading({ cities: false, zones: false, products: false });
      } catch (err) {
        toast.error(`Error loading data: ${err.message}`);
      }
    };

    fetchData();
  }, [userToken]);

  // Get zones for selected city
  const getZonesForSelectedCity = () => {
    if (!formData.cityId) return [];
    return zones.filter(zone => zone.cityId == formData.cityId);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle city selection change
  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setFormData(prev => ({
      ...prev,
      cityId,
      zoneId: '' // Reset zone when city changes
    }));
  };

  // Handle extra phone changes
  const handleExtraPhoneChange = (index, value) => {
    const newExtraPhones = [...formData.extraPhones];
    newExtraPhones[index] = value;
    setFormData(prev => ({ ...prev, extraPhones: newExtraPhones }));
  };

  // Add new extra phone field
  const addExtraPhone = () => {
    setFormData(prev => ({
      ...prev,
      extraPhones: [...prev.extraPhones, '']
    }));
  };

  // Remove extra phone field
  const removeExtraPhone = (index) => {
    const newExtraPhones = formData.extraPhones.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, extraPhones: newExtraPhones }));
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Add new item row
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1 }]
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  // Filter products for search
  const filterProducts = (searchTerm) => {
    if (!searchTerm) return products;
    return products.filter(product => 
      product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.skuId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Submit order
  const submitOrder = async () => {
    try {
      // Validate required fields
      if (!formData.firstname || !formData.lastname || !formData.phone || 
          !formData.cityId || !formData.zoneId || !formData.address) {
        throw new Error('Please fill all required fields');
      }
  
      // Validate at least one item
      if (formData.items.length === 0 || formData.items.some(item => !item.product || !item.quantity)) {
        throw new Error('Please add at least one valid order item');
      }
  
      // Prepare order data
      const orderData = {
        cityId: parseInt(formData.cityId, 10),
        zoneId: parseInt(formData.zoneId, 10),
        address: formData.address,
        phone: formData.phone,
        promocode: formData.promocode,
        paymentMethod: formData.paymentMethod,
        paymentState: formData.paymentState,
        platform: formData.platform,
        items: formData.items.map(item => {
          const itemObj = {};
          itemObj[item.product] = parseInt(item.quantity, 10);
          return itemObj;
        }),
        firstname: formData.firstname,
        lastname: formData.lastname,
        extraPhones: formData.extraPhones.filter(phone => phone.trim() !== '')
      };
  
      let response;
      if (formData.image) {
        const formDataToSend = new FormData();
        Object.keys(orderData).forEach(key => {
          if (Array.isArray(orderData[key])) {
            formDataToSend.append(key, JSON.stringify(orderData[key]));
          } else {
            formDataToSend.append(key, orderData[key]);
          }
        });
        formDataToSend.append('image', formData.image);
  
        response = await fetch(endpoints.orderSubmit, {
          method: 'POST',
          headers: {
            'Access-Token': userToken
          },
          body: formDataToSend
        });
      } else {
        response = await fetch(endpoints.orderSubmit, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': userToken
          },
          body: JSON.stringify(orderData)
        });
      }
  
      if (response.status === 201) {
        const result = await response.json();
        
        // Detailed success notification
        toast.success(
          <div>
            <h3 className="font-bold">Order Submitted Successfully!</h3>
            <div className="mt-2">
              <p><strong>Order ID:</strong> {result.id}</p>
              <p><strong>Customer:</strong> {result.customerName}</p>
              <p><strong>Phone:</strong> {result.mainPhone}</p>
              <p><strong>Total Amount:</strong> ${result.totalAmount}</p>
              <p><strong>Delivery Fee:</strong> ${result.deliveryFee}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Payment Method:</strong> {result.paymentMethod}</p>
            </div>
          </div>,
          {
            autoClose: 5000,
            closeButton: true,
          }
        );
        
        // Reset form
        setFormData({
          firstname: '',
          lastname: '',
          phone: '',
          extraPhones: [''],
          cityId: '',
          zoneId: '',
          address: '',
          promocode: '',
          paymentMethod: 'online',
          paymentState: 'completed',
          platform: 'facebook',
          items: [{ product: '', quantity: 1 }],
          image: null
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      console.error('Order submission error:', err);
    }
  };

  if (loading.cities || loading.zones || loading.products) {
    return (
      <div className="p-4 text-center">
        Loading data...
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-4 font-alexandria font-light">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Customer Order</h1>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submitOrder(); }}>
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Customer Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone*</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extra Phones</label>
              {formData.extraPhones.map((phone, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handleExtraPhoneChange(index, e.target.value)}
                    className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Extra phone number"
                    />
                  {index > 0 && (
                    <button
                    type="button"
                    onClick={() => removeExtraPhone(index)}
                    className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addExtraPhone}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                Add Extra Phone
              </button>
            </div>
          </div>
          
          {/* Address Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Address</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleCityChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone*</label>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!formData.cityId}
                  >
                  <option value="">Select Zone</option>
                  {getZonesForSelectedCity().map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} (Fee: {zone.deliveryFee})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Details*</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., في الحي السابع المبني التامن الشقه التاسعه في الدور العاشر"
                required
                />
            </div>
          </div>
          
          {/* Payment & Platform */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Payment & Platform</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promocode</label>
                <input
                  type="text"
                  name="promocode"
                  value={formData.promocode}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method*</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="online">Online</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment State*</label>
                <select
                  name="paymentState"
                  value={formData.paymentState}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform*</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Order Items</h2>
            
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
                  <input
                    type="text"
                    placeholder="Search product..."
                    onChange={(e) => handleItemChange(index, 'searchTerm', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product*</label>
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    >
                    <option value="">Select Product</option>
                    {filterProducts(item.searchTerm || '').map(product => (
                      <option key={product.skuId} value={product.skuId}>
                        {product.nameEn} ({product.skuId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    />
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
              Add Item
            </button>
          </div>
          
          {/* Receipt Image */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Receipt Image (Optional)</h2>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
              </>
  );
};

export default AdminSalesDashboard;