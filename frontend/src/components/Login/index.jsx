import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './login.css'; // If you have additional styles
import dunes from '../../assets/dunes.jpg';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            if (!response.ok) {
                throw new Error('Login failed');
            }
    
            // Use .text() instead of .json() if the response is plain text
            const token = await response.text(); 
            console.log(token); // Log the raw token to debug
    
            // Assuming the backend sends a token directly in the response body:
            localStorage.setItem('token', token); // Save the token to localStorage
    
            navigate('/dashboard'); // Navigate upon successful login
        } catch (error) {
            console.error('An error occurred during login:', error);
            // Optionally, update your UI to inform the user of the login failure
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('sessionExpired') === 'true') {
          setMessage('Your session has expired. Please log in again.');
        }
      }, [location]);

    return (
        <div className="min-h-screen flex">
            {/* Left side with the image */}
            <div
                className="w-3/4"
                style={{
                backgroundImage: `url(${dunes})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                }}
            >
                {/* You can leave this div empty or add content that overlays the image */}
            </div>

            {/* Right Side - Form Container */}
            <div className="w-1/4 flex justify-center items-center bg-marble">
                <form onSubmit={handleSubmit} className="p-10 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-deep-brown mb-8">Login</h2>
                {message && <p className="text-sunset-red mb-4">{message}</p>}
                <div className="flex flex-col space-y-4">
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full max-w-xs"
                    />
                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full max-w-xs"
                    />
                    <button type="submit" className="btn btn-primary bg-sunset-red text-white">Log In</button>
                </div>
                <div className="text-center mt-4">
                    <Link to="/register" className="link link-hover text-deep-green">Need an account?</Link>
                </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
