import React from 'react'
import './Mainpage.css'
import Post from './Post'
import Home from './Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';

const Mainpage = () => {
  return (
    <div className='change'>
      <BrowserRouter>
        <Sidebar />  {/* Ensure Sidebar is rendered */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/post' element={<Post />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Mainpage;
