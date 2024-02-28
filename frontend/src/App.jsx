import React from 'react';
import Registration from './components/Registration';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Course from './components/Course';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                    <Route path="/course/:id" element={<Course />} />
                    {/* Other routes */}
                </Routes>
            </main>
            <Footer />
        </Router>
    );
}

export default App;
