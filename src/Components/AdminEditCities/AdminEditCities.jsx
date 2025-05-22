import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

export default function AdminEditCities() {
  const TestToken = localStorage.getItem('userToken');

  const [cities, setCities] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [newCityName, setNewCityName] = useState('');
  const [newZoneData, setNewZoneData] = useState({
    name: '',
    cityId: '',
    deliveryFee: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });

  // Constants for pagination
  const ITEMS_PER_PAGE = 5;

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, zonesRes] = await Promise.all([
          fetch('http://127.0.0.1:3000/api/v1/places/city'),
          fetch('http://127.0.0.1:3000/api/v1/places/zone')
        ]);

        if (!citiesRes.ok || !zonesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const citiesData = await citiesRes.json();
        const zonesData = await zonesRes.json();

        // Map zones to cities
        const citiesWithZones = citiesData.map(city => ({
          ...city,
          zones: zonesData.filter(zone => zone.cityId === city.id)
        }));

        setCities(citiesWithZones);
        setAllZones(zonesData);
        toast.success('Data loaded successfully');
      } catch (err) {
        setError(err.message);
        toast.error(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Validate form functions
  const validateCityForm = () => {
    const errors = {};
    if (!newCityName.trim()) errors.cityName = 'City name is required';
    return errors;
  };

  const validateZoneForm = () => {
    const errors = {};
    if (!newZoneData.name.trim()) errors.zoneName = 'Zone name is required';
    if (!newZoneData.cityId) errors.cityId = 'City must be selected';
    if (newZoneData.deliveryFee < 0) errors.deliveryFee = 'Delivery fee must be positive';
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

  const sortedCities = useMemo(() => {
    let sortableCities = [...cities];
    if (sortConfig.key) {
      sortableCities.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCities;
  }, [cities, sortConfig]);

  // Filter cities based on search term
  const filteredCities = sortedCities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.id.toString().includes(searchTerm) ||
    city.zones.some(zone => 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    city.zones.some(zone => 
      zone.deliveryFee.toString().includes(searchTerm))
  );

  // Pagination logic
  const pageCount = Math.ceil(filteredCities.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentCities = filteredCities.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // City CRUD operations
  const createCity = async () => {
    const errors = validateCityForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({ name: newCityName })
      });

      if (!response.ok) throw new Error('Failed to create city');

      const newCity = await response.json();
      setCities([...cities, { ...newCity, zones: [] }]);
      setNewCityName('');
      setFormErrors({});
      toast.success('City created successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error creating city: ${err.message}`);
    }
  };

  const updateCity = async () => {
    if (!editingCity?.name?.trim()) {
      toast.error('City name cannot be empty');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/city', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({
          id: editingCity.id,
          name: editingCity.name
        })
      });
  
      if (response.ok) {
        setCities(cities.map(city => 
          city.id === editingCity.id ? { ...city, name: editingCity.name } : city
        ));
        setEditingCity(null);
        toast.success('City updated successfully');
      } else {
        throw new Error('Failed to update city');
      }
    } catch (err) {
      console.error('Error updating city:', err);
      toast.error(`Error updating city: ${err.message}`);
    }
  };

  const deleteCity = async (cityId) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/city', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({ id: cityId })
      });

      if (!response.ok) throw new Error('Failed to delete city');

      setCities(cities.filter(city => city.id !== cityId));
      setDeleteConfirm(null);
      toast.success('City deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error deleting city: ${err.message}`);
    }
  };

  // Zone CRUD operations
  const createZone = async () => {
    const errors = validateZoneForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/zone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify(newZoneData)
      });

      if (!response.ok) throw new Error('Failed to create zone');

      const newZone = await response.json();
      setAllZones([...allZones, newZone]);
      
      setCities(cities.map(city => 
        city.id === newZone.cityId 
          ? { ...city, zones: [...city.zones, newZone] } 
          : city
      ));
      
      setNewZoneData({ name: '', cityId: '', deliveryFee: 0 });
      setFormErrors({});
      toast.success('Zone created successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error creating zone: ${err.message}`);
    }
  };

  const updateZone = async () => {
    if (!editingZone?.name?.trim()) {
      toast.error('Zone name cannot be empty');
      return;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/zone', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({
          id: editingZone.id, // Added zone ID to the request body
          name: editingZone.name,
          cityId: editingZone.cityId,
          deliveryFee: editingZone.deliveryFee
        })
      });
  
      if (response.ok) {
        setAllZones(allZones.map(zone => 
          zone.id === editingZone.id ? { 
            ...zone, 
            name: editingZone.name,
            cityId: editingZone.cityId,
            deliveryFee: editingZone.deliveryFee
          } : zone
        ));
        
        setCities(cities.map(city => ({
          ...city,
          zones: city.zones.map(zone => 
            zone.id === editingZone.id ? { 
              ...zone, 
              name: editingZone.name,
              cityId: editingZone.cityId,
              deliveryFee: editingZone.deliveryFee
            } : zone
          )
        })));
        
        setEditingZone(null);
        toast.success('Zone updated successfully');
      } else {
        throw new Error('Failed to update zone');
      }
    } catch (err) {
      console.error('Error updating zone:', err);
      toast.error(`Error updating zone: ${err.message}`);
    }
  };

  const deleteZone = async (zoneId) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/places/zone', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TestToken
        },
        body: JSON.stringify({ id: zoneId })
      });

      if (!response.ok) throw new Error('Failed to delete zone');

      setAllZones(allZones.filter(zone => zone.id !== zoneId));
      
      setCities(cities.map(city => ({
        ...city,
        zones: city.zones.filter(zone => zone.id !== zoneId)
      })));
      
      setDeleteConfirm(null);
      toast.success('Zone deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error deleting zone: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
    <div className='flex flex-col justify-center p-4 font-alexandria font-light'>
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
              placeholder="Search cities or zones..."
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Items per page:</span>
            <select 
              className="border p-2 rounded"
              value={ITEMS_PER_PAGE}
              disabled
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New City Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New City</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="City name"
              className={`border p-2 rounded w-full ${formErrors.cityName ? 'border-red-500' : ''}`}
            />
            {formErrors.cityName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.cityName}</p>
            )}
          </div>
          <button
            onClick={createCity}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Add City
          </button>
        </div>
      </div>

      {/* Add New Zone Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Add New Zone</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <select
              value={newZoneData.cityId}
              onChange={(e) => setNewZoneData({...newZoneData, cityId: parseInt(e.target.value)})}
              className={`border p-2 rounded w-full ${formErrors.cityId ? 'border-red-500' : ''}`}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
            {formErrors.cityId && (
              <p className="text-red-500 text-sm mt-1">{formErrors.cityId}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={newZoneData.name}
              onChange={(e) => setNewZoneData({...newZoneData, name: e.target.value})}
              placeholder="Zone name"
              className={`border p-2 rounded w-full ${formErrors.zoneName ? 'border-red-500' : ''}`}
            />
            {formErrors.zoneName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.zoneName}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={newZoneData.deliveryFee}
              onChange={(e) => setNewZoneData({...newZoneData, deliveryFee: parseInt(e.target.value) || 0})}
              placeholder="Delivery fee"
              className={`border p-2 rounded w-full ${formErrors.deliveryFee ? 'border-red-500' : ''}`}
              min="0"
            />
            {formErrors.deliveryFee && (
              <p className="text-red-500 text-sm mt-1">{formErrors.deliveryFee}</p>
            )}
          </div>
          <button
            onClick={createZone}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
            disabled={!newZoneData.cityId || !newZoneData.name}
          >
            Add Zone
          </button>
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th 
                className="p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('id')}
              >
                City ID {sortConfig.key === 'id' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('name')}
              >
                City Name {sortConfig.key === 'name' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-3">Zones</th>
              <th className="p-3">Controls</th>
            </tr>
          </thead>
          <tbody>
            {currentCities.length > 0 ? (
              currentCities.map((city) => (
                <React.Fragment key={city.id}>
                  {/* City Row */}
                  <tr className="border-t">
                    <td className="p-3">{city.id}</td>
                    <td className="p-3">
                      {editingCity?.id === city.id ? (
                        <input
                          type="text"
                          value={editingCity.name}
                          onChange={(e) => setEditingCity({...editingCity, name: e.target.value})}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        city.name
                      )}
                    </td>
                    <td className="p-3">
                      {city.zones.length > 0 ? (
                        <ul className="space-y-2">
                          {city.zones.map(zone => (
                            <li key={zone.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <div>
                                {editingZone?.id === zone.id ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={editingZone.name}
                                      onChange={(e) => setEditingZone({...editingZone, name: e.target.value})}
                                      className="border p-1 rounded"
                                    />
                                    <input
                                      type="number"
                                      value={editingZone.deliveryFee}
                                      onChange={(e) => setEditingZone({...editingZone, deliveryFee: parseInt(e.target.value) || 0})}
                                      className="border p-1 rounded"
                                      min="0"
                                    />
                                  </div>
                                ) : (
                                  <span>
                                    {zone.name} (Delivery Fee: {zone.deliveryFee})
                                  </span>
                                )}
                              </div>
                              <div className="space-x-1">
                                {editingZone?.id === zone.id ? (
                                  <>
                                    <button
                                      className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                                      onClick={updateZone}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="bg-gray-500 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded"
                                      onClick={() => setEditingZone(null)}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                                      onClick={() => setEditingZone(zone)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                                      onClick={() => setDeleteConfirm({
                                        type: 'zone',
                                        id: zone.id,
                                        name: zone.name
                                      })}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">No Zones</span>
                      )}
                    </td>
                    <td className="p-3 space-x-1">
                      {editingCity?.id === city.id ? (
                        <>
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                            onClick={updateCity}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-sm"
                            onClick={() => setEditingCity(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm"
                            onClick={() => setEditingCity(city)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                            onClick={() => setDeleteConfirm({
                              type: 'city',
                              id: city.id,
                              name: city.name
                            })}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No cities found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredCities.length > ITEMS_PER_PAGE && (
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
            pageLinkClassName={'text-blue-600'}
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
            <h3 className="text-lg font-semibold mb-4">
              Confirm Delete {deleteConfirm.type}
            </h3>
            <p className="mb-4">
              Are you sure you want to delete {deleteConfirm.type} "{deleteConfirm.name}"?
              {deleteConfirm.type === 'city' && ' This will also delete all its zones.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'city') {
                    deleteCity(deleteConfirm.id);
                  } else {
                    deleteZone(deleteConfirm.id);
                  }
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