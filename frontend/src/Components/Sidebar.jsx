import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import logoimage from './img/logo final.png';
import { GoHomeFill } from "react-icons/go";
import { FaRegFileLines } from "react-icons/fa6";
import { PiSquaresFourBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 480);
  };

  useEffect(() => {
    handleResize(); // Check initially
    window.addEventListener('resize', handleResize); // Add listener
    return () => window.removeEventListener('resize', handleResize); // Clean up
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <div className={`s-full ${isMobile && !isOpen ? 'closed' : 'open'}`}>
        <div className='s-top'>
          <img src={logoimage} height={150} width={220} style={{ marginLeft: -10 }} alt="Logo" />
        </div>
        <div className='s-middle'>
          <Link className='nav-link' to={'/home'}><GoHomeFill /> <span>Home</span></Link>
          <Link className='nav-link' to={'/post'}><FaRegFileLines /> <span>Post</span></Link>
          <Link className='nav-link' to={'/categories'}><PiSquaresFourBold /> <span>Categories</span></Link>
          <Link className='nav-link' to={'/profile'}><CgProfile /> <span>Profile</span></Link>
          <Link className='nav-link' to={'/chat'}><IoChatbubbleEllipses /> <span>Chat Section</span></Link>
        </div>
        <div className='s-bottom'>
          <button className='logout-btn' onClick={handleLogout}>LOG OUT</button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
