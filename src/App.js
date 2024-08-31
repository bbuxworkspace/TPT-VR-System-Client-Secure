import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateOutlet from "./utils/PrivateOutlet";
import { connect } from "react-redux";
import { getRefreshToken } from "./actions/Auth.action";
import setAuthToken from "./utils/setAuthToken";
import { ThemeProvider } from "styled-components";
import theme from "./utils/theme";

import './App.css';
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./views/LoginPage/LoginPage";
import SignupPage from "./views/SignupPage/SignupPage";
import DashboardPage from "./views/DashboardPage/DashboardPage";
import Hall from './views/hall';
import Room from './views/room';

function App({ getRefreshToken }) {
  useEffect(() => {
    if (localStorage.getItem("token_book")) {
      setAuthToken(localStorage.getItem("token_book"));
    }
    getRefreshToken();
  }, [getRefreshToken]);

  return (
    <>
      <ToastContainer newestOnTop theme="dark" />
      <ThemeProvider theme={theme}>
      <BrowserRouter>
      <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            zIndex: 5,
            width: 100
          }}
        >

        </div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/hall" element={<Hall />} />
          <Route path="/room" element={<Room />} />

          {/* Add other routes as needed */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    </>
    
  );
}

export default connect(null, { getRefreshToken })(App);