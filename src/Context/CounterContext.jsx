/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { createContext, useState } from "react";

export let CounterContext = createContext();

export default function CounterContextProvider(props)
{
    const [minSearch, setminSearch] = useState();
    const [maxSearch, setmaxSearch] = useState();


    return <CounterContext.Provider value={{minSearch,setminSearch,maxSearch,setmaxSearch}}>
            {props.children}
    </CounterContext.Provider>
}