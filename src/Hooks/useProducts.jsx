/* eslint-disable no-unused-vars */
import axios from 'axios';
import React from 'react'
import { useQuery } from 'react-query';
import { QueryClientProvider, useQueryClient } from "react-query";

export default function useProducts() {
  


  function getproducts() {
    return axios.get(`https://ecommerce.routemisr.com/api/v1/products`);
  }

  let productInfo = useQuery({
    queryKey: ["recentproducts"],
    queryFn: getproducts, //function send request
    staleTime: 7000,
    // retry:4,
    // retryDelay:3000,
    // refetchInterval:30000,
    // refetchIntervalInBackground:true,
    // refetchOnWindowFocus:false
    // gcTime:400
    // select:(data)=>data.data.data.filter((product)=>)
  });


  
return productInfo



}
