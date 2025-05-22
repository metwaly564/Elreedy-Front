/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import MultiRangeSlider from '../multiRangeSlider/multiRangeSlider';
import Navbar from '../navbar/navbar';
 // Adjust path

function ParentComponent() {
  const [range, setRange] = useState({ min: 20, max: 80 });

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    console.log('Range changed:', newRange); // For debugging
  };

  return (
    <>

    <div className='absolute flex flex-col w-full left-[0%] top-[-12%]'>
      <MultiRangeSlider
        min={0}
        max={100}
        onChange={handleRangeChange} // Pass the function here
        />
      <div className='text-red-700 text-[4em] scale-x-[7] absolute xl:left-[7.7em] left-[190px] top-[36%] '>-</div>
      <p className='bg-red-700 relative w-full text-center rtl relative left-[1%] bottom-[13.5em]' >
          {range.min}EGP - {range.max}EGP
      </p>
    </div>
        </>
  );
}

export default ParentComponent;