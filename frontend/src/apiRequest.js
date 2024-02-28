async function apiRequest(url, options = {}) {
  // Retrieve the token from local storage
  const token = localStorage.getItem('token');

  // Ensure headers object exists
  options.headers = options.headers || {};

  if (token) {
    // Include the Authorization header with the token
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, options);

  // Check for unauthorized access (token expired or invalid)
  if (response.status === 401) {
    // Clear the stored token
    localStorage.removeItem('token');
    // Redirect to the login page or handle session expiration
    window.location.href = '/login';
    // Optionally, you can return or throw an error here
    return Promise.reject('Session expired. Please log in again.');
  }

  return response;
}

export default apiRequest;
