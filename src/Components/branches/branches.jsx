/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { UserContext } from '../../Context/UserContext';
import style from './Branches.module.css';

export default function Branches() {
  const { isArabic } = useContext(UserContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const branches = [
    {
      name: isArabic ? 'فرع شارع ناصر' : 'Nasser Street Branch',
      mapLink: 'https://maps.app.goo.gl/sP8RnKz1tUSHhgM69?g_st=com.google.maps.preview.copy',
    },
    {
      name: isArabic ? 'فرع شارع المحافظة' : 'Governorate Street Branch',
      mapLink: 'https://maps.app.goo.gl/LieR9euKj9asHPCn6?g_st=com.google.maps.preview.copy',
    },
    {
      name: isArabic ? 'فرع الأربعين' : 'Arbaeen Branch',
      mapLink: 'https://maps.app.goo.gl/YRScwwuZdZwZaJ2F8?g_st=com.google.maps.preview.copy',
    },
    {
      name: isArabic ? 'فرع الفرز - المستشفى العام' : 'Farz Branch - General Hospital',
      mapLink: 'https://maps.app.goo.gl/uhvGpXZwLn3KyPki6?g_st=com.google.maps.preview.copy',
    },
    {
      name: isArabic ? 'فرع السلام' : 'Salam Branch',
      mapLink: '#',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-40 md:pt-24" style={{ fontFamily: "'Alexandria', sans-serif" }}>
      <div className={`max-w-7xl mx-auto ${isArabic ? 'text-right' : 'text-left'}`}>
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-red-950 mb-4 py-1" style={{ fontFamily: "'Alexandria', sans-serif" }}>
            {isArabic ? 'فروعنا' : 'Our Branches'}
          </h1>
          <p className="text-gray-600 text-lg font-alexandria font-light " style={{ fontFamily: "'Alexandria', sans-serif" }}>
            {isArabic ? 'اكتشف أقرب فرع إليك' : 'Find the nearest branch to you'}
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-8 ${isArabic ? 'grid-flow-row-dense' : ''}`} style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
          {branches.map((branch, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 mb-2 border border-gray-200"
            >
              <div className={`p-6 ${isArabic ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-semibold text-red-950 mb-4" style={{ fontFamily: "'Alexandria', sans-serif" }}>
                  {branch.name}
                 
                </h3>
                
                <div className={`space-y-4 flex ${isArabic ? "justify-start" : "justify-start"}`}>
                  <a 
                    href={branch.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center text-gray-600 hover:text-red-600 transition-colors duration-300 ${isArabic ? 'justify-end' : 'justify-start'}`}
                  >
                    <span style={{ fontFamily: isArabic ? "'Alexandria', sans-serif" : "inherit", fontWeight: "300" }} className="text-right">
                      {isArabic ? 'عرض على الخريطة' : 'View on Map'}
                    </span>
                    <FaMapMarkerAlt className={`${isArabic ? 'mr-2' : 'ml-2'} text-red-950`} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
