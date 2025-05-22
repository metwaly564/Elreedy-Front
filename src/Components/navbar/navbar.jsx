import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { CartContext } from "../../Context/CartContexrt";
import logo from "../../assets/Alreedy.png";
import axios from "axios";
import {
  FiHome,
  FiGift,
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiInfo,
  FiPhone,
  FiLogIn,
  FiLogOut,
  FiSearch,
  FiShoppingCart,
  FiMenu,
  FiChevronDown
} from "react-icons/fi";

export default function Navbar() {
  const {
    cartCount,
    setCartCount,
    wishlistCount,
    setWishlistCount,
    fetchCartCount,
    fetchWishlistCount,
  } = useContext(CartContext);
  const location = useLocation();
  const hiddenFooterRoutes = [
    "/login",
    "/signup",
    "/register",
    "/ForgetPassword",
    "/PasswordReset",
    "/StaffLogin",
    "/AdminEditProducts",
    "/AdminDashboard",
    "/AdminAddProducts",
    "/AdminEditUsers",
    "/AdminEditCities",
    "/AdminEditTags",
    "/ProductsAnalysis",
    "/PromoCodesAnalysis",
    "/UsersAnalysis",
    "/AdminEditDeliveryBoys",
    "/AdminEditPromoCode",
    "/AdminEditCateg",
    "/OperationTeamDashboard",
    "/AdminEditStaff",
    "/AdminSalesDashboard",
    "/EditProduct",
    "/AdminAddNewPr",
    "/staffLogin",
    "/stafflogin",
  ];

  let {
    SearchResult,
    setSearchResult,
    isArabic,
    setisArabic,
    setsearchkey,
    userlogin,
    setuserlogin,
    triggerRefresh,
  } = useContext(UserContext);
  let { numItems } = useContext(CartContext);
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  let navigate = useNavigate();

  // Hide Navbar on specific routes
  const shouldHideNavbar = hiddenFooterRoutes.includes(location.pathname);

  // Control body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isMenuOpen]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(".shop-dropdown") === null && 
          event.target.closest(".shop-link") === null) {
        setShowShopDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Fetch cart and wishlist counts when component mounts
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      fetchCartCount();
      fetchWishlistCount();
    } else {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(cartItems.length);
    }
  }, [fetchCartCount, fetchWishlistCount, setCartCount]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/api/v1/categories"
        );
        const filteredCategories = response.data
          .filter((category) => category.isInNavbar && !category.ishidden)
          .sort((a, b) => a.rank - b.rank);
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Check login status and fetch counts
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    setIsLoggedIn(!!token);

    const loadCartCount = async () => {
      if (token) {
        await fetchCartCount();
        await fetchWishlistCount();
      } else {
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCartCount(cartItems.length);
      }
    };

    loadCartCount();
  }, [
    userlogin,
    location.pathname,
    fetchCartCount,
    fetchWishlistCount,
    setCartCount,
  ]);

  // Set Arabic as default language if not already set
  useEffect(() => {
    if (isArabic === undefined) {
      setisArabic(false);
    }
  }, [isArabic, setisArabic]);

  // Auth action handler
  function handleAuthAction() {
    if (isLoggedIn) {
      localStorage.removeItem("userToken");
      setuserlogin(null);
      triggerRefresh();
      navigate("/");
    } else {
      navigate("/login");
    }
  }

  // Search handler
  async function handleKeyPress(event) {
    if (event.key === "Enter") {
      setsearchkey(inputValue);
      const response = await axios.get(
        `http://127.0.0.1:3000/api/v1/products?search=${inputValue}`
      );
      setSearchResult(response.data.products);
      navigate("/search");
    }
  }

  // Input change handler
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Toggle handlers
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLanguageDropdown = () =>
    setShowLanguageDropdown(!showLanguageDropdown);

  // Language toggle handler
  const toggleLanguage = () => {
    setisArabic(!isArabic);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest(".language-selector") === null) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <div className="w-full bg-white font-sans fixed top-0 z-50 shadow-sm" style={{ fontFamily: "Alexandria, sans-serif" }}>
      {/* Mobile layout (md and below) - remains exactly as before */}
      <div className="lg:hidden">
        {/* Top navigation bar - slim version */}
        <div className="border-gray-100 fixed top-0 left-0 right-0 z-50 mb-8">
          <div className="mx-auto px-4 py-1 flex justify-between items-center">
            {/* Left side - hidden on small screens */}
            <div className="hidden md:flex items-center space-x-4">
            
            </div>

            {/* Middle - hidden on small screens */}
  

            {/* Right side - always visible */}
            <div className="flex items-center justify-end w-full md:w-auto">
              <div className="relative language-selector">
                <button
                  onClick={toggleLanguageDropdown}
                  className="flex items-center space-x-1 px-2 py-0.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  <span className="font-alexandria font-[500]">{isArabic ? "العربية" : "English"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform duration-200 ${
                      showLanguageDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showLanguageDropdown && (
                  <div
                    className={`fixed top-6 ${
                      isArabic ? "right-4" : "right-4"
                    } bg-white shadow-2xl rounded-md py-1 w-24 border-2 border-gray-200 font-alexandria font-medium`}
                  >
                    <button
                      onClick={() => {
                        setisArabic(false);
                        setShowLanguageDropdown(false);
                      }}
                      className={`block w-full ${
                        isArabic ? "text-right" : "text-left"
                      } px-3 py-2 text-xs hover:bg-gray-50 ${
                        !isArabic
                          ? "text-primary-500 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setisArabic(true);
                        setShowLanguageDropdown(false);
                      }}
                      className={`block w-full ${
                        isArabic ? "text-right" : "text-left"
                      } px-3 py-2 text-xs hover:bg-gray-50 font-alexandria font-light font-[600] ${
                        isArabic
                          ? "text-primary-500 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* First row - burger, logo, account icons */}
        <div className="flex items-center justify-between mb-2 relative px-4 py-2 mt-8">
          {isArabic ? (
            <>
              {/* Sign in button - left in Arabic */}
              <div className="w-20 flex justify-start">
                {!isLoggedIn && (
                  <button
                    onClick={handleAuthAction}
                    className={`bg-red-500 hover:bg-red-600 text-white flex items-center justify-center w-full text-center ${isArabic ? "text-[10px]" : "text-[13px]"} px-[15px] py-1 rounded-md whitespace-nowrap shadow-sm font-alexandria font-medium`}
                  >
                    {isArabic ? "تسجيل دخول" : "Sign In"}
                  </button>
                )}
              </div>
              {/* Logo - always centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link to="/">
                  <img src={logo} alt="Alreedy" className="h-8" />
                </Link>
              </div>
              {/* Burger menu - right in Arabic */}
              <div className="w-20 flex justify-end items-center space-x-3 rtl:space-x-reverse">
                <button onClick={toggleMenu} className="p-1 focus:outline-none">
                  <FiMenu className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Burger menu - left in English */}
              <div className="w-20 flex justify-start items-center space-x-3 rtl:space-x-reverse">
                <button onClick={toggleMenu} className="p-1 focus:outline-none">
                  <FiMenu className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              {/* Logo - always centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link to="/">
                  <img src={logo} alt="Alreedy" className="h-8" />
                </Link>
              </div>
              {/* Sign in button - right in English */}
              <div className="w-20 flex justify-end">
                {!isLoggedIn && (
                  <button
                    onClick={handleAuthAction}
                    className={`bg-red-500 hover:bg-red-600 text-white text-center text-[13px] px-[15px] py-1 rounded-md whitespace-nowrap shadow-sm font-alexandria font-medium`}
                  >
                    {isArabic ? "تسجيل دخول" : "Sign In"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Second row - search bar (full width) */}
        <div className="w-full px-4 pb-[5px]">
          <div className="relative w-[80%] mx-auto">
            <input
              type="text"
              placeholder={isArabic ? "ابحث عن المنتجات..." : "Search products..."}
              className={`pl-10 pr-3 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full font-alexandria font-light placeholder:font-alexandria placeholder:font-light ${isArabic ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'}`}
              dir={isArabic ? "rtl" : "ltr"}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <FiSearch className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Desktop layout (lg and above) - with requested modifications */}
      <div className="hidden lg:block border-b border-gray-300 py-3 px-4">
        {isArabic ? (
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left side - Icons */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Cart with counter */}
              <div className="relative">
                <NavLink to="/cart" className="transition-transform block">
                  <FiShoppingCart className={`text-red-700 text-lg ${isLoggedIn ? 'mt-2' : ''}`} />
                  {cartCount > 0 && isLoggedIn && (
                  <span className="relative -top-[24px] ml-[8px] mb-[-10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold z-[7] opacity-90">{cartCount}</span>
                  )}
                </NavLink>
              </div>

              {/* Wishlist with counter */}
              <div className="relative">
                <NavLink to="/wishlist" className="transition-transform block">
                  <FiHeart className={`text-red-700 text-lg ${isLoggedIn ? 'mt-2' : ''}`} />
                  {wishlistCount > 0 && isLoggedIn && (
                  <span className="relative -top-[24px] ml-[8px] mb-[-10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold z-[7] opacity-90">{wishlistCount}</span>
                  )}
                </NavLink>
                </div>
              {/* Wishlist with counter */}
              <div className="relative">
                <NavLink to="/Account" className="transition-transform block">
                  <FiUser className={`text-red-700 text-lg `} />
                </NavLink>
                </div>

              {/* Login/Logout button */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse font-alexandria font-light">
                <Link
                  to={isLoggedIn ? "#" : "/login"}
                  onClick={() => {
                    if (isLoggedIn) {
                      handleAuthAction();
                      toggleMenu();
                    } else {
                      toggleMenu();
                    }
                  }}
                  className={`flex items-center text-red-700 ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                >
                  {isLoggedIn ? (
                    <>
                      <FiLogOut className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل خروج" : "Log out"}
                    </>
                  ) : (
                    <>
                      <FiLogIn className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل دخول" : "Log in"}
                    </>
                  )}
                </Link>
              </div>

              {/* Language toggle */}
              <button 
                onClick={toggleLanguage}
                className="text-red-700 font-bold hover:underline transition-all"
              >
                {isArabic ? 'English' : 'العربية'}
              </button>
            </div>

            {/* Search box - Center */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ما الذي تبحث عنه؟     "
                  className="w-full text-right font-alexandria font-light bg-gray-200 border-none rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 rtl:text-right placeholder:font-alexandria placeholder:font-light placeholder:text-right"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Right side - Links */}
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <NavLink 
                to="/offers" 
                className="uppercase font-medium hover:text-primary-600 transition-colors"
                activeClassName="text-primary-600"
              >
                عروض
              </NavLink>
              
              <div className="relative group">
              <div className="relative group shop-dropdown">
  <div 
    className="flex items-center uppercase font-medium hover:text-primary-600 transition-colors cursor-pointer shop-link"
    onClick={() => setShowShopDropdown(!showShopDropdown)}
  >
    <FiChevronDown className="mr-1 text-xs" />
   <span> 
      تسوق 
    </span>
  </div>
  
  {showShopDropdown && (
    <div className={`absolute ${isArabic ? 'right-0' : 'left-0'} mt-2 w-48 bg-white rounded-md shadow-lg z-50`} >
      <div className="py-1 fixed bg-inherit right-[22vw] border-1 border-black shadow-2xl rounded-md font-semibold text-right">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/CategoryDetails/${category.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowShopDropdown(false)}
          >
            {isArabic ? category.nameAr : category.nameEn}
          </Link>
        ))}
      </div>
    </div>
  )}
</div>
              </div>
              
              <NavLink 
                to="/" 
                className="uppercase font-medium hover:text-primary-600 transition-colors"
                activeClassName="text-primary-600"
              >
                رئيسية
              </NavLink>
              
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/">
                <img src={logo} alt="Alreedy" className="h-10 w-auto" />
                
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left side - Logo and Links */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/">
                <img src={logo} alt="Alreedy" className="h-10 w-auto" />
                </Link>
              </div>

              <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <NavLink 
                  to="/offers" 
                  className="uppercase font-medium hover:text-primary-600 transition-colors"
                  activeClassName="text-primary-600"
                >
                  Offers
                </NavLink>
                
                <div className="relative group">
                <div className="relative group shop-dropdown">
  <div 
    className="flex items-center uppercase font-medium hover:text-primary-600 transition-colors cursor-pointer shop-link"
    onClick={() => setShowShopDropdown(!showShopDropdown)}
  >
    Shop
    <FiChevronDown className="ml-1 text-xs" />
  </div>
  
  {showShopDropdown && (
    <div className={`absolute ${isArabic ? 'right-0' : 'left-0'} mt-2 w-48 bg-white rounded-md shadow-lg z-50 transition-all duration-1000`}>
      <div className="py-1 fixed bg-inherit left-[22vw] border-1 border-black shadow-2xl rounded-md font-semibold text-left transition-all duration-700 ">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/CategoryDetails/${category.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowShopDropdown(false)}
          >
            {isArabic ? category.nameAr : category.nameEn}
          </Link>
        ))}
      </div>
    </div>
  )}
</div>
                </div>
                
                <NavLink 
                  to="/" 
                  className="uppercase font-medium hover:text-primary-600 transition-colors"
                  activeClassName="text-primary-600"
                >
                  Home
                </NavLink>
              </div>
            </div>

            {/* Search box - Center */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full bg-gray-200 border-none rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-alexandria font-light placeholder:font-alexandria placeholder:font-light text-left placeholder:text-left"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse font-alexandria font-light">
              {/* Language toggle */}
              <button 
                onClick={toggleLanguage}
                className="text-red-700 font-bold hover:underline transition-all font-alexandria font-light font-[600]"
              >
                {isArabic ? 'English' : 'العربية'}
              </button>
              {/* Login/Logout button */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link
                  to={isLoggedIn ? "/" : "/login"}
                  onClick={() => {
                    if (isLoggedIn) {
                      handleAuthAction();
                      toggleMenu && toggleMenu();
                    } else {
                      toggleMenu && toggleMenu();
                    }
                  }}
                  className={`flex items-center text-red-700 ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                >
                  {isLoggedIn ? (
                    <>
                      <FiLogOut className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل خروج" : "Log out"}
                    </>
                  ) : (
                    <>
                      <FiLogIn className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل دخول" : "Log in"}
                    </>
                  )}
                </Link>
              </div>
              {/* Wishlist icon */}
              <div className="relative">
                <NavLink to="/wishlist" className="hover:scale-110 transition-transform block">
                  <FiHeart className={`text-red-700 text-lg ${isLoggedIn ? 'mt-2' : ''}`} />
                  {wishlistCount > 0 && isLoggedIn && (
                    <span className="relative -top-[24px] ml-[8px] mb-[-10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold z-[7] opacity-90">{wishlistCount}</span>
                  )}
                </NavLink>
              </div>
              {/* Cart icon */}
              <div className="relative">
                <NavLink to="/cart" className="transition-transform block">
                  <FiShoppingCart className={`text-red-700 text-lg ${isLoggedIn ? 'mt-2' : ''}`} />
                  {cartCount > 0 && isLoggedIn && (
                    <span className="relative -top-[24px] ml-[8px] mb-[-10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold z-[7] opacity-90">{cartCount}</span>
                  )}
                </NavLink>
              </div>
              {/* Account icon */}
              <div className="relative">
                <NavLink to="/Account" className="transition-transform block">
                  <FiUser className={`text-red-700 text-lg`} />
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Mobile menu content */}
      <div
        className={`lg:hidden fixed inset-y-0 ${
          isArabic ? "right-0" : "left-0"
        } bg-white w-4/5 max-w-sm transform transition-transform duration-300 ease-in-out ${
          isMenuOpen
            ? "translate-x-0"
            : isArabic
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
        style={{ zIndex: 900 }}
      >
        <div className="h-full flex flex-col">
          {/* Tab navigation with close button */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <div className="w-12 bg-gray-500 flex items-center justify-center">
              <button
                onClick={toggleMenu}
                className="text-white hover:text-gray-200 p-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "categories"
                  ? "text-gray-800 border-b-2 border-red-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              {isArabic ? "الفئات" : "CATEGORIES"}
            </button>

            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "menu"
                  ? "text-gray-800 border-b-2 border-red-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("menu")}
            >
              {isArabic ? "القائمة" : "MENU"}
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories tab content */}
            <div
              className={
                activeTab === "categories" ? "block px-4 py-4" : "hidden"
              }
            >
              {isLoadingCategories ? (
                <div
                  className={`block ${
                    !isArabic ? "text-left" : "text-right"
                  } text-gray-500`}
                >
                  {isArabic
                    ? "Loading categories..."
                    : "جاري تحميل الفئات..."}
                </div>
              ) : (
                <div className="space-y-6 font-semibold text-sm">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/CategoryDetails/${category.id}`}
                      className={`block ${
                        !isArabic ? "text-left" : "text-right"
                      } text-gray-800 hover:text-primary-500 transition duration-300`}
                      onClick={toggleMenu}
                    >
                      {isArabic ? category.nameAr : category.nameEn}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Menu tab content */}
            <div className={activeTab === "menu" ? "block px-4 py-4" : "hidden"}>
              <div className="space-y-6 font-semibold text-sm">
                {/* الرئيسية */}
                <Link
                  to="/"
                  className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                  onClick={toggleMenu}
                >
                  <FiHome className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                  {isArabic ? "رئيسية" : "Home"}
                </Link>

                {/* عروض خاصة */}
                <Link
                  to="/offers"
                  className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                  onClick={toggleMenu}
                >
                  <FiGift className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                  {isArabic ? "عروض خاصة" : "Special Offers"}
                </Link>

                {/* حسابي (يظهر فقط إذا كان المستخدم مسجل دخول) */}
                {isLoggedIn && (
                  <>
                    <Link
                      to="/account"
                      className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                      onClick={toggleMenu}
                    >
                      <FiUser className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "حسابي" : "My Account"}
                    </Link>

                    {/* طلباتي */}
                    <Link
                      to="/orders"
                      className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                      onClick={toggleMenu}
                    >
                      <FiShoppingBag className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "طلباتي" : "My Orders"}
                    </Link>

                    {/* المفضلة */}
                    <Link
                      to="/wishlist"
                      className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                      onClick={toggleMenu}
                    >
                      <FiHeart className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "المفضلة" : "Wishlist"}
                    </Link>
                  </>
                )}

                {/* من نحن */}
                <Link
                  to="/about"
                  className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                  onClick={toggleMenu}
                >
                  <FiInfo className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                  {isArabic ? "من نحن" : "About us"}
                </Link>

                {/* تواصل بنا */}
                <Link
                  to="/contact"
                  className={`flex items-center ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                  onClick={toggleMenu}
                >
                  <FiPhone className={`${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                  {isArabic ? "تواصل بنا" : "Contact us"}
                </Link>

                {/* تسجيل دخول/خروج */}
                <Link
                  to={isLoggedIn ? "/" : "/login"}
                  onClick={() => {
                    if (isLoggedIn) {
                      handleAuthAction();
                      toggleMenu && toggleMenu();
                    } else {
                      toggleMenu && toggleMenu();
                    }
                  }}
                  className={`flex items-center text-red-700 ${isArabic ? "flex-row-reverse justify-start" : "justify-start"} text-gray-800 hover:text-primary-500 transition duration-300`}
                >
                  {isLoggedIn ? (
                    <>
                      <FiLogOut className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل خروج" : "Log out"}
                    </>
                  ) : (
                    <>
                      <FiLogIn className={`text-red-700 ${isArabic ? "ml-2" : "mr-2"} text-lg`} />
                      {isArabic ? "تسجيل دخول" : "Log in"}
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}