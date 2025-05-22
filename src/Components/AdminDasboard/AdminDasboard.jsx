import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
import AdminNavbar from "../AdminNavbar/AdminNavbar";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen -mt-10 bg-gray-50 font-sans">
      {/* Fixed Navbar */}
      {/* Main Content */}
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Edit Products */}
          <Link 
            to="/AdminEditProducts" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <ShoppingBagIcon className="h-10 w-10 text-blue-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Products</span>
          </Link>

          {/* Edit Banners */}
          <Link 
            to="/AdminEditBanners" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <PhotoIcon className="h-10 w-10 text-purple-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Banners</span>
          </Link>

          {/* Edit Tags */}
          <Link 
            to="/AdminEditTags" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <TagIcon className="h-10 w-10 text-[rgb(170,15,18)] mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Tags</span>
          </Link>

          {/* Edit Categories */}
          <Link 
            to="/AdminEditCateg" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <BuildingStorefrontIcon className="h-10 w-10 text-yellow-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Categories</span>
          </Link>

          {/* Edit Cities */}
          <Link 
            to="/AdminEditCities" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <MapPinIcon className="h-10 w-10 text-red-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Cities</span>
          </Link>

          {/* Edit Promo Code */}
          <Link 
            to="/AdminEditPromoCode" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <TicketIcon className="h-10 w-10 text-indigo-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Promo Code</span>
          </Link>

          {/* Operation Team Dashboard */}
          <Link 
            to="/OperationTeamDashboard" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <ChartBarSquareIcon className="h-10 w-10 text-blue-400 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Operation Team</span>
          </Link>

          {/* Delivery Boys */}
          <Link 
            to="/AdminEditDeliveryBoys" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <TruckIcon className="h-10 w-10 text-orange-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Delivery Boys</span>
          </Link>

          {/* Edit Staff */}
          <Link 
            to="/AdminEditStaff" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <UsersIcon className="h-10 w-10 text-teal-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Edit Staff</span>
          </Link>

          {/* Sales Page */}
          <Link 
            to="/AdminSalesDashboard" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CurrencyDollarIcon className="h-10 w-10 text-[rgb(200,15,18)] mb-2" />
            <span className="text-gray-700 font-semibold text-center">Sales Page</span>
          </Link>

          {/* Promo Codes Analysis */}
          <Link 
            to="/PromoCodesAnalysis" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <ChartPieIcon className="h-10 w-10 text-purple-600 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Promo Codes Analysis</span>
          </Link>

          {/* Products Analysis */}
          <Link 
            to="/ProductsAnalysis" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <CubeIcon className="h-10 w-10 text-blue-600 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Products Analysis</span>
          </Link>

          {/* Users Analysis */}
          <Link 
            to="/UsersAnalysis" 
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <UserGroupIcon className="h-10 w-10 text-pink-500 mb-2" />
            <span className="text-gray-700 font-semibold text-center">Users Analysis</span>
          </Link>
        </div>
      </div>
    </div>
  );
}