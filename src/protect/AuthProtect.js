import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

function AuthProtect() {

    const currentUser = useSelector((state) => state.auth.token);

  return (
   currentUser? <Outlet/>:<Navigate to='/login'></Navigate>
  )
}

export default AuthProtect