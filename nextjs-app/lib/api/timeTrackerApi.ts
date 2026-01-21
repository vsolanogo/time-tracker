import axios from 'axios';
import { TimeEntry, Project } from '@/types/timeTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add any custom headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export const timeTrackerApi = {
  // Project API methods
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  createProject: async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Time Entry API methods
  getTimeEntries: async (): Promise<TimeEntry[]> => {
    try {
      const response = await apiClient.get('/time-entries');
      return response.data;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      throw error;
    }
  },

  getTimeEntryById: async (id: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.get(`/time-entries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time entry:', error);
      throw error;
    }
  },

  createTimeEntry: async (timeEntryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post('/time-entries', timeEntryData);
      return response.data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  updateTimeEntry: async (id: string, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry> => {
    try {
      const response = await apiClient.patch(`/time-entries/${id}`, timeEntryData);
      return response.data;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  },

  deleteTimeEntry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/time-entries/${id}`);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  },

  getTimeEntriesByDateRange: async (startDate: string, endDate: string): Promise<TimeEntry[]> => {
    try {
      const response = await apiClient.get(`/time-entries/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching time entries by date range:', error);
      throw error;
    }
  },

  getDailyTotals: async (startDate: string, endDate: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/time-entries/daily-totals`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily totals:', error);
      throw error;
    }
  },

  getTotalHours: async (startDate: string, endDate: string): Promise<number> => {
    try {
      const response = await apiClient.get(`/time-entries/total-hours`, {
        params: { startDate, endDate }
      });
      // The response structure depends on the backend implementation
      // If it returns an object with a total property, use that
      // Otherwise, if it returns the raw value, return that
      if (typeof response.data === 'object' && response.data.total !== undefined) {
        return response.data.total;
      } else if (typeof response.data === 'number') {
        return response.data;
      } else {
        // If the response is an array with a single item containing total
        if (Array.isArray(response.data) && response.data[0] && response.data[0].total) {
          return parseFloat(response.data[0].total) || 0;
        }
        // Default fallback
        return 0;
      }
    } catch (error) {
      console.error('Error fetching total hours:', error);
      throw error;
    }
  },
};