/* eslint-disable no-unused-vars */
import style from "./RecentProducts.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../Context/CartContexrt";
import toast, { Toaster } from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { UserContext } from "../../Context/UserContext";
import cart from "../../assets/cart.png";
import { FaHeart, FaEye, FaTimes } from 'react-icons/fa';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

// Fallback image for products without images
const FALLBACK_IMAGE = "";

export default function RecentProducts() {
  const { cartCount, setCartCount, wishlistCount, setWishlistCount, fetchCartCount, fetchWishlistCount } = useContext(CartContext);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 8,
    slidesToScroll: 1,
    draggable: true,
    swipeToSlide: false,
    touchThreshold: 10,
    autoplay: false,
    arrows: true,
    centerPadding: "0px",
    rtl: true,
    responsive: [
      {
        breakpoint: 1576,
        settings: {
          slidesToShow: 7,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          swipeToSlide: false,
          touchThreshold: 10,
          arrows: false,
        },
      },
    ],
  };

  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [middleBanners, setMiddleBanners] = useState([]);
  const { CartProductsIds, setCartProductsIds, numItems, setnumItems } =
    useContext(CartContext);
  const { isArabic } = useContext(UserContext);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize cart in localStorage
  useEffect(() => {
    const storedArrayString = localStorage.getItem("cartItems");
    if (!storedArrayString) {
      localStorage.setItem("cartItems", JSON.stringify([]));
    } else {
      const items = JSON.parse(storedArrayString);
      setCartProductsIds(items);
      setnumItems(items.length);
    }
  }, [setCartProductsIds, setnumItems]);

  // Fetch categories and their products
  async function getData() {
    try {
      setIsLoading(true);

      // First fetch categories and banners
      const [categoriesRes, bannersRes] = await Promise.all([
        axios.get("http://127.0.0.1:3000/api/v1/categories/main-category"),
        axios.get("http://127.0.0.1:3000/api/v1/banners/banner"),
      ]);

      // For each category, fetch its products
      const categoriesWithProducts = await Promise.all(
        categoriesRes.data.navBarCategories.map(async (category) => {
          try {
            const productsRes = await axios.get(
              `http://127.0.0.1:3000/api/v1/products?categoryId=${category.id}`
            );
            return {
              ...category,
              products: productsRes.data.products || [],
            };
          } catch (error) {
            console.error(
              `Error fetching products for category ${category.id}:`,
              error
            );
            return {
              ...category,
              products: [],
            };
          }
        })
      );

      // Sort fixed banners by rank
      const allBanners = bannersRes.data;
      const fixedBanners = allBanners
        .filter(banner => banner.type === "fixed")
        .sort((a, b) => {
          // Sort by rank in ascending order (1,2,3)
          const rankA = typeof a.rank === 'number' ? a.rank : 999;
          const rankB = typeof b.rank === 'number' ? b.rank : 999;
          return rankA - rankB;
        });

      // Get and sort middle banners by rank
      const middleBanners = allBanners
        .filter(banner => banner.type === "middle")
        .sort((a, b) => {
          // Handle numeric ranks properly
          const rankA = typeof a.rank === 'number' ? a.rank : 999;
          const rankB = typeof b.rank === 'number' ? b.rank : 999;
          return rankA - rankB;
        });

      console.log('Sorted fixed banners:', fixedBanners.map(b => ({ id: b.id, rank: b.rank })));
      console.log('Sorted middle banners:', middleBanners.map(b => ({ id: b.id, rank: b.rank })));

      // Set fixed banners as before
      setCategories(categoriesWithProducts);
      setBanners(fixedBanners);
      setMiddleBanners(middleBanners);

      // Store middle banners separately if needed
      if (isMobile) {
        // Get the first 3 banners by rank order
        const mobileMiddleBanners = middleBanners
          .sort((a, b) => (a.rank || 0) - (b.rank || 0))
          .slice(0, 3);
        // You can use these banners where needed in your component
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(isArabic ? "فشل تحميل البيانات" : "Failed to load data", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => { }, [fetchCartCount, fetchWishlistCount, setCartCount, setWishlistCount]);

  // Track product view
  const handleProductClick = async (skuId, navigateTo) => {
    try {
      await axios.get(`http://127.0.0.1:3000/api/v1/products/product-addview/${skuId}`);
    } catch (error) {
      // Optionally handle error
      console.error("Error tracking product view:", error);
    }
    // Navigate to the product page
    window.location.href = navigateTo;
  };

  // Add to wishlist function
  async function addToWishlist(skuId) {
    try {
      const userToken = localStorage.getItem("userToken");

      if (!userToken) {
        toast.error(isArabic ? "الرجاء تسجيل الدخول لإضافة إلى المفضلة" : "Please login to add to wishlist", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        return;
      }

      const config = {
        headers: {
          "Access-Token": userToken,
          "Content-Type": "application/json",
        },
      };

      const requestBody = {
        productId: skuId.toString(),
      };

      await axios.post(
        "http://127.0.0.1:3000/api/v1/wishlists/wishlist",
        requestBody,
        config
      );

      toast.success(isArabic ? "تمت الإضافة إلى المفضلة بنجاح!" : "Added to wishlist successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      fetchWishlistCount(); // Fetch updated wishlist count
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.success(isArabic ? "موجود بالفعل في المفضلة" : "Already in Your Wishlist", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      fetchWishlistCount();
    }
  }

  // Add to Cart function
  async function addToCart(skuId, quantity = 1) {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      const config = {
        headers: {
          "Access-Token": userToken,
          "Content-Type": "application/json",
        },
      };

      const requestBody = {
        productId: [{ [skuId]: quantity }]
      };

      axios.post(
        "http://127.0.0.1:3000/api/v1/carts/cart",
        requestBody,
        config
      )
        .then(response => {
          toast.success(isArabic ? "تمت الإضافة إلى السلة!" : "Added to cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
          if (fetchCartCount) {
            fetchCartCount();
          }
        })
        .catch(error => {
          console.error("Error adding to cart:", error);
          toast.error(isArabic ? "فشل إضافة المنتج إلى السلة" : "Failed to Add to Cart", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        });
    } else {
      let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const productExists = cartItems.some(item => Object.keys(item)[0] === skuId.toString());

      if (productExists) {
        toast.error(isArabic ? "المنتج موجود بالفعل في السلة" : "Product already in cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        return;
      }

      cartItems = [...cartItems, { [skuId]: quantity }];
      localStorage.setItem("cartItems", JSON.stringify(cartItems));

      const cartIds = cartItems.map(item => Object.keys(item)[0]);
      setCartProductsIds(cartIds);
      setnumItems(cartItems.length);

      if (setCartCount) {
        setCartCount(cartItems.length);
      }

      toast.success(isArabic ? "تمت الإضافة إلى السلة!" : "Added to cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
    }
  }

  // Quick view handlers
  const handleQuickViewClick = async (product) => {
    try {
      setSelectedProduct(product);
      setIsQuickViewOpen(true);
    } catch (error) {
      console.error("Error handling quick view:", error);
      setSelectedProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProduct(null);
  };

  // Create banner slider settings
  const bannerSliderSettings = {
    responsive: {
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
        slidesToSlide: 1
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 1
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 2,
        slidesToSlide: 1
      }
    },
    infinite: true,
    autoPlay: false,
    autoPlaySpeed: 3000,
    customTransition: "all 300ms ease",
    transitionDuration: 300,
    arrows: true,
    rtl: isArabic,
    renderButtonGroupOutside: false,
  };

  const productCarouselResponsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1600 },
      items: 12
    },
    desktop: {
      breakpoint: { max: 1600, min: 1024 },
      items: 8
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 6
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 2
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="py-8">
        {isLoading ? (
          <div className="text-center">Loading data...</div>
        ) : categories.length === 0 ? (
          <div className="text-center">No categories available</div>
        ) : (
          (() => {
            // Filter categories with active products first and sort by rank
            const visibleCategories = categories
              .filter((category) => {
                const activeProducts = category.products?.filter(
                  (product) => product.isActive && !product.isDeleted
                ).sort((a, b) => {
                  // Always sort by itemRank ascending
                  const rankA = typeof a.itemRank === 'number' ? a.itemRank : 999;
                  const rankB = typeof b.itemRank === 'number' ? b.itemRank : 999;
                  return rankA - rankB;
                });
                return activeProducts && activeProducts.length > 0;
              })
              .sort((a, b) => {
                // Sort by rank in ascending order (rank 1 first)
                return (a.rank || 0) - (b.rank || 0);
              });

            // Function to get banners for a specific category index
            const getBannersForCategoryIndex = (index) => {
              const fixedBanners = banners
                .filter(banner => banner.type === "fixed")
                .sort((a, b) => {
                  // Sort by rank in ascending order (1,2,3,4,5,6,7,8,9...)
                  const rankA = typeof a.rank === 'number' ? a.rank : 999;
                  const rankB = typeof b.rank === 'number' ? b.rank : 999;
                  return rankA - rankB;
                });

              // Calculate which group of banners to show (0 for 1,2,3, 1 for 4,5,6, etc.)
              const bannerGroupIndex = Math.floor(index / 2);
              const startIndex = bannerGroupIndex * 3;

              // If we have enough banners for this group
              if (startIndex < fixedBanners.length) {
                // Get exactly 3 banners for this group
                const bannerGroup = fixedBanners.slice(startIndex, startIndex + 3);
                
                // For Arabic, reverse the row order
                const orderedGroup = isArabic ? [...bannerGroup].reverse() : bannerGroup;
                
                return orderedGroup;
              }

              return [];
            };

            // Function to get remaining banners after category banners
            const getRemainingBanners = () => {
              const fixedBanners = banners
                .filter(banner => banner.type === "fixed")
                .sort((a, b) => {
                  // Sort by rank in ascending order (1,2,3,4,5,6,7,8,9...)
                  const rankA = typeof a.rank === 'number' ? a.rank : 999;
                  const rankB = typeof b.rank === 'number' ? b.rank : 999;
                  return rankA - rankB;
                });

              // Calculate how many banners have been used between categories
              const usedBannersCount = Math.floor((visibleCategories.length - 1) / 2) * 3;

              // Get remaining banners
              const remainingBanners = fixedBanners.slice(usedBannersCount);

              // If we have 3 or more remaining, show first 3 in slider
              if (remainingBanners.length >= 3) {
                const sliderBanners = remainingBanners.slice(0, 3);
                const centeredBanners = remainingBanners.slice(3);
                
                // For Arabic, reverse the row order
                const orderedSliderBanners = isArabic ? [...sliderBanners].reverse() : sliderBanners;
                const orderedCenteredBanners = isArabic ? [...centeredBanners].reverse() : centeredBanners;
                
                return {
                  sliderBanners: orderedSliderBanners,
                  centeredBanners: orderedCenteredBanners
                };
              }

              // If less than 3, show all centered
              return {
                sliderBanners: [],
                centeredBanners: isArabic ? [...remainingBanners].reverse() : remainingBanners
              };
            };

            // Function to render banner slider
            const renderBannerSlider = (banners) => {
              if (banners.length === 0) return null;

              // For Arabic, reverse the entire row of banners
              const orderedBanners = isArabic ? [...banners].reverse() : banners;

              return (
                <div className="group relative">
                  <Carousel
                    {...bannerSliderSettings}
                    customLeftArrow={
                      <button className="absolute left-2 sm:left-4 bg-black hover:bg-black p-1 sm:p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[45%]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    }
                    customRightArrow={
                      <button className="absolute right-2 sm:right-4 bg-black hover:bg-black p-1 sm:p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[45%]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    }
                  >
                    {orderedBanners.map((banner) => (
                      <div
                        key={banner.id}
                        className="px-[4.5px] overflow-y-hidden"
                      >
                        <div className="transition-transform duration-300 hover:scale-105 overflow-hidden rounded-xl shadow-md w-[99%] mx-auto overflow-y-hidden">
                          <Link
                            to={banner.linkUrl || "#"}
                            target={banner.linkUrl?.startsWith("http") ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="block h-auto w-full overflow-y-hidden"
                          >
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-auto object-cover"
                              loading="lazy"
                            />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
              );
            };

            // Then render them with banners after every two
            return (
              <>
                {visibleCategories.map((category, index) => {
                  const activeProducts = category.products?.filter(
                    (product) => product.isActive && !product.isDeleted
                  ).sort((a, b) => {
                    // Always sort by itemRank ascending
                    const rankA = typeof a.itemRank === 'number' ? a.itemRank : 999;
                    const rankB = typeof b.itemRank === 'number' ? b.itemRank : 999;
                    return rankA - rankB;
                  });

                  const displayProducts = activeProducts;

                  return (
                    <React.Fragment key={category.id}>
                      <div className="mb-4 overflow-y-hidden">
                        <div className={`flex justify-between items-center mb-4 px-4 overflow-y-hidden ${isArabic ? "flex-row" : "flex-row-reverse"}`}>
                          <Link
                            to={`/CategoryDetails/${category.id}`}
                            className=" text-red-600 hover:text-red-700 text-[12px] font-medium overflow-y-hidden"
                          >
                            {isArabic ? "عرض الكل" : "View All"}
                          </Link>
                          <h2 className="alexandria-500 text-[16px] overflow-y-hidden capitalize">
                            {isArabic ? category.nameAr : category.nameEn}
                          </h2>
                        </div>

                        {activeProducts.length < 8 ? (
                          <>
                            {/* Desktop: flex row - Products not in slider */}
                            <div className="hidden lg:flex justify-center gap-2 px-4">
                              {(isArabic ? [...displayProducts].reverse() : displayProducts).map((product) => (
                                <div
                                  key={product.skuId}
                                  className={`${style.slideItem} group w-[calc(100%/8)]`}
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

                                      <a
                                        href={`/Productdetails/${product.skuId}`}
                                        onClick={e => {
                                          e.preventDefault();
                                          handleProductClick(product.skuId, `/Productdetails/${product.skuId}`);
                                        }}
                                      >
                                        <img
                                          src={product.Images?.[0]?.url || FALLBACK_IMAGE}
                                          className="w-full h-40 sm:h-24 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                                          alt={product.nameAr || "Product"}
                                          loading="lazy"
                                          decoding="async"
                                          onError={(e) => (e.target.src = FALLBACK_IMAGE)}
                                        />
                                      </a>
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
                                          <FaHeart className="h-6 w-6 sm:h-4 sm:w-4 text-red-500" />
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
                                          <FaEye className="h-6 w-6 sm:h-4 sm:w-4 text-gray-700" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden ">
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
                                        className={`${style.addToCartButton} flex text-[12px] font-semibold sm:text-[12px] flex flex-row gap-2 items-center justify-center ${product.availableStock <= 0 ? "bg-gray-400 cursor-not-allowed text-center" : ""}`}
                                        style={product.availableStock <= 0 ? { paddingTop: '1em', justifyContent: 'center', alignItems: 'center', marginTop: '-0.3em' } : {}}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (product.availableStock > 0) {
                                            addToCart(product.skuId);
                                          } else {
                                            toast.error(isArabic ? "المنتج غير متوفر" : "Product Out of Stock", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
                                          }
                                        }}
                                        disabled={product.availableStock <= 0}
                                      >
                                        {product.availableStock <= 0 ? (
                                          isArabic ? "غير متوفر" : "Out of Stock"
                                        ) : (
                                          <>
                                            <img
                                              src={cart}
                                              alt="Cart"
                                              className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-[1px] mb-[3px]"
                                            />
                                            {isArabic ? "أضف إلى السلة" : "Add to Cart"}
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Mobile and Slider Products */}
                            <div className="block lg:hidden">
                              <Carousel
                                key={displayProducts[0]?.skuId}
                                responsive={productCarouselResponsive}
                                infinite={false}
                                arrows={true}
                                rtl={isArabic}
                                keyBoardControl={true}
                                initialSlide={0}
                                containerClass={`product-slider ${style.sliderContainer}`}
                              >
                                {displayProducts.map((product) => (
                                  <div
                                    key={product.skuId}
                                    className={`${style.slideItem} px-1 group`}
                                  >
                                    <div className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto">
                                      <div className="relative overflow-hidden">
                                        {/* Show discount badge only if product is available and has discount */}
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

                                        {/* Show out of stock badge if product is not available */}
                                        {product.availableStock <= 0 && (
                                          <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                                            {isArabic ? "غير متوفر" : "Out of stock"}
                                          </div>
                                        )}

                                        <a
                                          href={`/Productdetails/${product.skuId}`}
                                          onClick={e => {
                                            e.preventDefault();
                                            handleProductClick(product.skuId, `/Productdetails/${product.skuId}`);
                                          }}
                                        >
                                          <img
                                            src={
                                              product.Images?.[0]?.url || FALLBACK_IMAGE
                                            }
                                            className="w-full h-40 sm:h-24 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                                            alt={product.nameAr || "Product"}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) =>
                                              (e.target.src = FALLBACK_IMAGE)
                                            }
                                          />
                                        </a>
                                        {/* Icons */}
                                        <div className="absolute top-1 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
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
                                      {/* Product info */}
                                      <div
                                        className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden text-right"
                                      >
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
                                          className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row-reverse ${isArabic ? "flex-row" : ""} gap-2 items-center justify-center ${product.availableStock <= 0 ? "bg-gray-400 cursor-not-allowed text-center" : ""}`}
                                          style={product.availableStock <= 0 ? { paddingTop: '1em', justifyContent: 'center', alignItems: 'center', marginTop: '-0.3em' } : {}}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (product.availableStock > 0) {
                                              addToCart(product.skuId);
                                            } else {
                                              toast.error(isArabic ? "المنتج غير متوفر" : "Product Out of Stock", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
                                            }
                                          }}
                                          disabled={product.availableStock <= 0}
                                        >
                                          {product.availableStock <= 0 ? (
                                            <span className="block mb-1 -mt-1">{isArabic ? "غير متوفر" : "Out of Stock"}</span>
                                          ) : (
                                            <>
                                              <img
                                                src={cart}
                                                alt="Cart"
                                                className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-1 mb-[3px]"
                                              />
                                              {isArabic ? "أضف إلى السلة" : "Add to Cart"}
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </Carousel>
                            </div>
                          </>
                        ) : (
                          <Carousel
                            key={displayProducts[0]?.skuId}
                            responsive={productCarouselResponsive}
                            infinite={false}
                            arrows={true}
                            rtl={isArabic}
                            keyBoardControl={true}
                            initialSlide={0}
                            containerClass={`product-slider ${style.sliderContainer}`}
                          >
                            {displayProducts.map((product) => (
                              <div
                                key={product.skuId}
                                className={`${style.slideItem} px-1 group`}
                              >
                                <div
                                  className="relative bg-white rounded-lg shadow-md overflow-hidden group mx-auto "

                                >
                                  <div className="relative overflow-hidden">
                                    {/* Show discount badge only if product is available and has discount */}
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

                                    {/* Show out of stock badge if product is not available */}
                                    {product.availableStock <= 0 && (
                                      <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] px-1 py-[2px] rounded-md z-10 font-alexandria font-medium">
                                        {isArabic ? "غير متوفر" : "Out of stock"}
                                      </div>
                                    )}

                                    <a
                                      href={`/Productdetails/${product.skuId}`}
                                      onClick={e => {
                                        e.preventDefault();
                                        handleProductClick(product.skuId, `/Productdetails/${product.skuId}`);
                                      }}
                                    >
                                      <img
                                        src={
                                          product.Images?.[0]?.url || FALLBACK_IMAGE
                                        }
                                        className="w-full h-40 sm:h-24 object-contain p-2 transition-transform duration-300 ease-in-out hover:scale-110"
                                        alt={product.nameAr || "Product"}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) =>
                                          (e.target.src = FALLBACK_IMAGE)
                                        }
                                      />
                                    </a>
                                    {/* Icons */}
                                    <div className="absolute top-1 right-3 flex flex-col space-y-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
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
                                  {/* Product info */}
                                  <div
                                    className="p-1 pb-6 sm:p-2 sm:pb-8 relative overflow-y-hidden text-right"
                                    dir="rtl"
                                  >
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
                                      className={`${style.addToCartButton} text-[12px] font-semibold sm:text-[12px] flex flex-row-reverse ${isArabic ? "flex-row" : ""} gap-2 items-center justify-center ${product.availableStock <= 0 ? "bg-gray-400 cursor-not-allowed text-center" : ""}`}
                                      style={product.availableStock <= 0 ? { paddingTop: '1em', justifyContent: 'center', alignItems: 'center', marginTop: '-0.3em' } : {}}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (product.availableStock > 0) {
                                          addToCart(product.skuId);
                                        } else {
                                          toast.error(isArabic ? "المنتج غير متوفر" : "Product Out of Stock", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
                                        }
                                      }}
                                      disabled={product.availableStock <= 0}
                                    >
                                      {product.availableStock <= 0 ? (
                                        <span className="block mb-1 -mt-1">{isArabic ? "غير متوفر" : "Out of Stock"}</span>
                                      ) : (
                                        <>
                                          <img
                                            src={cart}
                                            alt="Cart"
                                            className="inline-block w-5 h-5 sm:w-5 sm:h-5 mr-1 mb-[3px]"
                                          />
                                          {isArabic ? "أضف إلى السلة" : "Add to Cart"}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </Carousel>
                        )}
                      </div>

                      {/* Show banners after every 2 categories */}
                      {(index + 1) % 2 === 0 && index < visibleCategories.length - 1 && (
                        <div className="py-5 overflow-hidden">
                          {(() => {
                            const categoryBanners = getBannersForCategoryIndex(index);

                            if (categoryBanners.length > 0) {
                              return renderBannerSlider(categoryBanners);
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Show remaining banners after all categories */}
                {(() => {
                  const { sliderBanners, centeredBanners } = getRemainingBanners();

                  return (
                    <>
                      {/* Show remaining banners in slider if any */}
                      {sliderBanners.length > 0 && (
                        <div className="py-5 overflow-hidden">
                          {renderBannerSlider(sliderBanners)}
                        </div>
                      )}

                      {/* Show remaining banners centered if any */}
                      {centeredBanners.length > 0 && (
                        <div className="py-5 overflow-hidden">
                          {/* Desktop view - centered banners */}
                          <div className="hidden sm:flex justify-center gap-4">
                            {centeredBanners.map((banner) => (
                              <div
                                key={banner.id}
                                className="w-[30%] transition-transform duration-300 hover:scale-105 overflow-hidden rounded-xl shadow-md"
                              >
                                <Link
                                  to={banner.linkUrl || "#"}
                                  target={banner.linkUrl?.startsWith("http") ? "_blank" : "_self"}
                                  rel="noopener noreferrer"
                                  className="block h-auto w-full overflow-hidden"
                                >
                                  <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="w-full h-full object-cover object-center"
                                    loading="lazy"
                                  />
                                </Link>
                              </div>
                            ))}
                          </div>
                          {/* Mobile view - centered banners */}
                          <div className="sm:hidden">
                            <Carousel
                              {...bannerSliderSettings}
                              rtl={isArabic}
                              customLeftArrow={
                                <button className="absolute left-2 bg-black hover:bg-black p-1 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[45%]">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                              }
                              customRightArrow={
                                <button className="absolute right-2 bg-black hover:bg-black p-1 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[45%]">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              }
                            >
                              {(isArabic ? [...centeredBanners].reverse() : centeredBanners).map((banner) => (
                                <div
                                  key={banner.id}
                                  className="px-[4.5px] overflow-y-hidden"
                                >
                                  <div className="transition-transform duration-300 hover:scale-105 overflow-hidden rounded-xl shadow-md w-[99%] mx-auto overflow-y-hidden">
                                    <Link
                                      to={banner.linkUrl || "#"}
                                      target={banner.linkUrl?.startsWith("http") ? "_blank" : "_self"}
                                      rel="noopener noreferrer"
                                      className="block h-auto w-full overflow-y-hidden"
                                    >
                                      <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-full h-auto object-cover"
                                        loading="lazy"
                                      />
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </Carousel>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            );
          })()
        )}
      </div>

      {isQuickViewOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[95] p-2 sm:p-4"
          onClick={handleCloseQuickView}
        >
          <div
            className="bg-white rounded-lg relative w-full max-w-xs sm:max-w-md md:max-w-lg p-3 sm:p-6"
            onClick={(e) => e.stopPropagation()}
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
              <div className="w-full sm:w-1/2 text-right ">
                <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 mt-2 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? selectedProduct.nameAr : selectedProduct.nameEn}
                </h3>

                <p
                  className={`flex items-center text-gray-600 mb-0.5 sm:mb-1 text-[15px] font-medium ${isArabic ? "justify-start text-right" : "justify-start text-left"}`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <span className={`text-gray-500 text-[15px] ${isArabic ? "mr-1" : "ml-1"}`}>
                    {isArabic ? `${selectedProduct.priceAfter} جنية` : `${selectedProduct.priceAfter} EGP`}
                  </span>
                  {selectedProduct.priceBefore && selectedProduct.priceBefore > selectedProduct.priceAfter && (
                    <span className={`text-red-400 line-through text-[11px] ${isArabic ? "mr-1" : "ml-1"}`}>
                      {isArabic ? `${selectedProduct.priceBefore} جنية` : `${selectedProduct.priceBefore} EGP`}
                    </span>
                  )}
                </p>
                <p className={`text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4 line-clamp-3 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? selectedProduct.cardDescriptionAr : selectedProduct.cardDescriptionEn}
                </p>
                <div className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ${isArabic ? "justify-end" : "justify-start"} `}>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-xs sm:text-sm w-full sm:w-auto font-alexandria font-light whitespace-nowrap"
                    onClick={() => {
                      if (selectedProduct.availableStock > 0) {
                        addToCart(selectedProduct.skuId);
                      } else {
                        toast.error(isArabic ? "Product is out of stock" : "المنتج غير متوفر", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
                      }
                    }}
                    disabled={selectedProduct.availableStock <= 0}
                  >
                    {selectedProduct.availableStock <= 0
                      ? (isArabic ? "غير متوفر" : "Out of Stock")
                      : (isArabic ? "أضف إلى السلة" : "Add to Cart")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}