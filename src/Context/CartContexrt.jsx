/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useState } from "react";
import { use } from "react";
import { createContext, useEffect } from "react";
import toast from "react-hot-toast";

export let CartContext = createContext();
export default function CartContextProvider(props) {
  const [CartProductsIds, setCartProductsIds] = useState([]);
  const [numItems, setnumItems] = useState(0);  // Initialize with 0
  const [cartCount, setCartCount] = useState(0);  // Initialize with 0
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Initialize cart in localStorage and fetch counts on mount
  useEffect(() => {
    const storedArrayString = localStorage.getItem("cartItems");
    if (!storedArrayString) {
      localStorage.setItem("cartItems", JSON.stringify([]));
    } else {
      const items = JSON.parse(storedArrayString);
      setCartProductsIds(items);
      setnumItems(items.length);
      setCartCount(items.length); // Make sure cartCount is initialized
    }
    
    // Fetch counts when component mounts
    fetchCartCount();
    fetchWishlistCount();
  }, []);

  // Add to wishlist function
  const addToWishlist = async (skuId) => {
    try {
      const userToken = localStorage.getItem("userToken");
      
      if (!userToken) {
        toast.error("Please login to add to wishlist");
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
      
      toast.success("Added to wishlist successfully!");
      fetchWishlistCount(); // Fetch updated wishlist count
    } catch (error) {
      console.error("Wishlist error:", error);
      fetchWishlistCount();
      toast.error(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  };


    // Add to cart function
    const fetchCartCount = async () => {
      try {
        const userToken = localStorage.getItem("userToken");
        
        if (!userToken) {
          // إذا لم يكن هناك token، استخدم عدد العناصر المخزنة محليًا
          const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
          setCartCount(cartItems.length);
          return;
        }

        const config = {
          headers: {
            "Access-Token": userToken,
          },
        };

        const response = await axios.get(
          "http://127.0.0.1:3000/api/v1/carts/cart/",
          config
        );

        if (response.data && Array.isArray(response.data)) {
          // تعيين عدد المنتجات في السلة
          setCartCount(response.data.length);
          
          // تحديث numItems أيضًا إذا كان متاحًا
          if (typeof setNumItems === 'function') {
            setNumItems(response.data.length);
          }
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        return 0;
      }
    };
    
    // تعديل دالة addToCart لتحديث العداد بشكل صحيح
    const addToCart = async (skuId, quantity = 1) => {
      try {
        const userToken = localStorage.getItem("userToken");
    
        if (!userToken) {
          let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
          const productExists = cartItems.some(item => Object.keys(item)[0] === skuId.toString());
          if (!productExists) {
            cartItems = [...cartItems, { [skuId]: 1 }];
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            setCartProductsIds(cartItems.map(item => Object.keys(item)[0]));
            setnumItems(cartItems.length);
            setCartCount(cartItems.length); // تحديث العداد مباشرة
            toast.success("Added to cart!");
          } else {
            toast.error("Product already in cart!");
          }
        } else {
          const config = {
            headers: {
              "Access-Token": userToken,
              "Content-Type": "application/json",
            },
          };
          const requestBody = {
            productId: [{ [skuId]: quantity }]
          };
    
          await axios.post(
            "http://127.0.0.1:3000/api/v1/carts/cart",
            requestBody,
            config
          );
    
          fetchCartCount(); // استدعاء fetchCartCount للحصول على القيمة الجديدة
          toast.success("Added to cart successfully!");
        }
      } catch (error) {
        console.error("Cart error:", error);
        toast.error(
          error.response?.status === 401
            ? "Please login to add to cart"
            : error.response?.data?.message || "Failed to add to cart"
        );
      }
    };
  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (token) {
        const response = await axios.get("http://127.0.0.1:3000/api/v1/wishlists/wishlist", {
          headers: { "Access-Token": token }
        });
        // استخراج عدد المنتجات بشكل صحيح من الرد
        const count = response.data?.length || 0;
        setWishlistCount(count);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };





  return (
    <CartContext.Provider
      value={{
        CartProductsIds,
        setCartProductsIds,
        numItems,
        setnumItems,
        addToCart,
        addToWishlist,
        fetchCartCount,
        fetchWishlistCount,
        cartCount,
        setCartCount,
        wishlistCount,
        setWishlistCount,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}
