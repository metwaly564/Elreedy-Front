import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { CartContext } from "../../Context/CartContexrt";
import logo from "../../assets/Alreedy.png";
import axios from "axios";
import {
  FiShoppingCart,
  FiHeart,
  FiLogIn,
  FiSearch,
  FiChevronDown
} from "react-icons/fi";
export default function Inventory() {
  const [toggleLanguageDropdown, setToggleLanguageDropdown] = useState()
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [handleAuthAction, setHandleAuthAction] = useState(false);
  const [isArabic] = useState(false)
  const [cartCount] = useState(2)
  const [inputValue] = useState()
  const [handleInputChange] = useState(); 
  const [handleKeyPress] = useState(); 
  return (
    <>
           <div className="flex flex-col space-y-6">
                    <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between font-medium text-right">
                            <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                            <span className="text-lg">تواصل معنا</span>
                        </summary>
                        <div className="mt-3 text-right">{/* Next: "Add contact information and form" */}</div>
                    </details>

                    <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between font-medium text-right">
                            <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                            <span className="text-lg">الأقسام</span>
                        </summary>
                        <div className="mt-3 text-right">{/* Next: "Add department links" */}</div>
                    </details>

                    <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between font-medium text-right">
                            <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                            <span className="text-lg">روابط مفيدة</span>
                        </summary>
                        <div className="mt-3 text-right">{/* Next: "Add useful links with hover effects" */}</div>
                    </details>

                    <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between font-medium text-right">
                            <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                            <span className="text-lg">معلومات</span>
                        </summary>
                        <div className="mt-3 text-right">{/* Next: "Add information blocks with icons" */}</div>
                    </details>

                    <details className="group cursor-pointer">
                        <summary className="flex items-center justify-between font-medium text-right">
                            <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
                            <span className="text-lg">الإشتراك في النشرة الإخبارية</span>
                        </summary>
                        <div className="mt-3 text-right">
                            {/* Next: "Add newsletter subscription form with submit button" */}
                        </div>
                    </details>
                </div>
      
    
        </>
  )
}
  

