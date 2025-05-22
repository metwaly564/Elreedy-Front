import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminEditStaff.module.css';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditStaff() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'operation',
    address: ''
  });

  // Get user token from local storage
  const getToken = () => {
    return localStorage.getItem('userToken');
  };

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/users/all-staff', {
        headers: {
          'Access-Token': getToken()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff data');
      }

      const data = await response.json();
      setStaffList(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch single staff member
  const fetchStaffById = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/v1/users/staff/${id}`, {
        headers: {
          'Access-Token': getToken()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff data');
      }

      const data = await response.json();
      setSelectedStaff(data);
      setFormData({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: '',
        role: data.role,
        address: data.address || ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      let response;
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };

      // Include password only when adding new staff or when it's provided for update
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isAdding) {
        // Add new staff
        response = await fetch('http://127.0.0.1:3000/api/v1/users/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': getToken()
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Update existing staff
        payload.id = formData.id;
        response = await fetch('http://127.0.0.1:3000/api/v1/users/staff', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': getToken()
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process request');
      }

      const result = await response.text();
      setSuccessMessage(result || (isAdding ? 'Staff added successfully!' : 'Staff updated successfully!'));
      fetchStaff(); // Refresh the list
      setIsAdding(false);
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'operation',
        address: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete staff member
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users/staff/${id}`, {
          method: 'DELETE',
          headers: {
            'Access-Token': getToken()
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete staff');
        }

        const result = await response.text();
        setSuccessMessage(result || 'Staff deleted successfully!');
        fetchStaff(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Initialize component
  useEffect(() => {
    fetchStaff();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading staff data...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <>
    <div className={`${styles.container} font-alexandria font-light`}>
      <h1 className={styles.title}>Staff Management</h1>

      <div className={`${styles.content} font-alexandria font-light`}>
        {/* Staff List - now with scrollable container */}
        <div className={styles.staffListContainer}>
          <div className={styles.staffList}>
            <div className={styles.listHeader}>
              <h2>Staff Members</h2>
              <button 
                onClick={() => {
                  setIsAdding(true);
                  setSelectedStaff(null);
                  setFormData({
                    id: '',
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'operation',
                    address: ''
                  });
                }}
                className={styles.addButton}
                >
                Add New Staff
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.staffTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th className={styles.actionsColumn}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(staff => (
                    <tr 
                    key={staff.id} 
                    className={`${styles.staffRow} ${selectedStaff?.id === staff.id ? styles.selectedRow : ''}`}
                    onClick={() => {
                      fetchStaffById(staff.id);
                      setIsAdding(false);
                    }}
                    >
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phone}</td>
                      <td>{staff.role}</td>
                      <td className={styles.actionsCell}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(staff.id);
                          }}
                          className={styles.deleteButton}
                          >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Staff Form - now with fixed position */}
        <div className={styles.staffFormContainer}>
          <div className={styles.staffForm}>
            <h2>{isAdding ? 'Add New Staff' : selectedStaff ? 'Edit Staff' : 'Select a staff member'}</h2>
            
            {(isAdding || selectedStaff) && (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    />
                </div>

                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    >
                    <option value="operation">Operation</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Password {!isAdding && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={isAdding}
                    />
                </div>

                <div className={styles.formGroup}>
                  <label>Address (optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    />
                </div>

                <div className={styles.formActions}>
                  {!isAdding && (
                    <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setSelectedStaff(null);
                      setFormData({
                        id: '',
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: 'operation',
                        address: ''
                      });
                    }}
                    className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className={styles.submitButton}>
                    {isAdding ? 'Add Staff' : 'Update Staff'}
                  </button>
                </div>
              </form>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
            </>
  );
}