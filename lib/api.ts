/**
 * API Client for RiverWatch
 * Configure your backend API URL here
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Authentication APIs
 */
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiCall('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },
};

/**
 * User Management APIs
 */
export const userAPI = {
  getAll: async () => {
    return apiCall('/users', {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/users/${id}`, {
      method: 'GET',
    });
  },

  create: async (userData: any) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: any) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * River Management APIs
 */
export const riverAPI = {
  getAll: async () => {
    return apiCall('/rivers', {
      method: 'GET',
    });
  },
  getPaged: async (pageNumber: number = 1, pageSize: number = 10) => {
    return apiCall(`/river/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  },
  getDropdownView: async () => {
    return apiCall('/river/drop-down-view', {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/rivers/${id}`, {
      method: 'GET',
    });
  },

  create: async (name: string, location: string, code:string) => {
    return apiCall('/river', {
      method: 'POST',
      body: JSON.stringify({ name, location , code}),
    });
  },

  update: async (id: string, riverData: any) => {
    return apiCall(`/rivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(riverData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/rivers/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Station Management APIs
 */
export const stationAPI = {
  getAll: async () => {
    return apiCall('/stations', {
      method: 'GET',
    });
  },
  getPaged: async (pageNumber: number = 1, pageSize: number = 10) => {
    return apiCall(`/Station/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/stations/${id}`, {
      method: 'GET',
    });
  },

  upsert: async (stationData: {
    id?: number;
    name: string;
    code: string;
    location: string;
    basin: string;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    riverId: number;
    remarks?: string;
  }) => {
    return apiCall('/station', {
      method: 'POST',
      body: JSON.stringify(stationData),
    });
  },

  update: async (id: string, stationData: any) => {
    return apiCall(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stationData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/stations/${id}`, {
      method: 'DELETE',
    });
  },

  // Get data readings for a specific station
  getReadings: async (stationId: string, params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/stations/${stationId}/readings${queryString ? `?${queryString}` : ''}`;
    return apiCall(url, {
      method: 'GET',
    });
  },

  // Submit water level and rain gauge data
  submitData: async (stationId: string, data: any) => {
    return apiCall(`/stations/${stationId}/data`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
