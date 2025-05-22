import React, { useState, useEffect } from 'react';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const UsersAnalysis = () => {
  // Correctly get token from localStorage
  const token = localStorage.getItem("userToken");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchColumn, setSearchColumn] = useState('1');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { title: "User ID", key: "id" },
    { title: "Name", key: "name" },
    { title: "Email", key: "email" },
    { title: "Role", key: "role" },
    { title: "Phone", key: "phone" },
    { title: "Created At", key: "createdAt" },
    { title: "LTV", key: "ltv" },
    { title: "Orders Count", key: "ordersCount" }
  ];

  const fetchUsers = async () => {
    try {
      if (!token) {
        throw new Error("No authentication token found");
      }

      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/users/user-analysis?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            "Access-Token": token
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add null check for data.users
      if (!data.users) {
        throw new Error("Users data not found in response");
      }

      setUsers(data.users);
      setTotalPages(data.totalPages || 1); // Default to 1 if totalPages is undefined
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      setUsers([]); // Set empty array to prevent rendering errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit]);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  if (!token) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-red-500 dark:text-red-400">
          Error: Authentication token not found. Please login again.
        </div>
      </div>
    );
  }

  return (
    <>
  <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 font-alexandria font-light">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Users Analysis</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-200 dark:text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select
          id="searchColumn"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value)}
        >
          <option value="1">Name</option>
          <option value="2">Email</option>
          <option value="3">Role</option>
          <option value="4">Phone</option>
        </select>
        <input
          type="text"
          id="columnSearchInput"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Search column..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.ltv?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.ordersCount || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <label htmlFor="limitSelect" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                Rows per page:
              </label>
              <select
                id="limitSelect"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={limit}
                onChange={handleLimitChange}
              >
                {[5, 10, 20, 50].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    
    </>
  );
};

export default UsersAnalysis;