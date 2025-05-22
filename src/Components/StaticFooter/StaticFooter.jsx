import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPhone, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { UserContext } from '../../Context/UserContext';

export default function StaticFooter() {
  const location = useLocation();
  const { isArabic } = useContext(UserContext);
  const [categories, setCategories] = useState([]);

  const hiddenFooterRoutes = [
    '/login', '/signup', '/register', '/ForgetPassword', '/PasswordReset', '/StaffLogin', 
    '/AdminEditProducts', '/AdminDashboard', '/AdminAddProducts', '/AdminEditUsers', 
    '/AdminEditCities', '/AdminEditTags', '/ProductsAnalysis', '/PromoCodesAnalysis', 
    '/UsersAnalysis', '/AdminEditDeliveryBoys', '/AdminEditPromoCode', '/AdminEditCateg', 
    '/OperationTeamDashboard', '/AdminEditStaff', '/AdminSalesDashboard', '/EditProduct', 
    '/AdminAddNewPr', '/staffLogin', '/AdminAddNewPromoCode', '/stafflogin', 
    '/AdminEditBanners', '/ForgetPassVerifyOtp',
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/categories');
        const data = await response.json();
        // Filter categories that should be visible in navbar and not hidden
        const visibleCategories = data.filter(cat => cat.isInNavbar && !cat.ishidden);
        // Sort by rank
        visibleCategories.sort((a, b) => a.rank - b.rank);
        setCategories(visibleCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  if (hiddenFooterRoutes.includes(location.pathname)) return null;

  return (
    <>
    <footer className="bg-red-950 text-white w-full px-4 py-6" style={{ fontFamily: "'Alexandria', sans-serif" }}>
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex flex-col space-y-4">
          {/* Get In Touch Section */}
          <details className={`group cursor-pointer ${isArabic?"text-right":"text-left"} transition-all duration-300 `}>
            <summary className={`flex ${isArabic ? "" : "flex-row-reverse"} items-center justify-between font-medium text-right transition-all duration-300`}>
              <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
              <span className="text-lg transition-all duration-300">{isArabic ? 'تواصل معنا' : 'Get In Touch'}</span>
            </summary>
            <div className={`mt-3 text-right flex flex-col hover:text-red-400 ${isArabic?"items-end":"items-start"} `}>
              <Link to="/branches" className="mb-2 hover:text-red-400 text-base font-light">{isArabic ? 'فروعنا' : 'Branches'}</Link>
              <div className={`flex ${isArabic?"":"flex-row-reverse"} items-center justify-end mb-2 text-base font-light transition-all duration-300`}>
                <a href="tel:+201201200016" className={`hover:text-red-400 transition`}>01201200016</a>
                <FaPhone className="mx-1 text-white rotate-90" size={15} />
              </div>
              <div className="hidden lg:flex justify-end space-x-3 mt-3">
                <a href="https://www.facebook.com/share/1HtdV2U3sX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaFacebook size={20} /></a>
                <a href="https://www.instagram.com/reedy_pharmacy/profilecard/?igsh=MWx5aHJsZXRpOTdubg==" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaInstagram size={20} /></a>
                <a href="https://www.tiktok.com/@reedy_pharmacy?_t=ZS-8wKDx2Qfrai&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaTiktok size={20} /></a>
                <a href="https://wa.me/201201200016" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaWhatsapp size={20} /></a>
              </div>
            </div>
          </details>

          {/* Categories Section */}
          <details className="group cursor-pointer">
            <summary className={`flex ${isArabic ? "" : "flex-row-reverse"} items-center justify-between font-medium text-right`}>
              <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
              <span className="text-lg">{isArabic ? 'الفئات' : 'Categories'}</span>
            </summary>
            <div className="mt-3 text-right">
              <ul className={`space-y-2 grid grid-cols-3 items-center justify-center text-base font-light ${isArabic?"text-right":"text-left"}`}>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/category/${category.id}`} className="hover:text-red-400 transition block">
                      {isArabic ? category.nameAr : category.nameEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {/* Policies & Support Section */}
          <details className="group cursor-pointer">
            <summary className={`flex ${isArabic ? "" : "flex-row-reverse"} items-center justify-between font-medium text-right`}>
              <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
              <span className="text-lg">{isArabic ? 'السياسات والدعم' : 'Policies & Support'}</span>
            </summary>
            <div className="mt-3 text-right">
              <ul className={`space-y-2 text-base font-light ${isArabic?"text-right":"text-left"}`}>
                <li>
                  <Link to="/returns" className="hover:text-red-400 transition block">
                    {isArabic ? 'المرتجعات والمبالغ المستردة' : 'Returns and refunds'}
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-red-400 transition block">
                    {isArabic ? 'الشحن والتوصيل' : 'Shipping and delivery'}
                  </Link>
                </li>
              </ul>
            </div>
          </details>

          {/* Track Order Section */}
          <details className="group cursor-pointer">
            <summary className={`flex ${isArabic ? "" : "flex-row-reverse"} items-center justify-between font-medium text-right`}>
              <span className="text-lg transition-transform duration-300 group-open:rotate-45">+</span>
              <span className="text-lg">{isArabic ? 'تتبع الطلب' : 'Track Order'}</span>
            </summary>
            <div className={`mt-3 ${isArabic?"text-right":"text-left"}`}>
              <Link 
                to="/track-order" 
                className={`inline-block text-white px-4 py-2 rounded transition text-base`}
                style={{fontFamily: "'Alexandria', sans-serif"}}
              >
                {isArabic ? 'تتبع الآن' : 'Track Now'}
              </Link>
            </div>
          </details>
        </div>
      </div>

      {/* Desktop View */}
      <div className={`hidden md:flex w-full justify-between gap-8 ${isArabic?"flex-row-reverse":""}`}>
        {/* Get In Touch Section */}
        <div className={`flex-1 ${isArabic?"text-right":""} `}>
          <h3 className="text-lg font-bold mb-1 ">
            <span className="inline-block border-b-2 border-blue-900 ">
              {isArabic ? 'تواصل معنا' : 'Get In Touch'}
            </span>
          </h3>
          <Link to="/branches" className={`mb-2 ${isArabic?"text-right":""} hover:text-red-400  text-base font-light transition-all duration-300`}>{isArabic ? 'فروعنا' : 'Branches'}</Link>
          <div className={`flex ${isArabic?"text-right justify-end":"flex-row-reverse justify-end"}  items-center mb-2 text-base font-light`}>
            <a href="tel:+201201200016" className={`hover:text-red-400 transition`}>01201200016</a>
            <FaPhone className="ml-1 text-white rotate-90" size={14} />
          </div>
          <div className={`flex space-x-3 mt-3 ${isArabic?"text-right justify-end":""}`}>
            <a href="https://www.facebook.com/share/1HtdV2U3sX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaFacebook size={25} /></a>
            <a href="https://www.instagram.com/reedy_pharmacy/profilecard/?igsh=MWx5aHJsZXRpOTdubg==" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaInstagram size={25} /></a>
            <a href="https://www.tiktok.com/@reedy_pharmacy?_t=ZS-8wKDx2Qfrai&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaTiktok size={25} /></a>
            <a href="https://wa.me/201201200016" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaWhatsapp size={25} /></a>
          </div>
        </div>

        {/* Categories Section */}
        <div className={`flex-1 ${isArabic?"text-right":""}`}>
          <h3 className="text-lg font-bold mb-1">
            <span className="inline-block border-b-2 border-blue-900">
              {isArabic ? 'الفئات' : 'Categories'}
            </span>
          </h3>
          <ul className="space-y-1 grid grid-cols-2 text-base font-light justify-center items-center">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/categoryDetails/${category.id}`} className="hover:text-red-400 transition block">
                  {isArabic ? category.nameAr : category.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies & Support Section */}
        <div className={`flex-1 ${isArabic?"text-right":""}`}>
          <h3 className="text-lg font-bold mb-1">
            <span className="inline-block border-b-2 border-blue-900">
              {isArabic ? 'السياسات والدعم' : 'Policies & Support'}
            </span>
          </h3>
          <ul className="space-y-2 text-base font-light">
            <li>
              <Link to="/returns" className="hover:text-red-400 transition block">
                {isArabic ? 'المرتجعات والمبالغ المستردة' : 'Returns and refunds'}
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-red-400 transition block">
                {isArabic ? 'الشحن والتوصيل' : 'Shipping and delivery'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Track Order Section */}
        <div className={`flex-1 ${isArabic?"text-right":""}`}>
          <h3 className="text-lg font-bold mb-1">
            <span className="inline-block border-b-2 border-blue-900 ">
              {isArabic ? 'تتبع الطلب' : 'Track Order'}
            </span>
          </h3>
          <Link 
            to="/track-order" 
            className="inline-block font-[300] hover:text-red-400 text-white px-4 py-2 rounded transition text-base"
          >
            {isArabic ? 'تتبع الآن' : 'Track Now'}
          </Link>
        </div>
      </div>
      <div className="flex sm:hidden justify-center space-x-3 mt-3">
                <a href="https://www.facebook.com/share/1HtdV2U3sX/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaFacebook size={25} /></a>
                <a href="https://www.instagram.com/reedy_pharmacy/profilecard/?igsh=MWx5aHJsZXRpOTdubg==" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaInstagram size={25} /></a>
                <a href="https://www.tiktok.com/@reedy_pharmacy?_t=ZS-8wKDx2Qfrai&_r=1" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaTiktok size={25} /></a>
                <a href="https://wa.me/201201200016" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition"><FaWhatsapp size={25} /></a>
              </div>
      {/* Copyright Section */}
      <div className="mt-6 pt-4 mb-20 sm:-mb-2  text-center text-sm text-gray-400 font-light hover:text-red-100 transition-all duration-300">
        <p className=' text-[12px] lg:text-base'>&copy; {new Date().getFullYear()} {isArabic ? 'جميع الحقوق محفوظة لصيدليات الريدي' : 'All rights Reserved for Elreedy Pharmacies'}</p>
      </div>
      {/* <div className='text-center text-sm text-gray-400 font-light mb-14 mt-2 sm:mb-2 sm:mt-7'> Devloped by <a className='hover:text-red-400 transition' target='_blank' href='https://www.linkedin.com/in/mohamed-metwaly-abdelaziz/'>{`<Mohamed/>`}</a> <a className='hover:text-red-400 transition'  target='_blank' href='https://www.linkedin.com/in/yousef-hannora/' >{`<Youssef/>`}</a> </div> */}
    </footer>
    </>
  );
}