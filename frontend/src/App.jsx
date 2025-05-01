

//////current 

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Post from './Components/Post';
import Home from './Components/Home';
import './App.css';
import Categories from './Components/Categories';
import Profile from './Components/Profile';
import Login from './Components/Login';
import Signup from './Components/Signup';
import EditPost from './Components/Editpost';
import CategoryPage from './Components/CategoriesPost';
import Chat from'./Components/Chat'
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import Admin from './Components/Admin';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false); // Done checking auth
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or a spinner if you want
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes (no layout) */}
        <Route path="/" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/admin" element={<Admin />} />
        {/* Protected Layout Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="main">
                <Sidebar setIsAuthenticated={setIsAuthenticated} />
                <Navbar setSearchQuery={setSearchQuery} setStatusFilter={setStatusFilter} statusFilter={statusFilter} />
                <div className="change">
                  <Routes>
                    <Route path="/home" element={<Home searchQuery={searchQuery} statusFilter={statusFilter} />} />
                    <Route path="/post" element={<Post />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:category" element={<CategoryPage searchQuery={searchQuery} statusFilter={statusFilter} />} />
                    <Route path="/profile" element={<Profile searchQuery={searchQuery} statusFilter={statusFilter} />} />
                    <Route path="/edit-post/:postId" element={<EditPost />} />
                    <Route path="/chat/:userIdc" element={<Chat searchQuery={searchQuery}/>} />
                    <Route path="/chat" element={<Chat searchQuery={searchQuery}/>} />
                    <Route path="*" element={<Navigate to="/home" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;




