/* eslint-disable no-unused-vars */
import { createBrowserRouter, BrowserRouter } from "react-router-dom";
import "./App.css";
import Layout from "./Components/Layout/Layout";
import Home from "./Components/Home/Home";
import Cart from "./Components/Cart/Cart";
import Products from "./Components/Products/Products";
import Brands from "./Components/Brands/Brands";
import Categories from "./Components/Categories/Categories";
import { RouterProvider } from "react-router-dom";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import Productdetails from "./Components/Productdetails/Productdetails";
import UserContextProvider, { UserContext } from "./Context/UserContext";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "react-query";
import { Routes, Route } from "react-router-dom";
import useProducts from "./Hooks/useProducts";
import CartContextProvider from "./Context/CartContexrt";
import { Toaster } from "react-hot-toast";
import Checkout from "./Components/Checkout/Checkout";
import Allorders from "./Components/Allorders/Allorders";
import Inventory from "./Components/Inventory/Inventory";
import MultiRangeSlider from "./Components/multiRangeSlider/multiRangeSlider";
import SortandSearch from "./Components/SortandSearch/SortandSearch";
import Search from "./Components/Search/Search";
import ManageProducts from "./Components/AdminDasboard/AdminDasboard";
import CounterContextProvider from "./Context/CounterContext";
import ForgetPassword from "./Components/ForgetPassword/ForgetPassword";
import VerifyOtp from "./Components/VerifyOtp/VerifyOtp";
import ForgetPassVerifyOtp from "./Components/ForgetPassVerifyOtp/ForgetPassVerifyOtp";
import PasswordReset from "./Components/PasswordReset/PasswordReset";
import AdminDasboard from "./Components/AdminDasboard/AdminDasboard";
import AdminEditProducts from "./Components/AdminEditProducts/AdminEditProducts";
import EditProduct from "./Components/EditProduct/EditProduct";
import AdminAddNewPr from "./Components/AdminAddNewPr/AdminAddNewPr";
import AdminEditTags from "./Components/AdminEditTags/AdminEditTags";
import EditTag from "./Components/EditTag/EditTag";
import AdminAddNewTag from "./Components/AdminAddNewTag/AdminAddNewTag";
import AdminEditCateg from "./Components/AdminEditCateg/AdminEditCateg";
import AdminEditCategory from "./Components/AdminEditCategory/AdminEditCategory";
import AdminAddNewCat from "./Components/AdminAddNewCat/AdminAddNewCat";
import AdminEditCities from "./Components/AdminEditCities/AdminEditCities";
import AdminEditBanners from "./Components/AdminEditBanners/AdminEditBanners";
import AdminEditPromoCode from "./Components/AdminEditPromoCode/AdminEditPromoCode";
import AdminAddNewPromoCode from "./Components/AdminAddNewPromoCode/AdminAddNewPromoCode";
import OperationTeamDashboard from "./Components/OperationTeamDashboard/OperationTeamDashboard";
import AdminEditDeliveryBoys from "./Components/AdminEditDeliveryBoys/AdminEditDeliveryBoys";
import AdminEditStaff from "./Components/AdminEditStaff/AdminEditStaff";
import StaffLogin from "./Components/StaffLogin/StaffLogin";
import SalesOrders from "./Components/SalesOrders/SalesOrders";
import PaymentSuccess from "./Components/PaymentSuccess/PaymentSuccess";
import AdminSalesDashboard from "./Components/AdminSalesDashboard/AdminSalesDashboard";
import UsersAnalysis from "./Components/UsersAnalysis/UsersAnalysis";
import ProductsAnalysis from "./Components/ProductsAnalysis/ProductsAnalysis";
import PromoCodesAnalysis from "./Components/PromoCodesAnalysis/PromoCodesAnalysis";
import Wishlist from "./Components/wishlist/wishlist";
import Account from "./Components/Account/Account";
import Unauthorized from "./Components/unauthorized/unauthorized";
import NotFound from "./Components/notFound/notFound";
import CategoryDetails from "./Components/CategoryDetails/CategoryDetails";
import TagDetails from "./Components/TagDetails/TagDetails";
import './assets/fonts/fonts.css';
import "./assets/fonts/alexandria.css";
import Branches from "./Components/Branches/Branches";
import React from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: 
    <Layout />,
    children: [
      // Public routes (no authentication required)
      { index: true, element: <Home /> },
      { path: "cart", element: <Cart /> },
      { path: "Categories", element: <Categories /> },
      { path: "Products", element: <Products /> },
      { path: "Productdetails/:skuId", element: <Productdetails /> },
      { path: "Brands", element: <Brands /> },
      { path: "Register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "Inventory", element: <Inventory /> },
      { path: "Multirange", element: <SortandSearch /> },
      { path: "search", element: <Search /> },
      { path: "ForgetPassword", element: <ForgetPassword /> },
      { path: "VerifyOtp", element: <VerifyOtp /> },
      { path: "ForgetPassVerifyOtp", element: <ForgetPassVerifyOtp /> },
      { path: "PasswordReset", element: <PasswordReset /> },
      { path: "StaffLogin", element: <StaffLogin /> },
      { path: "PaymentSuccess", element: <PaymentSuccess /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "Account", element: <Account /> },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: `CategoryDetails/:id`, element: <CategoryDetails /> },
      { path: `/TagDetails/:id`, element: <TagDetails /> },
      // Catch all route for 404
      { path: "*", element: <NotFound /> },
      { path: "branches", element: <Branches /> },
      // Protected routes for all authenticated users (any rule including customers)
      {
        path: "checkout",
        element: (
          <Checkout />
        ),
      },
      {
        path: "allorders",
        element: (
          <Allorders />
        ),
      },
      
      // ADMIN-ONLY ROUTES (rule = "admin")
      { path: "AdminSalesDashboard", element: (

        
        <ProtectedRoute allowedRules={['Admin']}>
      <AdminSalesDashboard /> 
        </ProtectedRoute>
        )
      },
      {
    },
      {
        path: "AdminDashboard",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminDasboard />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditProducts",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditProducts />
          </ProtectedRoute>
        )
      },
      {
        path: "EditProduct",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <EditProduct />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminAddNewPr",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminAddNewPr />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditTags",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditTags />
          </ProtectedRoute>
        )
      },
      {
        path: "EditTag",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <EditTag />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminAddNewTag",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminAddNewTag />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditCateg",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditCateg />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditCategory",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditCategory />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminAddNewCat",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminAddNewCat />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditCities",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditCities />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditBanners",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditBanners />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditPromoCode",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditPromoCode />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminAddNewPromoCode",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminAddNewPromoCode />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditDeliveryBoys",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditDeliveryBoys />
          </ProtectedRoute>
        )
      },
      {
        path: "AdminEditStaff",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <AdminEditStaff />
          </ProtectedRoute>
        )
      },
      {
        path: "UsersAnalysis",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <UsersAnalysis  />
          </ProtectedRoute>
        )
      },
      {
        path: "ProductsAnalysis",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <ProductsAnalysis   />
          </ProtectedRoute>
        )
      },
      {
        path: "PromoCodesAnalysis",
        element: (
          <ProtectedRoute allowedRules={['Admin']}>
            <PromoCodesAnalysis   />
          </ProtectedRoute>
        )
      },

      // OPERATION TEAM ROUTES (rule = "operation")
      {
        path: "OperationTeamDashboard",
        element: (
          <ProtectedRoute allowedRules={['operation']}>
            <OperationTeamDashboard />
          </ProtectedRoute>
        )
      },

      // SALES TEAM ROUTES (rule = "sales")
      {
        path: "SalesOrders",
        element: (
          <ProtectedRoute allowedRules={['sales']}>
            <SalesOrders />
          </ProtectedRoute>
        )
      }
    ],
  },
]
)
function App() {
  return (
    <UserContextProvider>
      <CounterContextProvider>
        <CartContextProvider>
          <RouterProvider router={router} />
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "'Alexandria', sans-serif",
                fontWeight: 300,
                fontSize: "14px"
              },
            }}
          />
        </CartContextProvider>
      </CounterContextProvider>
    </UserContextProvider>
  );
}


export default App;
import "./assets/fonts/alexandria.css";
