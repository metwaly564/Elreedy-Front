/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import style from "./Categories.module.css";
import axios from "axios";
export default function Categories() {
  const [Categories, setCategories] = useState();

  async function GetCategories() {

    let response = await axios.get(`https://ecommerce.routemisr.com/api/v1/categories`)
    console.log(response.data.data);
    setCategories(response.data.data)
  }
  useEffect(()=>{
    GetCategories();
  },[])

if (Categories == null)
  {
    return <div className="spinner p-8 top-10"></div>
  }

  return (
    <>
  
  <div className="container mx-auto">
    <table className="w-full ml-8 bg-white shadow-md rounded-lg overflow-hidden">
      
      <tbody>
        {Categories?.map((cat)=>(
          <>
          <tr className="border-b hover:bg-gray-50">
          <td className=" font-semibold py-4 px-6 ml-10 ">{cat.name}</td>
          <td className="py-4 px-6">
            <img src={cat.image} alt="Electronics" className="w-1/3 h-40 object-cover rounded"></img> 
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
