import React from 'react';
import { useLocation } from 'react-router-dom';

export default function WhatsAppChat() {
    const location = useLocation();
    const hiddenFooterRoutes = [
      '/login',
      '/signup',
      '/register',
      '/ForgetPassword',
      '/PasswordReset',
      '/StaffLogin',
      '/AdminEditProducts',
      '/AdminDashboard',
      '/AdminAddProducts',
      '/AdminEditUsers',
      '/AdminEditCities',
      '/AdminEditTags',
      '/ProductsAnalysis',
      '/PromoCodesAnalysis',
      '/UsersAnalysis',
      '/AdminEditDeliveryBoys',
      '/AdminEditPromoCode',
      '/AdminEditCateg',
      '/OperationTeamDashboard',
      '/AdminEditStaff',
      '/AdminSalesDashboard',
      '/EditProduct', 
      '/AdminAddNewPr',
      '/staffLogin',
      '/AdminAddNewPromoCode',
      '/stafflogin',
      '/AdminEditBanners',
      '/ForgetPassVerifyOtp',
      
    ];
     // Don't show footer on these routes
     if (hiddenFooterRoutes.includes(location.pathname)) {
      return null;
    }
  const handleWhatsAppClick = () => {
    // Replace this number with your business WhatsApp number
    const phoneNumber = "+201201200016";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-[12%] lg:bottom-[5vh] right-4 bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
      aria-label="Chat with us"
    >
      <i className="fas fa-comments text-xl"></i>
    </button>
  );
}
