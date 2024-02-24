async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
  
    if (response.status === 401) {
      // Token has expired or is invalid
      localStorage.removeItem('token'); // Clear the stored token
      window.location.href = '/login'; // Redirect to login page
      return Promise.reject('Session expired. Please log in again.');
    }
  
    return response;
  }
  
  export default apiRequest;
  