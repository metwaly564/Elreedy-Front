/* eslint-disable no-unused-vars */
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/White-Alreedy.png";

import {
  HomeIcon,
  CogIcon,
  FolderIcon,
  ReceiptRefundIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  SquaresPlusIcon,
  ListBulletIcon,
  ChartBarSquareIcon,
  TagIcon,
  ShoppingBagIcon,
  PhotoIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  TicketIcon,
  TruckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  CubeIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function AdminNavbar() {

  const location = useLocation();
  const hiddenFooterRoutes = [
    '/login',
    '/signup',
    '/register',
    '/ForgetPassword',
    '/PasswordReset',
    '/StaffLogin',
    '/staffLogin'
  ];
   // Don't show Navbar on these routes
   if (hiddenFooterRoutes.includes(location.pathname)) {
    return null;
  }





  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };


  return (
<>
  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md py-4 px-6 flex flex-wrap items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        <Link to="/AdminDashboard" className="text-xl font-semibold flex items-center whitespace-nowrap">
            <img src={logo} className="w-[35%]" alt="" />        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2 md:space-x-6 mt-2 md:mt-0 w-full md:w-auto justify-between">
          <nav className="flex flex-wrap gap-2 md:gap-6">
            <Link to="/AdminDashboard" className="flex items-center px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium hover:bg-blue-600 rounded-md transition duration-150 whitespace-nowrap">
              <HomeIcon className="h-4 w-4 md:h-5 md:w-5 mr-1" />
              Home
            </Link>
         
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-2 md:space-x-3">
        
            <button 
              onClick={handleSignOut}
              className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeftOnRectangleIcon className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </div>

</>  )
}
