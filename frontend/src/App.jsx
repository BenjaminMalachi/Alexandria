import React from 'react';
import Registration from './components/Registration';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './App.css'

function App() {
    return (
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Other routes */}
                </Routes>
            </main>
            <Footer />
        </Router>
    );
}

export default App;
