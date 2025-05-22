/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import style from "./Home.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import RecentProducts from "../RecentProducts/RecentProducts";
import CategorisSlider from "../CategorisSlider/CategorisSlider";
import MainSlider from "../MainSlider/MainSlider";
import Navbar from "../navbar/navbar";
import Footer from "../Footer/Footer";

export default function Home() {
  let [products, setproducts] = useState([]);

  async function getProducts() {
    let { data } = await axios.get(
      `https://ecommerce.routemisr.com/api/v1/products`
    );
    setproducts(data.data);
  }
  useEffect(() => {
    getProducts();
  }, []);
  return (
    <>
    <div className="bg-gray-100">
      <MainSlider />
      <CategorisSlider />
      <RecentProducts />
    </div>
    </>
  );
}


