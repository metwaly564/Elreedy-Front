import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../Context/CartContexrt';
import { Link } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Form states
  const [editMode, setEditMode] = useState(false);
  const [phoneEditMode, setPhoneEditMode] = useState(false);
  // Add this line if you want a separate edit mode for the name
  const [editNameMode, setEditNameMode] = useState(false);
  const [editPasswordMode, setEditPasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  const { isArabic } = useContext(UserContext);
  // Fetch user data on component mount and when refreshTrigger changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://127.0.0.1:3000/api/v1/users/user', {
          headers: {
            'Access-Token': token
          }
        });

        setUserData(response.data);
        setFormData(prev => ({
          ...prev,
          name: response.data.name
        }));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneInputChange = (e) => {
    const { name, value } = e.target;
    setPhoneForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update user data
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare the update data
      const updateData = {};
      if (formData.name && formData.name !== userData.name) {
        updateData.name = formData.name;
      }
      if (formData.password) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        updateData.password = formData.password;
        if (formData.newPassword) {
          updateData.newPassword = formData.newPassword;
        }
      }

      // Only send request if there's something to update
      if (Object.keys(updateData).length > 0) {
        await axios.patch(
          'http://127.0.0.1:3000/api/v1/users/user',
          updateData,
          {
            headers: {
              'Access-Token': token
            }
          }
        );

        setSuccessMessage('Profile updated successfully!');
        setEditMode(false);
        // Trigger refresh by incrementing the refreshTrigger
        setRefreshTrigger(prev => prev + 1);
      } else {
        setSuccessMessage('No changes detected');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user data');
    }
  };

  // Handle phone number update
  const handleSendOtp = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        'http://127.0.0.1:3000/api/v1/users/updatePhone',
        { phone: phoneForm.phone },
        {
          headers: {
            'Access-Token': token
          }
        }
      );

      setOtpSent(true);
      setSuccessMessage('OTP sent to your new phone number');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        'http://127.0.0.1:3000/api/v1/users/VerefyPhone',
        phoneForm,
        {
          headers: {
            'Access-Token': token
          }
        }
      );

      setSuccessMessage('Phone number updated and verified successfully!');
      setPhoneEditMode(false);
      setOtpSent(false);
      setPhoneForm({ phone: '', otp: '' });
      // Trigger refresh by incrementing the refreshTrigger
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify phone number');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="max-w-md mx-auto mt-[18vh] p-6 bg-white rounded-lg shadow-md text-center" style={{ fontFamily: "'Alexandria', sans-serif" }}>
        <h2 className="text-2xl font-bold text-red-600 mb-4">{isArabic ? "يرجى تسجيل الدخول" : "Please Login First"}</h2>
        <p className="text-gray-700 mb-4 font-medium">{isArabic ? "يجب عليك تسجيل الدخول للوصول إلى إعدادات الحساب" : "You need to login to access account settings"}</p>
        <Link to="/login" className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium">
          {isArabic ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={`max-w-4xl mx-auto p-6 mt-28 mb-80px font-medium ${isArabic ? 'text-right' : ''}`} style={{ fontFamily: "'Alexandria', sans-serif" }}>
        <h1 className={`text-3xl font-bold text-gray-800 mb-1 overflow-y-hidden py-2 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? "إعدادات الحساب" : "Account Settings"}</h1>
        
        {/* Success and Error messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
    
        {/* User Info Section */}
        <div className={`bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 mb-6 sm:mb-8 ${isArabic ? 'text-right' : ''}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 ${isArabic ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <h2 className={`w-full text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-0 overflow-y-hidden ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? "المعلومات الشخصية" : "Personal Information"}</h2>
          </div>
    
          {/* Name Edit Section */}
          {!editNameMode ? (
            <div className={`flex items-center mb-4 ${isArabic ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div>
                <p className={`text-xs sm:text-sm font-medium text-gray-500 ${isArabic ? 'text-right' : ''}`}>{isArabic ? 'الاسم' : 'Name'}</p>
                <div className="w-full">
                  <p className={`text-base sm:text-lg text-gray-800 ${isArabic ? 'text-right' : ''}`}>{userData.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditNameMode(true)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm sm:text-base text-center"
              >
                {isArabic ? 'تعديل الاسم' : 'Edit Name'}
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setSuccessMessage('');
                try {
                  const token = localStorage.getItem('userToken');
                  if (!token) throw new Error('No authentication token found');
                  if (!formData.name || formData.name === userData.name) {
                    setSuccessMessage('No changes detected');
                    setEditNameMode(false);
                    return;
                  }
                  await axios.patch(
                    'http://127.0.0.1:3000/api/v1/users/user',
                    { name: formData.name },
                    { headers: { 'Access-Token': token } }
                  );
                  setSuccessMessage('Name updated successfully!');
                  setEditNameMode(false);
                  setRefreshTrigger(prev => prev + 1);
                } catch (err) {
                  setError(err.response?.data?.message || err.message || 'Failed to update name');
                }
              }}
              className="flex items-center gap-4 mb-4"
            >
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => {
                  setEditNameMode(false);
                  setError('');
                  setSuccessMessage('');
                  setFormData(prev => ({ ...prev, name: userData.name }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-xs sm:text-xs text-center"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs sm:text-xs text-center"
              >
                {isArabic ? 'حفظ' : 'Save'}
              </button>
            </form>
          )}
    
          {/* Password Edit Section */}
          {!editPasswordMode ? (
            <div className={`flex items-center mb-4 ${isArabic ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
              <div>
                <p className={`text-xs sm:text-sm font-medium text-gray-500 ${isArabic ? 'text-right' : ''}`}>{isArabic ? 'كلمة المرور' : 'Password'}</p>
                <div className="w-full">
                  <p className={`text-base sm:text-lg text-gray-800 ${isArabic ? 'text-right' : ''}`}>********</p>
                </div>
              </div>
              <button
                onClick={() => setEditPasswordMode(true)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm sm:text-base text-center"
              >
                {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
              </button>
            </div>
          ) : (
            <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError('');
                  setSuccessMessage('');
                  try {
                    const token = localStorage.getItem('userToken');
                    if (!token) throw new Error('No authentication token found');
                    if (!formData.password || !formData.newPassword || !formData.confirmPassword) {
                      throw new Error('Please fill all password fields');
                    }
                    if (formData.newPassword !== formData.confirmPassword) {
                      throw new Error('New passwords do not match');
                    }
                    await axios.patch(
                      'http://127.0.0.1:3000/api/v1/users/user',
                      {
                        password: formData.password,
                        newPassword: formData.newPassword
                      },
                      { headers: { 'Access-Token': token } }
                    );
                    setSuccessMessage('Password updated successfully!');
                    setEditPasswordMode(false);
                    setFormData(prev => ({
                      ...prev,
                      password: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  } catch (err) {
                    setError(err.response?.data?.message || err.message || 'Failed to update password');
                  }
                }}
                className="space-y-2 mt-4"
              >
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    placeholder="Enter Old Password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    placeholder="Enter New Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                    placeholder="Confirm New Password"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditPasswordMode(false);
                      setError('');
                      setSuccessMessage('');
                      setFormData(prev => ({
                        ...prev,
                        password: '',
                        newPassword: '',
                        confirmPassword: ''
                      }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-xs sm:text-xs text-center"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs sm:text-xs text-center"
                  >
                    {isArabic ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            )}
            </div>
    
            {/* Phone Number Section */}
            <div className={`bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 ${isArabic ? 'text-right' : ''}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 ${isArabic ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                {isArabic ? (
                  <>
                    {!phoneEditMode && (
                      <button
                        onClick={() => setPhoneEditMode(true)}
                        className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm sm:text-base text-center"
                      >
                        {userData.phone ? 'تحديث' : 'إضافة'}
                      </button>
                    )}
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0 overflow-y-hidden text-right">رقم الهاتف</h2>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0 overflow-y-hidden">Phone Number</h2>
                    {!phoneEditMode && (
                      <button
                        onClick={() => setPhoneEditMode(true)}
                        className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm sm:text-base text-center"
                      >
                        {userData.phone ? 'Update' : 'Add'} Phone
                      </button>
                    )}
                  </>
                )}
              </div>
    
              {!phoneEditMode ? (
                <div>
                  <p className={`text-xs sm:text-sm font-medium text-gray-500 ${isArabic ? 'text-right' : ''}`}>Phone Number</p>
                  <div className="w-full">
                    <p className={`text-base sm:text-lg text-gray-800 ${isArabic ? 'text-right' : ''}`}>{userData.phone || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={otpSent ? handleVerifyPhone : handleSendOtp}>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label htmlFor="phone" className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1 ${isArabic ? 'text-right' : ''}`}>
                        {otpSent ? 'Verification Code Sent to' : 'New'} Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phoneForm.phone}
                        onChange={handlePhoneInputChange}
                        disabled={otpSent}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base ${otpSent ? 'bg-gray-100' : ''}`}
                        placeholder="e.g., 01019072717"
                      />
                    </div>
    
                    {otpSent && (
                      <div>
                        <label htmlFor="otp" className={`block text-xs sm:text-sm font-medium text-gray-700 mb-1 ${isArabic ? 'text-right' : ''}`}>
                          Verification Code (OTP)
                        </label>
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          value={phoneForm.otp}
                          onChange={handlePhoneInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                          placeholder="Enter the 6-digit code"
                        />
                      </div>
                    )}
    
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneEditMode(false);
                          setOtpSent(false);
                          setError('');
                          setSuccessMessage('');
                          setPhoneForm({ phone: '', otp: '' });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-xs sm:text-xs text-center"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs sm:text-xs text-center"
                      >
                        {isArabic ? 'حفظ' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
      </>
    );
  
};

export default Account;