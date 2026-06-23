// config/api.js
const API_BASE_URL = 'https://travelblog-server.vercel.app' || 'http://localhost:5000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  REFRESH_TOKEN: '/api/refresh-token',
  LOGOUT: '/api/logout',
  BLOGS: '/api/blogs',
  BLOG: (id) => `/api/blogs/${id}`,
  HEALTH: '/',
};

// Helper functions
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getFormDataHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  // DO NOT set Content-Type for FormData - browser will set it with boundary
});

// Fetch wrapper with error handling
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    console.log(`🌐 Fetching: ${url}`);
    console.log('📦 Options:', options);

    // For FormData, let browser set Content-Type
    const isFormData = options.body instanceof FormData;
    
    const fetchOptions = {
      ...options,
      headers: {
        ...(isFormData ? {} : API_CONFIG.headers),
        ...options.headers,
      },
    };

    // Remove Content-Type for FormData
    if (isFormData) {
      delete fetchOptions.headers['Content-Type'];
    }

    console.log('📤 Sending request with:', {
      method: fetchOptions.method,
      isFormData,
      hasFile: isFormData ? options.body.has('image') : false,
    });

    const response = await fetch(url, fetchOptions);

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers));

    // Clone response for error handling
    const clonedResponse = response.clone();
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await clonedResponse.json();
        errorMessage = errorData.error || errorData.message || `API Error: ${response.status}`;
        console.error('❌ API Error Response:', errorData);
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const text = await clonedResponse.text();
          console.error('❌ API Error Text:', text);
          errorMessage = text || `API Error: ${response.status}`;
        } catch {
          errorMessage = `API Error: ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API Fetch Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: (email, password) => {
    console.log('🔐 Attempting login for:', email);
    return apiFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: (username, email, password) =>
    apiFetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    }),
  
  refreshToken: (refreshToken) =>
    apiFetch(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    }),
  
  logout: (token) =>
    apiFetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders(token),
    }),
};

// Blog API calls
export const blogAPI = {
  getAll: () => {
    console.log('📚 Fetching all blogs');
    return apiFetch(API_ENDPOINTS.BLOGS);
  },
  
  getById: (id) => {
    console.log(`📚 Fetching blog: ${id}`);
    return apiFetch(API_ENDPOINTS.BLOG(id));
  },
  
  create: (data, image, token) => {
    console.log('📝 Creating blog with data:', data);
    console.log('📎 Image:', image ? image.name : 'No image');
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`📦 FormData: ${key} =`, value instanceof File ? `File: ${value.name}` : value);
    }
    
    return apiFetch(API_ENDPOINTS.BLOGS, {
      method: 'POST',
      headers: getFormDataHeaders(token),
      body: formData,
    });
  },
  
  update: (id, data, image, token) => {
    console.log(`📝 Updating blog ${id}:`, data);
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return apiFetch(API_ENDPOINTS.BLOG(id), {
      method: 'PUT',
      headers: getFormDataHeaders(token),
      body: formData,
    });
  },
  
  delete: (id, token) => {
    console.log(`🗑️ Deleting blog: ${id}`);
    return apiFetch(API_ENDPOINTS.BLOG(id), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  },
};