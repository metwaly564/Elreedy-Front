import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function NotFound() {
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
    "/AdminAddNewPromoCode",
    "/stafflogin",
    "/AdminEditBanners",
    "/ForgetPassVerifyOtp",
  ];
  // Don't show footer on these routes
  if (hiddenFooterRoutes.includes(location.pathname)) {
    return null;
  }

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-4">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Redirecting to home page in 3 seconds...
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md transition duration-300"
        >
          Go to Home Now
        </button>
      </div>
    </div>
  );
}
