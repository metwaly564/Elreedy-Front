/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import style from "./Brands.module.css";
import axios from "axios";
export default function Categories() {
  const [Brands, setBrands] = useState();

  async function GetBrands() {

    let response = await axios.get(`https://ecommerce.routemisr.com/api/v1/brands`)
    console.log(response.data.data);
    setBrands(response.data.data)
  }
  useEffect(()=>{
    GetBrands();
  },[])

if (Brands == null)
  {
    return <div className="spinner p-8 top-10"></div>
  }

  return (
    <>
  
  <div className="container mx-auto">
    <table className="w-full ml-8 bg-white shadow-md rounded-lg overflow-hidden">
      
      <tbody>
        {Brands?.map((brand)=>(
          <>
          <tr className="border-b hover:bg-gray-50">
          <td className=" font-semibold py-4 px-6 ml-10 ">{brand.name}</td>
          <td className="py-4 px-6">
            <img src={brand.image} alt="Electronics" className="w-1/3 object-cover rounded"></img> 
          </td>
        </tr>
          </>
        ))}
      </tbody>
    </table>
  </div>
  </>
  )
}
