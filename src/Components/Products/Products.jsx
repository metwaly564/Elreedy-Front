/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import style from "./Products.module.css";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import useProducts from "../../Hooks/useProducts";

export default function RecentProducts() {
  // function getproducts() {
  //   return axios.get(`https://ecommerce. routemisr.com/api/v1/products`);
  // }
let {data,isError,error,isLoading} = useProducts();

  // let { data, isError, error, isLoading } = useQuery({
  //   queryKey: ["recentproducts"],
  //   queryFn: getproducts, //function send request
  //   staleTime: 7000,
  //   // retry:4,
  //   // retryDelay:3000,
  //   // refetchInterval:30000,
  //   // refetchIntervalInBackground:true,
  //   // refetchOnWindowFocus:false
  // });

  if (isError) {
    return <div>{error}</div>;
  }
  if (isLoading) {
    return <div className="spinner p-8 top-10"></div>;
  }
  // const [Products, setProducts] = useState([]);
  // function getproducts() {
  //   axios
  //     .get(`https://ecommerce.routemisr.com/api/v1/products`)
  //     .then((res) => {
  //       console.log(res.data.data);
  //       setProducts(res.data.data);
  //     })
  //     .catch((res) => {
  //       console.log(res.data.data);
  //     });
  // }
  // useEffect(() => {
  //   getproducts();
  // }, []);
  return (
    <>
      <div className="row">
        {data?.data?.data.map((Product) => (
          <div key={Product.id} className="w-1/5 p-1">
            <div className="product">
              <Link
                to={`Productdetails/${Product.id}/${Product.category.name}`}
              >
                <img src={Product.imageCover} className="w-full p-3" alt="" />
                <h3 className="ml-4 text-red-500 text-left">
                  {Product.category.name}
                </h3>
                <h3 className="ml-4 font-semibold mb-1 text-left">
                  {Product.title.split(" ").slice(0, 2).join(" ")}
                </h3>
                <div className="flex justify-between p-4">
                  <span>{Product.price} EGP</span>
                  <span>
                    <i className="fas fa-star text-yellow-400"></i>
                    {Product.ratingsAverage}
                  </span>
                </div>
              </Link>

              <button className="btn bg-red-400 p-2 text-white rounded-xl translate-y-[100%] opacity-0">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
