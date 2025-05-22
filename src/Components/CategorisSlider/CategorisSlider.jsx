import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import style from "./CategorisSlider.module.css";
import { UserContext } from "../../Context/UserContext";

export default function CategorisSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  let {isArabic} = useContext(UserContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/v1/banners/banner');
        // Filter banners to include type "middle" and sort by rank
        const middleBanners = response.data
          .filter(banner => banner.type === "middle")
          .sort((b, a) => {
            // First sort by rank
            if ((a.rank || 0) !== (b.rank || 0)) {
              return (a.rank || 0) - (b.rank || 0);
            }
            // If ranks are equal, sort by ID to maintain consistent order
            return a.id - b.id;
          });

        // Apply language-specific ordering
        const orderedBanners = isArabic ? middleBanners.reverse() : middleBanners.reverse();

        // Separate mobile and desktop logic
        let displayBanners;
        if (isMobile) {
          // Mobile view - show banners with ranks 1,2,3 and reverse for Arabic
          const mobileBanners = middleBanners.slice(0, 3);
          displayBanners = isArabic ? [...mobileBanners].reverse() : mobileBanners;
        } else {
          // Desktop view - use the original language-specific ordering
          displayBanners = orderedBanners;
        }

        console.log('Mobile banners:', displayBanners.map(b => ({ rank: b.rank })));
        setBanners(displayBanners);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchBanners();
  }, [isMobile, isArabic]);

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (!banners || banners.length === 0) {
    return <div className="text-center py-8">No middle banners available</div>;
  }

  return (
    <div className="px-5 mt-[30px] overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(() => {
          // Group banners into rows of 3
          const rows = [];
          for (let i = 0; i < banners.length; i += 3) {
            const row = banners.slice(i, i + 3);
            // Reverse the row if Arabic
            rows.push(isArabic ? [...row].reverse() : row);
          }
          // Flatten the rows back into a single array
          return rows.flat().map((banner) => (
            <div 
              key={banner.id} 
              className="w-full transition-transform duration-300 hover:scale-105 overflow-hidden"
            >
              <Link 
                to={banner.linkUrl || "#"} 
                target={banner.linkUrl?.startsWith('http') ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={banner.imageUrl}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                  alt={`Banner ${banner.id}`}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Banner+Image';
                  }}
                />
              </Link>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}