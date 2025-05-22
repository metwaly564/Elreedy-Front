import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import ReactPaginate from 'react-paginate';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const OperationTeamDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citiesMap, setCitiesMap] = useState({});
  const [zonesMap, setZonesMap] = useState({});
  const [productsMap, setProductsMap] = useState({});
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  const [statusUpdateConfirm, setStatusUpdateConfirm] = useState(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  
  const ITEMS_PER_PAGE = 10;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('userToken');
  };

  // Create headers with token
  const getHeaders = () => {
    return {
      'Access-Token': getToken(),
      'Content-Type': 'application/json'
    };
  };

  // Fetch delivery boys
  const fetchDeliveryBoys = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users/all-deliveryBoys", {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch delivery boys');
      const data = await response.json();
      setDeliveryBoys(data.filter(boy => !boy.isDeleted));
    } catch (err) {
      toast.error(`Error fetching delivery boys: ${err.message}`);
    }
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort orders
  const sortedAndFilteredOrders = useMemo(() => {
    let sortableOrders = [...orders].filter(order => 
      order.status !== 'canceled' && order.status !== 'delivered'
    );
    
    if (searchTerm) {
      sortableOrders = sortableOrders.filter(order => 
        order.id.toString().includes(searchTerm) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.mainPhone && order.mainPhone.includes(searchTerm)) ||
        (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableOrders;
  }, [orders, sortConfig, searchTerm]);

  // Pagination logic
  const pageCount = Math.ceil(sortedAndFilteredOrders.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentOrders = sortedAndFilteredOrders.slice(offset, offset + ITEMS_PER_PAGE);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Fetch initial data
  useEffect(() => {
    const socket = io('http://localhost:3000', {
      auth: {
        token: getToken()
      }
    });

    const handleNewOrder = (order) => {
      if (order.status !== 'canceled' && order.status !== 'delivered') {
        setOrders(prev => {
          // Use Map for deduplication
          const uniqueOrders = new Map(prev.map(order => [order.id, order]));
          uniqueOrders.set(order.id, order);
          return Array.from(uniqueOrders.values());
        });
        playNotificationSound();
        toast.success(`New order received: #${order.id}`);
      }
    };

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join-operations-room');
    });

    socket.on('new-order', handleNewOrder);
    setSocket(socket);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const headers = getHeaders();
        
        // Fetch cities
        const citiesResponse = await fetch("http://127.0.0.1:3000/api/v1/places/city", { headers });
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const cities = await citiesResponse.json();
        setCitiesMap(Object.fromEntries(cities.map(city => [city.id, city.name])));

        // Fetch zones
        const zonesResponse = await fetch("http://127.0.0.1:3000/api/v1/places/zone", { headers });
        if (!zonesResponse.ok) throw new Error('Failed to fetch zones');
        const zones = await zonesResponse.json();
        setZonesMap(Object.fromEntries(zones.map(zone => [zone.id, zone.name])));

        // Fetch products
        const productsResponse = await fetch("http://127.0.0.1:3000/api/v1/products/product", { headers });
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const products = await productsResponse.json();
        setProductsMap(Object.fromEntries(products.map(prod => [prod.skuId, prod.nameEn])));

        // Fetch delivery boys
        await fetchDeliveryBoys();

        // Fetch orders
        const ordersResponse = await fetch(
          "http://127.0.0.1:3000/api/v1/orders?status=pending&status=ready&sort=date_asc&page=1&limit=100", 
          { headers }
        );
        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
        const ordersData = await ordersResponse.json();
        
        // Use Map to ensure unique orders when setting initial orders
        const uniqueOrders = new Map(ordersData.orders.map(order => [order.id, order]));
        setOrders(Array.from(uniqueOrders.values()));

      } catch (err) {
        setError(err.message);
        toast.error(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (getToken()) {
      fetchInitialData();
    }
  }, []);

  const playNotificationSound = () => {
    const alarmSound = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3');
    alarmSound.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      let endpoint = `http://127.0.0.1:3000/api/v1/orders/order-${status}/${orderId}`;
      let options = {
        method: 'POST',
        headers: getHeaders()
      };

      // For ready status, include delivery boy ID in the body
      if (status === 'ready') {
        if (!selectedDeliveryBoy) {
          throw new Error('Please select a delivery boy');
        }
        options.body = JSON.stringify({ deliveryBoyId: selectedDeliveryBoy });
      }

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update order status to ${status}`);
      }

      // Remove canceled/delivered orders from the list
      if (status === 'canceled' || status === 'delivered') {
        setOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        // Update status for other orders
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      }

      toast.success(`Order #${orderId} marked as ${status}`);
      setStatusUpdateConfirm(null);
      setSelectedDeliveryBoy(null);
    } catch (err) {
      toast.error(`Error updating order status: ${err.message}`);
    }
  };

  const handleStatusUpdateClick = (orderId, status) => {
    if (status === 'ready') {
      // For ready status, show delivery boy selection
      setStatusUpdateConfirm({ orderId, status });
    } else {
      // For other statuses, confirm directly
      if (window.confirm(`Are you sure you want to mark order #${orderId} as ${status}?`)) {
        updateOrderStatus(orderId, status);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className='flex flex-col justify-center p-4 text-sm font-alexandria font-light'>
      <ToastContainer position="top-right" autoClose={5000} />
      
      <h1 className="text-xl font-bold mb-4">Operation Team Dashboard</h1>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="flex-grow md:max-w-md">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full p-1 border rounded text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="p-2 text-left cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort('id')}
              >
                Order ID {sortConfig.key === 'id' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('customerName')}>
                Customer {sortConfig.key === 'customerName' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left w-[20%]">Address</th>
              <th className="p-2 text-left">Items</th>
              <th className="p-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('totalAmount')}>
                Total {sortConfig.key === 'totalAmount' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-2 text-left">Payment Method</th>
              <th className="p-2 text-left">Payment Status</th>
              <th className="p-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('status')}>
                Order Status {sortConfig.key === 'status' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => {
                const cityName = citiesMap[order.cityId] || 'Unknown';
                const zoneName = zonesMap[order.zoneId] || 'Unknown';
                const address = `${order.address}, ${zoneName}, ${cityName}`;

                const itemsSummary = order.orderItems?.map(item => 
                  `- ${productsMap[item.productId] || item.productId} x ${item.quantity}`
                ).join('\n') || 'No items';

                return (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{order.id || 'N/A'}</td>
                    <td className="p-2">{order.customerName || 'N/A'}</td>
                    <td className="p-2">{order.mainPhone || 'N/A'}</td>
                    <td className="p-2">{address}</td>
                    <td className="p-2 whitespace-pre-line max-w-xs truncate hover:whitespace-normal hover:max-w-none">
                      {itemsSummary}
                    </td>
                    <td className="p-2">{order.totalAmount?.toFixed(2) || '0.00'}EGP</td>
                    <td className="p-2">{order.paymentMethod || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-1 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-red-100 text-red-800' : 'bg-red-100 text-red-800'}`}>
                        {order.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-1 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-2 space-y-1 min-w-[120px]">
                      <button
                        onClick={() => handleStatusUpdateClick(order.id, 'viewed')}
                        className="w-full p-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                      >
                        Viewed
                      </button>
                      <button
                        onClick={() => handleStatusUpdateClick(order.id, 'ready')}
                        className="w-full p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                      >
                        Ready
                      </button>
                      <button
                        onClick={() => handleStatusUpdateClick(order.id, 'delivered')}
                        className="w-full p-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs"
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => handleStatusUpdateClick(order.id, 'canceled')}
                        className="w-full p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="p-2 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredOrders.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-2">
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'flex items-center space-x-1 text-sm'}
            pageClassName={'px-2 py-0.5 border rounded text-sm'}
            pageLinkClassName={'text-blue-600'}
            activeClassName={'bg-blue-600 text-white'}
            previousClassName={'px-2 py-0.5 border rounded text-sm'}
            nextClassName={'px-2 py-0.5 border rounded text-sm'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Delivery Boy Selection Modal for Ready Status */}
      {statusUpdateConfirm?.status === 'ready' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full text-sm">
            <h3 className="text-md font-semibold mb-2">Select Delivery Boy for Order #{statusUpdateConfirm.orderId}</h3>
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedDeliveryBoy || ''}
              onChange={(e) => setSelectedDeliveryBoy(Number(e.target.value))}
            >
              <option value="">Select Delivery Boy</option>
              {deliveryBoys.map(boy => (
                <option key={boy.id} value={boy.id}>
                  {boy.name} ({boy.phone})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setStatusUpdateConfirm(null);
                  setSelectedDeliveryBoy(null);
                }}
                className="px-3 py-1 border rounded hover:bg-gray-100 text-sm" 
              >
                Cancel
              </button>
              <button
                onClick={() => updateOrderStatus(statusUpdateConfirm.orderId, 'ready')}
                disabled={!selectedDeliveryBoy}
                className={`px-3 py-1 text-white rounded hover:opacity-90 text-sm ${
                  !selectedDeliveryBoy ? 'bg-gray-400' : 'bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    </>
  );
};

export default OperationTeamDashboard;
const addUniqueOrder = (newOrder) => {
  setOrders(prev => {
    const uniqueOrders = new Map(prev.map(order => [order.id, order]));
    uniqueOrders.set(newOrder.id, newOrder);
    return Array.from(uniqueOrders.values());
  });
};