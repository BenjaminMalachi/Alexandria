import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './login.css'; // If you have additional styles

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
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
        <div className="min-h-screen flex justify-center items-center bg-marble">
            <form onSubmit={handleSubmit} className="p-10 bg-white rounded flex flex-col space-y-4">
                <h2 className="text-center text-2xl font-bold text-deepBrown">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <button type="submit" className="bg-sunset text-white p-2 rounded">Log In</button>
                <div className="text-center">
                    <Link to="/register" className="text-spinach hover:underline">Need an account?</Link>
                </div>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;
