import React, { useState, useEffect } from 'react';
import styles from './MainSlider.module.css';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function MainSlider() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const responsive = {
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
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://127.0.0.1:3000/api/v1/banners/banner');
        const sliderBanners = response.data.filter(banner => banner.type === "slider");
        setBanners(sliderBanners);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        toast.error('Failed to load banners');
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full relative mt-[200px] sm:mt-[180px] md:mt-[160px] lg:mt-[120px]">
        <div className="w-full text-center py-8">Loading banners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative mt-[200px] sm:mt-[180px] md:mt-[160px] lg:mt-[120px]">
        <div className="w-full text-center py-8 text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full relative mt-[200px] sm:mt-[180px] md:mt-[160px] lg:mt-[120px]">
        <div className="w-full text-center py-8">No slider banners available</div>
      </div>
    );
  }

  return (
    <div className="w-full relative mt-[90px] sm:mt-[110px] md:mt-[130px] lg:mt-[50px]">
      <div className="w-screen -mx-[calc((100vw-100%)/2)] group">
        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={2000}
          showDots={true}
          arrows={true}
          rtl={false} // Changed this back to false
          containerClass={styles.carouselContainer}
          dotListClass={styles.dotList}
          customLeftArrow={
            <button className="absolute left-2 sm:left-4 bg-black hover:bg-black p-1 sm:p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[55%] sm:top-[45%]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          customRightArrow={
            <button className="absolute right-2 sm:right-4 bg-black hover:bg-black p-1 sm:p-2 rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-[55%] sm:top-[45%]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          }
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full pt-2">
              <div className="relative w-full pb-[35.25%] mt-8 mb-[-9px]">
                <img 
                  src={banner.imageUrl} 
                  className="absolute inset-0 w-full h-full object-contain" 
                  alt={`Banner ${banner.rank}`} 
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Image+Not+Found';
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}