/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useEffect, useState } from "react";

export let UserContext = createContext();
export default function UserContextProvider(props) {
  const [userlogin, setuserlogin] = useState(localStorage.getItem("userToken") ? localStorage.getItem("userToken") : null);
  const [searchkey, setsearchkey] = useState();
  const [SearchResult, setSearchResult] = useState();
  const [TempPhone, setTempPhone] = useState();
  const [TempOtp, setTempOtp] = useState();
  const [TempSkuID, setTempSkuID] = useState();
  const [TempTagData, setTempTagData] = useState();
  const [TempCatData, setTempCatData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isArabic, setisArabic] = useState(true);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      setuserlogin(localStorage.getItem("userToken"));
    }
  }, [refreshTrigger]);

  return (
    <UserContext.Provider value={{
      userlogin, setuserlogin,
      searchkey, setsearchkey,
      SearchResult, setSearchResult,
      TempPhone, setTempPhone,
      TempOtp, setTempOtp,
      TempSkuID, setTempSkuID,
      TempTagData, setTempTagData,
      TempCatData, setTempCatData,
      triggerRefresh,
      refreshTrigger, setRefreshTrigger,
      isArabic, setisArabic

    }}>
      {props.children}
    </UserContext.Provider>
  );
}