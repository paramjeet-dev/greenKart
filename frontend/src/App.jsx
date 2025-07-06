import { useState } from 'react'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import HomePage from './pages/Home'
import UserDashboard from './pages/UserDashboard'
import NgoDashboard from './pages/NgoDashboard'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import ListingDetails from './pages/ListingDetails'
import ExploreListings from './pages/ExploreListings'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const router = createBrowserRouter([
    {
      path:'/',
      element:<HomePage/>
    },
    {
      path:'/login',
      element:<LoginPage/>
    },
    {
      path:'/signup',
      element:<SignupPage/>
    },
    {
      path:'/dashboard',
      element:<UserDashboard/>
    },
    {
      path:'/ngo_dashboard',
      element:<NgoDashboard/>
    },
    {
      path:'/admin_dashboard',
      element:<AdminDashboard/>
    },
    {
      path:'/details/:id',
      element:<ListingDetails/>
    },
    {
      path:"/listings",
      element:<ExploreListings/>
    }
  ])

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
