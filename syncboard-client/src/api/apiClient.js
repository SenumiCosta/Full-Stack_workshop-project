// Mock API client to simulate backend responses for UI-only MERN prototype
// This eliminates the need to install axios and runs entirely in the browser

const api = {
  post: async (url, data) => {
    // Simulate short network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (url === '/auth/login') {
      if (!data.email || !data.password) {
        throw { response: { data: { message: 'Email and password are required.' } } };
      }
      // Return a simulated success payload
      return {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            name: data.email.split('@')[0],
            email: data.email
          }
        }
      };
    }

    if (url === '/auth/register') {
      if (!data.name || !data.email || !data.password) {
        throw { response: { data: { message: 'All fields are required.' } } };
      }
      return {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            name: data.name,
            email: data.email
          }
        }
      };
    }

    throw { response: { data: { message: 'Endpoint not found' } } };
  }
};

export default api;