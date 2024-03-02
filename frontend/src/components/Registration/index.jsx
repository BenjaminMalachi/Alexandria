import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from '../Header';
import dunes from '../../assets/dunes.jpg';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // Add state for username
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
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
        <>
        <Header />
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
                    <h2 className="text-3xl font-bold text-deep-brown mb-8">Register</h2>
                    <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input input-bordered w-full max-w-xs"
                    />
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
                    <button type="submit" className="btn btn-primary bg-sunset-red text-white">Register</button>
                    <div className="text-center">
                        <Link to="/" className="link link-hover text-deep-green">Already have an account? Log in</Link>
                    </div>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
}

export default Registration;
