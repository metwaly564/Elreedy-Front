import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const PromoCodesAnalysis = () => {
  const navigate = useNavigate();
  
  // Get token from localStorage
  const [token, setToken] = useState('');
  const [promoCodes, setPromoCodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchColumn, setSearchColumn] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { title: "Code", key: "code" },
    { title: "Type", key: "type" },
    { title: "Discount Type", key: "discountType" },
    { title: "Value", key: "value" },
    { title: "Discount Limit", key: "discountLimit" },
    { title: "Budget", key: "budget" },
    { title: "Current Budget", key: "currentBudget" },
    { title: "Is Active", key: "isActive" },
    { title: "Expiration Date", key: "expirationDate" },
    { title: "Uses Count", key: "usesCount" }
  ];

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      setToken(userToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchPromoCodes = async () => {
    try {
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/promocodes/promocode-analysis?page=${currentPage}&limit=${limit}`,
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
      setPromoCodes(data.promoCodes);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      setError(error.message);
      if (error.message.includes('401')) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPromoCodes();
    }
  }, [currentPage, limit, token]);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPromoCodes();
  };

  if (!token) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-red-500 dark:text-red-400">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 font-alexandria font-light">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Promo Codes Analysis</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-200 dark:text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <label htmlFor="searchColumn" className="text-sm text-gray-700 dark:text-gray-300">
          Search by:
        </label>
        <select
          id="searchColumn"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value)}
        >
          {columns.map((col, index) => (
            <option key={col.key} value={index}>{col.title}</option>
          ))}
        </select>
        <input
          type="text"
          id="columnSearchInput"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Search value"
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
                {promoCodes.map((promo) => (
                  <tr key={promo.code}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.discountType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {promo.discountLimit ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.budget}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.currentBudget}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {promo.isActive ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {promo.expirationDate ? new Date(promo.expirationDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{promo.usesCount}</td>
                  </tr>
                ))}
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
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
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

export default PromoCodesAnalysis;