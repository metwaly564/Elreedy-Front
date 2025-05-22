/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import style from './Unauthorized.module.css'

export default function Unauthorized() {
  const navigate = useNavigate()

  useEffect(() => {
    // Use setTimeout to ensure navigation happens after component mount
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 0)

    return () => clearTimeout(timer)
  }, [navigate])

  return null
}
