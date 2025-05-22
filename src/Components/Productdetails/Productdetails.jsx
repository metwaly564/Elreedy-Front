import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import styles from './Productdetails.module.css';
import toast from "react-hot-toast";
import { ArrowLeft, Heart } from "lucide-react";
import { CartContext } from "../../Context/CartContexrt";
import { UserContext } from "../../Context/UserContext";

export default function ProductDetails() {
  const { skuId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { CartProductsIds, setCartProductsIds, numItems, setnumItems } = useContext(CartContext);
  const { isArabic } = useContext(UserContext);

  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add responsive settings for react-multi-carousel
  const carouselResponsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://127.0.0.1:3000/api/v1/products/product/${skuId}`
        );
        
        if (response.data) {
          setProduct(response.data);
          trackProductView(skuId);
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (skuId) {
      fetchProduct();
    }
  }, [skuId]);
  
  async function trackProductView(skuId) {
    try {
      await axios.get(
        `http://127.0.0.1:3000/api/v1/products/product-addview/${skuId}`
      );
    } catch (error) {
      console.error("Error tracking product view:", error);
    }
  }

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
        productId: skuId.toString()
      };

      await axios.post(
        "http://127.0.0.1:3000/api/v1/wishlists/wishlist",
        requestBody,
        config
      );

      toast.success(isArabic ? "تمت الإضافة إلى المفضلة بنجاح!" : "Added to wishlist successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.success(isArabic ? "موجود بالفعل في المفضلة" : "Already in Your Wishlist", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
    }
  }

  async function addToCart(skuId, quantity = 1) {
    try {
      const userToken = localStorage.getItem("userToken");
      if (!userToken) {
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
        toast.success(isArabic ? "تمت الإضافة إلى السلة!" : "Added to cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      } else {
        // Fetch current cart
        const config = {
          headers: {
            "Access-Token": userToken,
            "Content-Type": "application/json",
          },
        };
        let cartArr = [];
        let alreadyInCart = false;
        try {
          const cartRes = await axios.get("http://127.0.0.1:3000/api/v1/carts/cart/", config);
          if (Array.isArray(cartRes.data)) {
            cartArr = cartRes.data.map(item => {
              if (item.productId.toString() === skuId.toString()) alreadyInCart = true;
              return { [item.productId]: item.quantity };
            });
          }
        } catch (e) {
          cartArr = [];
        }
        if (alreadyInCart) {
          toast.error(isArabic ? "المنتج موجود بالفعل في السلة" : "Product already in cart!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
          return;
        }
        cartArr.push({ [skuId]: quantity });
        const requestBody = { productId: cartArr };
        await axios.post(
          "http://127.0.0.1:3000/api/v1/carts/cart",
          requestBody,
          config
        );
        toast.success(isArabic ? "تمت الإضافة إلى السلة بنجاح!" : "Added to cart successfully!", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        if (typeof fetchCartCount === 'function') fetchCartCount();
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error(
        error.response?.status === 401
          ? isArabic ? "الرجاء تسجيل الدخول لإضافة إلى السلة" : "Please login to add to cart"
          : error.response?.data?.message || (isArabic ? "فشل إضافة المنتج إلى السلة" : "Failed to add to cart"),
        { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } }
      );
    }
  }

  const updateCartQuantity = async (newQuantity) => {
    const userToken = localStorage.getItem("userToken");
    if (!userToken) {
      // Guest: update localStorage
      let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const idx = cartItems.findIndex(item => Object.keys(item)[0] === product.skuId.toString());
      if (idx !== -1) {
        cartItems[idx][product.skuId] = newQuantity;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      }
      setQuantity(newQuantity);
      toast.success(isArabic ? "تم تحديث الكمية" : "Quantity updated", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
    } else {
      // Logged in: update via API
      try {
        const config = {
          headers: {
            "Access-Token": userToken,
            "Content-Type": "application/json",
          },
        };
        // Only update this product's quantity
        const requestBody = { productId: [{ [product.skuId]: newQuantity }] };
        await axios.post("http://127.0.0.1:3000/api/v1/carts/cart", requestBody, config);
        setQuantity(newQuantity);
        toast.success(isArabic ? "تم تحديث الكمية" : "Quantity updated", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
        if (typeof fetchCartCount === 'function') fetchCartCount();
      } catch (error) {
        toast.error(isArabic ? "فشل تحديث الكمية" : "Failed to update quantity", { style: { fontFamily: "Alexandria, sans-serif", fontWeight: 300 } });
      }
    }
  };

  const incrementQuantity = () => {
    if (quantity < product?.maxOrderQuantity) {
      updateCartQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateCartQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${isArabic ? 'rtl' : 'ltr'}`}>
        <h2 className="text-xl font-semibold text-red-600 mb-2 font-alexandria" style={{fontFamily: 'Alexandria, sans-serif', fontWeight: 300}}>{error}</h2>
        <Link to="/" className="text-red-600 hover:underline font-alexandria" style={{fontFamily: 'Alexandria, sans-serif', fontWeight: 300}} >
          {isArabic ? "العودة إلى الصفحة الرئيسية" : "Return to homepage"}
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`text-center py-12 ${isArabic ? 'rtl' : 'ltr'}`}>
        <h2 className="text-xl font-semibold mb-2">
          {isArabic ? "المنتج غير موجود" : "Product not found"}
        </h2>
        <Link to="/" className="text-red-600 hover:underline">
          {isArabic ? "تصفح المنتجات الأخرى" : "Browse other products"}
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.availableStock <= 0;

  // Arabic version
  if (isArabic) {
    return (
      <div className="mx-auto mt-20 md:mt-6 px-4 py-8 max-w-4xl rtl bg-white rounded-lg" dir="rtl">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 mt-10 font-alexandria font-light">
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة إلى الصفحة الرئيسية
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-4">
            {product.Images && product.Images.length > 0 ? (
              <div className={styles.carouselContainer}>
                <Carousel
                  responsive={carouselResponsive}
                  infinite={true}
                  autoPlay={true}
                  autoPlaySpeed={3000}
                  showDots={true}
                  arrows={false}
                  rtl={isArabic}
                  containerClass={styles.carouselContainer}
                  dotListClass={styles.dotList}
                  itemClass="flex justify-center"
                >
                  {product.Images.map((image, index) => (
                    <div key={index} className="flex justify-center">
                      <img
                        src={image.url}
                        alt={product.nameAr}
                        className="w-full h-auto object-contain mx-auto"
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            ) : (
              <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">لا توجد صور متاحة</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.nameAr}</h1>
            <p className="text-gray-600 font-alexandria font-light">من {product.company}</p>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-3xl font-bold text-gray-900">{product.priceAfter} جنيه</span>
              {product.priceBefore && product.priceBefore !== product.priceAfter && (
                <>
                  <span className="text-xl text-gray-500 line-through ml-4 font-alexandria font-light">{product.priceBefore} جنيه</span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded ml-4 font-alexandria font-light">
                    خصم {Math.round(
                      ((product.priceBefore - product.priceAfter) / product.priceBefore) * 100
                    )}%
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">الوصف</h3>
              <p className="text-gray-700 font-alexandria font-extralight">{product.cardDescriptionAr}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">التوفر</h3>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full ml-2 ${isOutOfStock ? 'bg-gray-500' : 'bg-green-500'}`}></span>
                <span className="text-gray-700 font-alexandria font-extralight">
                  {isOutOfStock ? "غير متوفر" : "متوفر"}
                </span>
                {!isOutOfStock && product.availableStock <= 2 && (
                  <span className="mr-2 text-red-500 text-sm font-alexandria font-light">
                    {product.availableStock === 1 ? "باقي قطعة واحدة فقط!" : "باقي قطعتين فقط!"}
                  </span>
                )}
              </div>
            </div>

            {!isOutOfStock && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-reverse space-x-4">
                  <span className="text-gray-700 font-alexandria font-light">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="px-3 py-1 bg-gray-100 disabled:opacity-50 font-alexandria font-light"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-alexandria font-light">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.maxOrderQuantity || quantity >= product.availableStock}
                      className="px-3 py-1 bg-gray-100 disabled:opacity-50 font-alexandria font-light"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 font-alexandria font-light">الحد الأقصى {product.maxOrderQuantity} لكل طلب</span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">العلامات</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag) => (
                  <Link to={`/TagDetails/${tag.tagId}`} key={tag.tagId}>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize font-alexandria font-light">
                      {tag.tag.nameEn} {/* Assuming tags only have English names */}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">{isArabic ? "التصنيفات" : "Categories"}</h3>
              <div className="flex flex-wrap gap-2">
                {product.productCategories?.map((categoryObj) => {
                  const cat = categoryObj.category || {};
                  const name = isArabic ? (cat.nameAr || cat.nameEn || "") : (cat.nameEn || cat.nameAr || "");
                  return (
                    <Link 
                      to={`/CategoryDetails/${categoryObj.categoryId}`}
                      key={categoryObj.categoryId}
                      className="hover:text-red-500 transition duration-300 font-light"
                    >
                      <span className="alexandria-500 text-[14px] capitalize font-alexandria font-light">
                        {name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-reverse space-x-4 pt-4">
              <button 
                onClick={() => addToCart(product.skuId, quantity)}
                disabled={isOutOfStock}
                className={`px-6 py-2 rounded flex-1 font-alexandria font-light ${
                  isOutOfStock 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isOutOfStock ? "غير متوفر" : "أضف إلى السلة"}
              </button>
              <button 
                onClick={() => addToWishlist(product.skuId)}
                className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded"
              >
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4">الوصف التفصيلي</h2>
            <p className="text-gray-700 font-alexandria font-extralight">{product.descriptionAr}</p>
          </div>
        </div>
      </div>
    );
  }

  // English version
  return (
    <div className="mx-auto mt-20 md:mt-6 px-4 py-8 max-w-4xl ltr font-alexandria font-light bg-white rounded-lg" dir="ltr">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 mt-10 font-alexandria font-light">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {product.Images && product.Images.length > 0 ? (
            <div className={styles.carouselContainer}>
              <Carousel
                responsive={carouselResponsive}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={3000}
                showDots={true}
                arrows={false}
                rtl={isArabic}
                containerClass={styles.carouselContainer}
                dotListClass={styles.dotList}
                itemClass="flex justify-center"
              >
                {product.Images.map((image, index) => (
                  <div key={index} className="flex justify-center">
                    <img
                      src={image.url}
                      alt={product.nameEn}
                      className="w-full object-contain mx-auto"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          ) : (
            <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.nameEn}</h1>
          <p className="text-gray-600 font-alexandria font-light">By {product.company}</p>
          
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">{product.priceAfter} EGP</span>
            {product.priceBefore && product.priceBefore !== product.priceAfter && (
              <>
                <span className="text-xl text-gray-500 line-through ml-4">{product.priceBefore} EGP</span>
                <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded ml-4">
                  {Math.round(
                    ((product.priceBefore - product.priceAfter) / product.priceBefore) * 100
                  )}% off
                </span>
              </>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 font-alexandria font-[300]">{product.cardDescriptionEn}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${isOutOfStock ? 'bg-gray-500' : 'bg-green-500'}`}></span>
              <span className="text-gray-700 font-alexandria font-extralight">
                {isOutOfStock ? "Out of Stock" : 
                  product.availableStock <= 2 ? 
                    `In Stock (${product.availableStock} available)` : 
                    "In Stock"}
              </span>
              {!isOutOfStock && product.availableStock <= 2 && (
                <span className="ml-2 text-red-500 text-sm font-alexandria font-light">
                  {product.availableStock === 1 ? "Only 1 item left!" : "Only 2 items left!"}
                </span>
              )}
            </div>
          </div>

          {!isOutOfStock && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-alexandria font-light">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-3 py-1 bg-gray-100 disabled:opacity-50 font-alexandria font-light"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-alexandria font-light">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.maxOrderQuantity || quantity >= product.availableStock}
                    className="px-3 py-1 bg-gray-100 disabled:opacity-50 font-alexandria font-light"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500 font-alexandria font-light">Max {product.maxOrderQuantity} per order</span>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <Link to={`/TagDetails/${tag.tagId}`} key={tag.tagId}>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {tag.tag.nameEn}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">{isArabic ? "التصنيفات" : "Categories"}</h3>
            <div className="flex flex-wrap gap-2">
              {product.productCategories?.map((categoryObj) => {
                const cat = categoryObj.category || {};
                const name = isArabic ? (cat.nameAr || cat.nameEn || "") : (cat.nameEn || cat.nameAr || "");
                return (
                  <Link 
                    to={`/CategoryDetails/${categoryObj.categoryId}`}
                    key={categoryObj.categoryId}
                    className="hover:text-red-500 transition duration-300 font-light"
                  >
                    <span className="alexandria-500 text-[14px] capitalize font-alexandria font-light">
                      {name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => addToCart(product.skuId, quantity)}
              disabled={isOutOfStock}
              className={`px-6 py-2 rounded flex-1 font-alexandria font-light ${
                isOutOfStock 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button 
              onClick={() => addToWishlist(product.skuId)}
              className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded"
            >
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Detailed Description</h2>
          <p className="text-gray-700 font-alexandria font-[300]">{product.descriptionEn}</p>
        </div>
      </div>
    </div>
  );
}