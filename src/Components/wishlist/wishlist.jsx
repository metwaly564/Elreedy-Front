import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { Trash, HeartFill } from 'react-bootstrap-icons';
import toast, { Toaster } from 'react-hot-toast';
import { CartContext } from '../../Context/CartContexrt';
import { UserContext } from '../../Context/UserContext';
import { FaHeart, FaEye } from 'react-icons/fa';
import cart from '../../assets/cart.png';
import style from './wishlist.module.css';

const FALLBACK_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, fetchWishlistCount } = useContext(CartContext);
  const { isArabic } = useContext(UserContext);

  const fetchWishlistWithImages = async () => {
    try {
      setIsLoading(true);
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        setError("Please login to view your wishlist");
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          "Access-Token": userToken,
        },
      };

      const [wishlistResponse, allProductsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:3000/api/v1/wishlists/wishlist", config),
        axios.get("http://127.0.0.1:3000/api/v1/products/product")
      ]);

      const productsMap = allProductsResponse.data.reduce((map, product) => {
        map[product.skuId] = product;
        return map;
      }, {});

      const enrichedWishlistItems = wishlistResponse.data.map(item => {
        const productWithImages = productsMap[item.skuId];
        return {
          ...item,
          Images: productWithImages?.Images || []
        };
      });

      setWishlistItems(enrichedWishlistItems);
      setError(null);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.response?.data?.message || "Failed to load wishlist");
      toast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromWishlist = async (skuId) => {
    try {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        toast.error("Please login to manage your wishlist");
        return;
      }

      const config = {
        headers: {
          "Access-Token": userToken,
          "Content-Type": "application/json",
        },
      };

      const requestBody = {
        productId: skuId.toString()
      };

      await axios.delete(
        "http://127.0.0.1:3000/api/v1/wishlists/wishlist",
        { data: requestBody, ...config }
      );

      toast.success("Removed from wishlist successfully!");
      fetchWishlistWithImages();
      fetchWishlistCount();
    } catch (err) {
      console.error("Error deleting from wishlist:", err);
      toast.error(err.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  useEffect(() => {
    fetchWishlistWithImages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-[18vh] p-6 bg-white rounded-lg shadow-md text-center" style={{ fontFamily: "'Alexandria', sans-serif" }}>
        <h2 className="text-2xl font-bold text-red-600 mb-4">{isArabic ? "يرجى تسجيل الدخول" : "Please Login First"}</h2>
        <p className="text-gray-700 mb-4 font-medium">{isArabic ? "يجب عليك تسجيل الدخول للوصول إلى قائمة الرغبات" : "You need to login to access your wishlist"}</p>
        <Link to="/login" className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium">
          {isArabic ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center w-full py-10" style={{ fontFamily: "'Alexandria', sans-serif" }}>
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {isArabic ? "قائمة الرغبات فارغة" : "Your wishlist is empty"}
        </h2>
        <p className="text-gray-700 mb-4 font-medium">
          {isArabic ? "لم تقم بإضافة أي منتجات إلى قائمة الرغبات بعد" : "You haven't added any items to your wishlist yet"}
        </p>
        <Link
          to="/"
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition font-medium"
        >
          {isArabic ? "تصفح المنتجات" : "Browse Products"}
        </Link>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="py-1 px-2 max-w-7xl mx-auto mt-[18vh] bg-gray-100 min-h-screen">
        <div className="flex flex-col items-center justify-center mb-4">
          <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-black">
            {isArabic ? "قائمة الرغبات" : "My Wishlist"}
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-1 gap-y-3 sm:gap-x-1 sm:gap-y-3 md:gap-0 pb-28">
          {wishlistItems.map((product) => (
            <div
              key={product.skuId}
              className={`${style.slideItem} group w-full`}
            >
              <div className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto">
                <div className="relative overflow-hidden">
                  {product.availableStock > 0 &&
                    product.priceBefore &&
                    product.priceAfter &&
                    product.priceBefore > product.priceAfter && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                        {Math.round(
                          ((product.priceBefore - product.priceAfter) /
                            product.priceBefore) *
                          100
                        )}
                        % {isArabic ? "خصم" : "Off"}
                      </div>
                    )}

                  {product.availableStock <= 0 && (
                    <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                      {isArabic ? "غير متوفر" : "Out of stock"}
                    </div>
                  )}

                  <Link
                    to={`/Productdetails/${product.skuId}`}
                    className="block"
                  >
                    <img
                      src={product.Images?.[0]?.url || FALLBACK_IMAGE}
                      className="w-full h-40 sm:h-24 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                      alt={product.nameAr || product.nameEn || 'Product image'}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                    />
                  </Link>
                  <div className="absolute top-2 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      onClick={() => deleteFromWishlist(product.skuId)}
                      className="p-1.5 bg-gray-100 rounded-full transition-colors"
                      title={isArabic ? "Remove from Wishlist" : "Remove from Wishlist"}
                    >
                      <Trash className="h-[13px] w-[13px] sm:h-4 sm:w-4 text-red-500" />
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
                    className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row gap-2 items-center justify-center ${
                      product.availableStock <= 0 ? "bg-gray-400 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if(product.availableStock > 0) {
                        addToCart(product);
                      }
                    }}
                    disabled={product.availableStock <= 0}
                  >
                    {product.availableStock > 0 ? (
                      <>
                        <img src={cart} alt="Cart" className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-[1px] mb-[3px]" />
                        {isArabic ? "أضف إلى السلة" : "Add to cart"}
                      </>
                    ) : (
                      <span className="block mb-1 mt-[0.1em]">{isArabic ? "غير متوفر" : "Out of Stock"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}