import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { CartContext } from "../../Context/CartContexrt";
import { UserContext } from "../../Context/UserContext";
import { CounterContext } from "../../Context/CounterContext";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import style from "./TagDetails.module.css";
import { FaHeart, FaEye, FaTimes } from "react-icons/fa";
import cart from "../../assets/cart.png";

export default function TagDetails() {
  const { id } = useParams();
  const { addToCart, addToWishlist, wishlist } = useContext(CartContext);
  const { isArabic } = useContext(UserContext);
  const { maxSearch, setmaxSearch, setminSearch, minSearch } = useContext(CounterContext);

  const [tag, setTag] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [currentSort, setCurrentSort] = useState("newest");
  const [priceFilterApplied, setPriceFilterApplied] = useState(false);
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(5000);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const sliderRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=No+Image";

  useEffect(() => {
    setminSearch(0);
    setmaxSearch(5000);
  }, [setminSearch, setmaxSearch]);

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://127.0.0.1:3000/api/v1/tags/tag/${id}`);

        setTag(response.data);
        const productsWithImages = response.data.products.map(product => ({
          ...product.product,
          Images: product.product.Images || []
        }));
        setProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching tag data:", error);
        toast.error(isArabic ? "Failed to load tag" : "فشل تحميل العلامة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagData();
  }, [id, isArabic]);

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/v1/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const applySorting = (products, sortOption) => {
    if (!products) return [];

    const sortedProducts = [...products];

    // First apply the default sorting by rank and ID
    sortedProducts.sort((a, b) => {
      // First sort by rank
      if ((a.itemRank || 0) !== (b.itemRank || 0)) {
        return (a.itemRank || 0) - (b.itemRank || 0);
      }
      // If ranks are equal, sort by ID to maintain consistent order
      return a.id - b.id;
    });

    // Then apply any additional sorting if specified
    switch (sortOption) {
      case "newest":
        return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "price_asc":
        return sortedProducts.sort((a, b) => a.priceAfter - b.priceAfter);
      case "price_desc":
        return sortedProducts.sort((a, b) => b.priceAfter - a.priceAfter);
      case "name_asc":
        return sortedProducts.sort((a, b) => (a.nameEn || a.nameAr || "").localeCompare(b.nameEn || b.nameAr || ""));
      case "name_desc":
        return sortedProducts.sort((a, b) => (b.nameEn || b.nameAr || "").localeCompare(a.nameEn || a.nameAr || ""));
      default:
        return sortedProducts;
    }
  };

  const applyPriceFiltering = (products) => {
    if (!priceFilterApplied) return products;
    return products.filter(product =>
      product.priceAfter >= minSearch && product.priceAfter <= maxSearch
    );
  };

  // Apply category filtering
  const applyCategoryFiltering = (products) => {
    if (!selectedCategory) return products;
    return products.filter(product =>
      product.productCategories &&
      product.productCategories.some(catObj => catObj.category.id === selectedCategory.id)
    );
  };

  const handleSort = (sortOption) => {
    setCurrentSort(sortOption);
  };

  const applyPriceFilter = () => {
    setminSearch(tempMin);
    setmaxSearch(tempMax);
    setPriceFilterApplied(true);
  };

  const resetPriceFilter = () => {
    setTempMin(0);
    setTempMax(5000);
    setminSearch(0);
    setmaxSearch(5000);
    setPriceFilterApplied(false);
  };

  // Reset category filter
  const resetCategoryFilter = () => {
    setSelectedCategory(null);
  };

  useEffect(() => {
    if (products) {
      let filtered = [...products];
      filtered = applyPriceFiltering(filtered);
      filtered = applyCategoryFiltering(filtered);
      filtered = applySorting(filtered, currentSort);
      setFilteredProducts(filtered);
    }
  }, [products, currentSort, minSearch, maxSearch, priceFilterApplied, selectedCategory]);

  const handleQuickViewClick = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProduct(null);
  };

  const handleTouchStart = (e, isMin) => {
    e.preventDefault();
    const touch = e.touches[0];
    const slider = sliderRef.current;
    const sliderRect = slider.getBoundingClientRect();
    const sliderWidth = sliderRect.width;

    const handleTouchMove = (moveEvent) => {
      moveEvent.preventDefault();
      const touch = moveEvent.touches[0];
      const newPosition = ((touch.clientX - sliderRect.left) / sliderWidth) * 100;

      if (isMin) {
        const boundedPosition = Math.min(Math.max(newPosition, 0), (tempMax / 5000 * 100));
        const newMinValue = Math.round((boundedPosition / 100) * 5000);
        setTempMin(newMinValue);
      } else {
        const boundedPosition = Math.min(Math.max(newPosition, (tempMin / 5000 * 100)), 100);
        const newMaxValue = Math.round((boundedPosition / 100) * 5000);
        setTempMax(newMaxValue);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSort(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isInWishlist = (productId) => {
    return wishlist?.some(item => item.skuId === productId);
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Alexandria', sans-serif",
          },
        }}
      />
      <div className="mx-auto px-0.5 sm:px-4 relative mt-[18vh] mb-[12vh] bg-gray-100" style={{ fontFamily: "'Alexandria', sans-serif" }}>
        {/* Mobile Filter and Sort Buttons */}
        <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2" style={{ zIndex: "47" }}>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
            onClick={() => setShowSort(true)}
          >
            <span className={`font-alexandria font-light ${isArabic ? "text-[17.5px]" : ""}`}>{isArabic ? 'ترتيب' : 'Sort'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
            onClick={() => setShowFilters(true)}
          >
            <span className="font-alexandria font-light">{isArabic ? 'تصفية' : 'Filter'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Mobile Overlays */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300 md:hidden ${(showFilters || showSort) ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => {
            setShowFilters(false);
            setShowSort(false);
          }}
        ></div>

        <div className={`flex flex-col ${isArabic ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
          {/* Filters Sidebar */}
          <div
            className={`fixed md:sticky top-0 ${isArabic ? 'right-0' : 'left-0'} h-screen md:h-[calc(100vh-18vh)] w-3/4 md:w-1/4 lg:w-1/5 bg-white md:bg-transparent z-[70] md:z-20 transform transition-transform duration-300 ease-in-out md:transform-none md:transition-none ${isArabic ? 'md:pl-6' : 'md:pr-6'} overflow-y-auto ${showFilters ? 'translate-x-0' : isArabic ? 'translate-x-full' : '-translate-x-full'
              } md:translate-x-0`}
          >
            <div className="bg-white font-semibold shadow-lg rounded-lg p-4 sticky top-6 md:top-2 h-auto">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="text-lg font-semibold">{isArabic ? 'الفلاتر' : 'Filters'}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Filter Dropdown */}
              <div className="mb-4" ref={categoryDropdownRef}>
                <button
                  className={`w-full flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center px-2 py-2 bg-gray-100 rounded transition-colors duration-500 hover:bg-gray-200 font-medium`}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className={`flex-1 ${isArabic ? "text-right" : "text-left"}`}>{isArabic ? 'التصنيفات' : 'Categories'}</span>
                  <svg className={`w-4 h-4 transition-transform duration-500 ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`bg-white border rounded shadow mt-1 transition-all duration-500 ease-in-out overflow-hidden ${showCategoryDropdown ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 pointer-events-none'
                    }`}
                  style={{ minWidth: '100%' }}
                >
                  <button
                    onClick={() => {
                      resetCategoryFilter();
                      setShowCategoryDropdown(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-2 rounded transition-colors duration-150 font-medium ${!selectedCategory ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'جميع التصنيفات' : 'All Categories'}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-2 rounded transition-colors duration-150 font-medium ${selectedCategory?.id === category.id ? "bg-red-500 text-white" : "hover:bg-gray-50"
                        }`}
                    >
                      {isArabic ? category.nameAr : category.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${isArabic ? "text-right" : "text-left"}`}>{isArabic ? 'نطاق السعر' : 'Price Range'}</h2>
                <div className="w-full rounded-lg bg-white" ref={sliderRef}>
                  <div className="relative py-5">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute h-2 bg-red-500 rounded-full"
                        style={{
                          left: `${(tempMin / 5000) * 100}%`,
                          right: `${100 - (tempMax / 5000) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div
                      className="absolute w-6 h-6 bg-red-500 rounded-full shadow-md border border-red-300 cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 hover:scale-110 transition-transform z-10 ml-3"
                      style={{ left: `${(tempMin / 5000) * 100}%` }}
                      onMouseDown={(e) => {
                        const parent = e.target.parentElement.parentElement;
                        const parentRect = parent.getBoundingClientRect();
                        const handleDrag = (moveEvent) => {
                          const newPosition = ((moveEvent.clientX - parentRect.left) / parentRect.width) * 100;
                          const boundedPosition = Math.min(Math.max(newPosition, 0), (tempMax / 5000 * 100));
                          const newMinValue = Math.round((boundedPosition / 100) * 5000);
                          setTempMin(newMinValue);
                        };
                        const handleRelease = () => {
                          document.removeEventListener("mousemove", handleDrag);
                          document.removeEventListener("mouseup", handleRelease);
                        };
                        document.addEventListener("mousemove", handleDrag);
                        document.addEventListener("mouseup", handleRelease);
                      }}
                      onTouchStart={(e) => handleTouchStart(e, true)}
                    ></div>

                    <div
                      className="absolute w-6 h-6 bg-red-500 rounded-full shadow-md border border-red-300 cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 hover:scale-110 transition-transform z-10 -ml-3"
                      style={{ left: `${(tempMax / 5000) * 100}%` }}
                      onMouseDown={(e) => {
                        const parent = e.target.parentElement.parentElement;
                        const parentRect = parent.getBoundingClientRect();
                        const handleDrag = (moveEvent) => {
                          const newPosition = ((moveEvent.clientX - parentRect.left) / parentRect.width) * 100;
                          const boundedPosition = Math.min(Math.max(newPosition, (tempMin / 5000 * 100)), 100);
                          const newMaxValue = Math.round((boundedPosition / 100) * 5000);
                          setTempMax(newMaxValue);
                        };
                        const handleRelease = () => {
                          document.removeEventListener("mousemove", handleDrag);
                          document.removeEventListener("mouseup", handleRelease);
                        };
                        document.addEventListener("mousemove", handleDrag);
                        document.addEventListener("mouseup", handleRelease);
                      }}
                      onTouchStart={(e) => handleTouchStart(e, false)}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <span className="text-gray-500 font-medium text-[12.5px] text-center">{isArabic ? "الحد الأدنى" : "Min"}</span>
                      <div className="font-medium text-lg">{tempMin} {isArabic ? "جنية" : "EGP"}</div>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500 font-medium text-[12.5px] text-center">{isArabic ? "الحد الأقصى" : "Max"}</span>
                      <div className="font-medium text-lg">{tempMax} {isArabic ? "جنية" : "EGP"}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between space-x-4">
                    <button
                      onClick={resetPriceFilter}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors flex-1 font-['Alexandria'] font-medium text-[10px] sm:text-[11px] whitespace-nowrap"
                    >
                      {isArabic ? "إعادة تعيين" : "Reset"}
                    </button>
                    <button
                      onClick={applyPriceFilter}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex-1 font-['Alexandria'] font-medium text-[10px] sm:text-[11px]"
                    >
                      {isArabic ? "تطبيق" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sort Options - Now part of the main sidebar */}
              <div className="mt-6 hidden md:block" ref={sortDropdownRef}>
                <button
                  className={`w-full flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center px-2 py-2 bg-gray-100 rounded transition-colors duration-500 hover:bg-gray-200 font-medium`}
                  onClick={() => setShowSort(!showSort)}
                >
                  <span className={`flex-1 ${isArabic ? "text-right" : "text-left"}`}>{isArabic ? 'الترتيب' : 'Sort'}</span>
                  <svg className={`w-4 h-4 transition-transform duration-500 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`bg-white border rounded shadow mt-1 transition-all duration-500 ease-in-out overflow-hidden ${showSort ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 pointer-events-none'
                    }`}
                  style={{ minWidth: '100%' }}
                >
                  <button
                    onClick={() => {
                      handleSort("newest");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "newest" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'الأحدث أولاً' : 'Newest first'}
                  </button>
                  <button
                    onClick={() => {
                      handleSort("oldest");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "oldest" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'الأقدم أولاً' : 'Oldest first'}
                  </button>
                  <button
                    onClick={() => {
                      handleSort("price_desc");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "price_desc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'السعر: من الأقل للأعلى' : 'Price: low to high'}
                  </button>
                  <button
                    onClick={() => {
                      handleSort("price_asc");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "price_asc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'السعر: من الأعلى للأقل' : 'Price: high to low'}
                  </button>
                  <button
                    onClick={() => {
                      handleSort("name_asc");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "name_asc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'الاسم: من أ إلى ي' : 'Name: A to Z'}
                  </button>
                  <button
                    onClick={() => {
                      handleSort("name_desc");
                      setShowSort(false);
                    }}
                    className={`block ${isArabic ? 'text-right' : 'text-left'} w-full text-left px-4 py-1.5 rounded transition-colors duration-150 font-medium text-[13px] ${currentSort === "name_desc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                      }`}
                  >
                    {isArabic ? 'الاسم: من ي إلى أ' : 'Name: Z to A'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Sidebar - Mobile Only */}
          <div
            className={`fixed md:hidden top-0 ${isArabic ? 'right-0' : 'left-0'} h-screen w-3/4 bg-white z-[70] transform transition-transform duration-300 ease-in-out ${showSort ? 'translate-x-0' : isArabic ? 'translate-x-full' : '-translate-x-full'
              }`}
          >
            <div className="bg-white font-semibold shadow-lg rounded-lg p-4 sticky top-6 h-auto">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{isArabic ? 'الترتيب' : 'Sort'}</h2>
                <button
                  onClick={() => setShowSort(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleSort("newest");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "newest" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'الأحدث أولاً' : 'Newest first'}
                </button>
                <button
                  onClick={() => {
                    handleSort("oldest");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "oldest" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'الأقدم أولاً' : 'Oldest first'}
                </button>
                <button
                  onClick={() => {
                    handleSort("price_desc");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "price_desc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'السعر: من الأقل للأعلى' : 'Price: low to high'}
                </button>
                <button
                  onClick={() => {
                    handleSort("price_asc");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "price_asc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'السعر: من الأعلى للأقل' : 'Price: high to low'}
                </button>
                <button
                  onClick={() => {
                    handleSort("name_asc");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "name_asc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'الاسم: من أ إلى ي' : 'Name: A to Z'}
                </button>
                <button
                  onClick={() => {
                    handleSort("name_desc");
                    setShowSort(false);
                  }}
                  className={`w-full ${isArabic ? 'text-right' : 'text-left'} px-4 py-3 rounded transition-colors duration-150 ${currentSort === "name_desc" ? "bg-red-500 text-white" : "hover:bg-gray-50"
                    }`}
                >
                  {isArabic ? 'الاسم: من ي إلى أ' : 'Name: Z to A'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:w-[98%] lg:w-full">
            {/* Active Filters */}
            {(priceFilterApplied || selectedCategory) && (
              <div className={`mb-4 flex flex-wrap gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
                {priceFilterApplied && (
                  <div className={`bg-gray-100 px-3 py-1 rounded-full flex items-center ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-sm font-medium">
                      {isArabic ? 'السعر:' : 'Price:'} {minSearch}-{maxSearch} {isArabic ? "جنية" : "EGP"}
                    </span>
                    <button
                      onClick={resetPriceFilter}
                      className={`${isArabic ? 'mr-1' : 'ml-1'} text-gray-500 hover:text-red-500`}
                    >
                      &times;
                    </button>
                  </div>
                )}
                {selectedCategory && (
                  <div className={`bg-gray-100 px-3 py-1 rounded-full flex items-center ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-sm font-medium">
                      {isArabic ? 'التصنيف:' : 'Category:'} {isArabic ? selectedCategory.nameAr : selectedCategory.nameEn}
                    </span>
                    <button
                      onClick={resetCategoryFilter}
                      className={`${isArabic ? 'mr-1' : 'ml-1'} text-gray-500 hover:text-red-500`}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoading && (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-3 md:gap-0"
                dir={isArabic ? "rtl" : "ltr"}
              >
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`${style.slideItem} group w-full`}>
                    <div className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto">
                      <div className="relative overflow-hidden">
                        <Link
                          to={`/Productdetails/${product.skuId}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickViewClick(product);
                          }}
                          className="block"
                        >
                          <img
                            src={product.Images?.[0]?.url || FALLBACK_IMAGE}
                            alt={product.nameAr || "Product"}
                            className="w-full h-40 sm:h-24 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        </Link>
                        {product.availableStock > 0 && product.priceBefore && product.priceAfter && product.priceBefore > product.priceAfter && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                            {Math.round(((product.priceBefore - product.priceAfter) / product.priceBefore) * 100)}% {isArabic ? "خصم" : "Off"}
                          </div>
                        )}
                        {product.availableStock <= 0 && (
                          <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                            {isArabic ? "غير متوفر" : "Out of stock"}
                          </div>
                        )}
                        <div className="absolute top-2 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToWishlist(product.skuId);
                            }}
                            className="p-1.5 bg-gray-100 rounded-full transition-colors"
                            title={isArabic ? "Add to Wishlist" : "أضف للمفضلة"}
                          >
                            <FaHeart className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-red-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickViewClick(product);
                            }}
                            className="p-1.5 bg-gray-100 rounded-full transition-colors"
                            title={isArabic ? "نظره سريعه" : "Quick View"}
                          >
                            <FaEye className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      <div className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden">
                        <h3 className={`alexandria-500 text-[13px] sm:text-[16px] mb-0.5 sm:mb-1 line-clamp-1 ${isArabic ? "text-right" : "text-left"}`}>
                          {isArabic ? product.nameAr : product.nameEn}
                        </h3>
                        <p className={`text-gray-500 font-sans text-[11px] sm:text-[13px] mb-0.5 sm:mb-1 ${isArabic ? "text-right" : "text-left"}`}>
                          {product.company || "Company Name"}
                        </p>
                        <p
                          className={`flex items-center text-gray-600 mb-0.5 sm:mb-1 text-[15px] font-medium ${isArabic ? "justify-start text-right" : "justify-start text-left"}`}
                          dir={isArabic ? "rtl" : "ltr"}
                        >
                          <span className={`text-gray-500 text-[15px] ${isArabic ? "mr-1" : "ml-1"}`}>
                            {isArabic ? `${product.priceAfter} جنية` : `${product.priceAfter} EGP`}
                          </span>
                          {product.priceBefore && product.priceBefore > product.priceAfter && (
                            <span className={`text-red-400 line-through text-[11px] ${isArabic ? "mr-1" : "ml-1"}`}>
                              {isArabic ? `${product.priceBefore} جنية` : `${product.priceBefore} EGP`}
                            </span>
                          )}
                        </p>
                        <p className={`text-gray-500 font-medium sm:mb-1 text-[10px] sm:text-[10px] line-clamp-2 mb-8 ${isArabic ? "text-right" : "text-left"}`}>
                          {isArabic ? product.cardDescriptionAr : product.cardDescriptionEn}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (product.availableStock > 0) {
                              addToCart(product.skuId);
                            } else {
                              toast.error(isArabic ? "المنتج غير متوفر" : "Product Out of Stock", {
                                style: {
                                  fontFamily: "'Alexandria', sans-serif",
                                  fontWeight: 300,
                                  fontSize: "14px"
                                }
                              });
                            }
                          }}
                          disabled={product.availableStock <= 0}
                          className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row gap-2 items-center justify-center ${product.availableStock <= 0 ? "bg-gray-400 cursor-not-allowed" : ""}`}
                        >
                          {product.availableStock > 0 ? (
                            <>
                              <img src={cart} alt="Cart" className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-[1px] mb-[3px]" />
                              {isArabic ? "أضف إلى السلة" : "Add to cart"}
                            </>
                          ) : (
                            <span className="block mb-1 ">{isArabic ? "غير متوفر" : "Out of Stock"}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="text-center w-full py-10">
                <p className="text-gray-500">{isArabic ? "جاري تحميل المنتجات..." : "Loading products..."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        {isQuickViewOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[95] p-2 sm:p-4">
            <div
              className="bg-white rounded-lg relative w-full max-w-xs sm:max-w-md md:max-w-lg p-3 sm:p-6"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: "'Alexandria', sans-serif" }}
            >
              <button
                className="absolute top-1 right-1 sm:top-2 sm:right-2 text-gray-600 hover:text-gray-800 z-10 w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm"
                onClick={handleCloseQuickView}
              >
                <FaTimes className="w-6 h-6 sm:w-4 sm:h-4" />
              </button>

              {/* Show discount badge in Quick View only if product is available and has discount */}
              {selectedProduct.availableStock > 0 &&
                selectedProduct.priceBefore &&
                selectedProduct.priceAfter &&
                selectedProduct.priceBefore > selectedProduct.priceAfter && (
                  <>
                    <div className="absolute m-4 text-center top-0 left-0 bg-red-500 text-white text-[16px] font-normal px-1 py-0 rounded-md z-10 font-alexandria font-medium" style={{ fontFamily: "Alexandria", fontWeight: 300 }}>
                      {Math.round(
                        ((selectedProduct.priceBefore - selectedProduct.priceAfter) /
                          selectedProduct.priceBefore) *
                        100
                      )}
                      % {isArabic ? "خصم" : "Off"}
                    </div>
                    <button
                      className="absolute top-12 left-4 text-gray-600 hover:text-red-500 bg-gray-100 w-7 h-7 rounded-full flex items-center justify-center z-10 p-1.5"
                      onClick={() => addToWishlist(selectedProduct.skuId)}
                    >
                      <FaHeart className="h-4 w-4" />
                    </button>
                  </>
                )}

              {/* Show out of stock badge in Quick View if product is not available */}
              {selectedProduct.availableStock <= 0 && (
                <div style={{ fontFamily: "Alexandria", fontWeight: 500 }}
                  className="absolute top-0 left-0 bg-gray-600 text-white text-[16px] font-bold px-2 py-0 rounded-md z-10 Alexandria-500 m-4" >
                  {isArabic ? "غير متوفر" : "Out of Stock"}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 overflow-y-hidden">
                <div className="w-full sm:w-1/2 flex justify-center relative overflow-y-hidden">
                  <img
                    src={selectedProduct.Images?.[0]?.url || FALLBACK_IMAGE}
                    alt={selectedProduct.nameAr}
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                  />
                </div>
                <div className="w-full sm:w-1/2 text-right">
                  <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 mt-2 ${isArabic ? "text-right" : "text-left"}`}>
                    {isArabic ? selectedProduct.nameAr : selectedProduct.nameEn}
                  </h3>

                  <p className={`flex text-gray-600 mb-0.5 sm:mb-1 text-[15px] sm:text-[14px] font-medium ${!isArabic ? "text-right flex-row" : "text-left flex-row-reverse"}`}>
                    <span className={`flex flex-row-reverse text-gray-500 mr-1 sm:mr-1 ml-1 ${isArabic ? "text-right" : "text-left"}`}>
                      {selectedProduct.priceAfter} <span className="mr-1 sm:mr-1">{isArabic ? " جنية " : ""}</span> {isArabic ? " " : "EGP"}
                    </span>
                    {selectedProduct.priceBefore && selectedProduct.priceBefore > selectedProduct.priceAfter && (
                      <span className={`flex mr-1 sm:mr-1 ml-1 sm:ml-1 text-[9px] sm:text-[11px] text-red-400 line-through ${!isArabic ? "text-right" : "text-left"}`}>
                        <span className="mr-1 text-red-500 text-[9px] sm:text-[10px]">{isArabic ? " جنية " : ""}</span>
                        {isArabic ? "" : "EGP"} {selectedProduct.priceBefore}
                      </span>
                    )}
                  </p>
                  <p className={`text-xs sm:text-sm text-gray-500 mb-4 line-clamp-3 ${isArabic ? "text-right" : "text-left"}`}>
                    {isArabic ? selectedProduct.cardDescriptionAr : selectedProduct.cardDescriptionEn}
                  </p>

                  {/* Tags in Quick View */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className={`mb-4 flex flex-wrap gap-1 ${isArabic ? "justify-end" : "justify-start"}`}>
                      {selectedProduct.tags.map(tagObj => (
                        <span
                          key={tagObj.tag.id}
                          className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded"
                        >
                          {isArabic ? tagObj.tag.nameAr : tagObj.tag.nameEn}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={`flex flex-col sm:flex-row items-center gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
                    <button
                      className={`px-3 py-1 rounded-md text-[14px] font-light w-full sm:w-auto ${selectedProduct.availableStock <= 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      onClick={() => {
                        if (selectedProduct.availableStock > 0) {
                          addToCart(selectedProduct.skuId);
                        } else {
                          toast.error(isArabic ? "المنتج غير متوفر" : "Product is out of stock", {
                            style: {
                              fontFamily: "'Alexandria', sans-serif",
                              fontWeight: 300,
                              fontSize: "14px"
                            }
                          });
                        }
                      }}
                      disabled={selectedProduct.availableStock <= 0}
                    >
                      {selectedProduct.availableStock <= 0
                        ? (isArabic ? "غير متوفر" : "Out of stock")
                        : (isArabic ? "أضف إلى السلة" : "Add to Cart")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}