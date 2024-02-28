import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Add state for username
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    username, // Include username in the request body
                }),
            });
    
            if (!response.ok) {
                throw new Error('Registration failed');
            }
    
            // Redirect user to login page upon successful registration
            navigate('/'); 
        } catch (error) {
            console.error('An error occurred during registration:', error);
            // Optionally, update your UI to show an error message
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-marble">
            <form onSubmit={handleSubmit} className="p-10 bg-white rounded flex flex-col space-y-4">
                <h2 className="text-center text-2xl font-bold text-deepBrown">Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
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
                <button type="submit" className="bg-sunset text-white p-2 rounded">Register</button>
                <div className="text-center">
                    <Link to="/" className="text-deepBrown hover:text-sunset">Already have an account? Log in</Link>
                </div>
            </form>
        </div>
    );
}

export default Registration;
