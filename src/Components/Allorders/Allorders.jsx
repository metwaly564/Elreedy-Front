/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import style from './Allorders.module.css'
import { useContext } from 'react'
import { CartContext } from '../../Context/CartContexrt'

export default function Allorders() {

  let {GetAllorders} = useContext(CartContext)
  let {CartId} = useContext(CartContext)

 async function GetOrders(id)
  {
    let response = await GetAllorders (id)
    console.log(response);
  }

  return (
    <h1>Allorders</h1>
  )
}
