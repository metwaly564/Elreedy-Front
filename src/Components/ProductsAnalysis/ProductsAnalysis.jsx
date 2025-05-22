import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import AdminNavbar from '../AdminNavbar/AdminNavbar';

const ProductsAnalysis = () => {
  const { token } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchColumn, setSearchColumn] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: "skuId", key: "skuId" },
    { title: "nameEn", key: "nameEn" },
    { title: "company", key: "company" },
    { title: "priceBefore", key: "priceBefore" },
    { title: "priceAfter", key: "priceAfter" },
    { title: "availableStock", key: "availableStock" },
    { title: "itemRank", key: "itemRank" },
    { title: "productViews", key: "productViews" },
    { title: "productPageOpened", key: "productPageOpened" },
    { title: "cartAdditions", key: "cartAdditions" },
    { title: "timesPurchased", key: "timesPurchased" }
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/v1/products?page=${currentPage}&limit=${limit}`, {
        headers: {
          "Access-Token": token
        }
      });
      const data = await response.json();
      setProducts(data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, limit]);

  const handleSearch = () => {
    // Implement search functionality
    fetchProducts();
  };

  return (
    <>
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 font-alexandria font-light">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Product Data Table</h2>

      <div className="mb-6 flex items-center">
        <label htmlFor="searchColumn" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
          Search by:
        </label>
        <select
          id="searchColumn"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 mr-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={searchColumn}
          onChange={(e) => setSearchColumn(e.target.value)}
          >
          <option value="0">skuId</option>
          <option value="1">nameEn</option>
          <option value="2">company</option>
          <option value="3">priceBefore</option>
          <option value="4">priceAfter</option>
          <option value="5">availableStock</option>
          <option value="6">itemRank</option>
          <option value="7">productViews</option>
          <option value="8">productPageOpened</option>
          <option value="9">cartAdditions</option>
          <option value="10">timesPurchased</option>
        </select>
        <input
          type="text"
          id="columnSearchInput"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 mr-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Search value"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
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
              {products.map((product) => (
                <tr key={product.skuId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.skuId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.nameEn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.priceBefore}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.priceAfter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.availableStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.itemRank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.productViews}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.productViews}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.cartAdditions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.timesPurchased || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
      </>
  );
};

export default ProductsAnalysis;