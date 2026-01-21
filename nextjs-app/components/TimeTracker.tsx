'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProjects, fetchTimeEntries, setLoading, setError } from '@/store/timeTracker/timeTrackerSlice';
import TimeEntryForm from './TimeEntryForm';
import EntryHistory from './EntryHistory';
import { timeTrackerApi } from '@/lib/api/timeTrackerApi';

export default function TimeTracker() {
  const { projects, loading, error } = useAppSelector(state => state.timeTracker);
  const dispatch = useAppDispatch();

  // Initialize default projects if none exist
  const initializeDefaultProjects = async () => {
    try {
      const defaultProjects = [
        { name: 'Viso Internal', description: 'Internal projects for Viso Academy' },
        { name: 'Client A', description: 'Projects for Client A' },
        { name: 'Client B', description: 'Projects for Client B' },
        { name: 'Personal Development', description: 'Personal skill development activities' },
      ];

      // Check if projects already exist
      const existingProjects = await timeTrackerApi.getProjects();
      if (existingProjects.length === 0) {
        // Create default projects
        for (const projectData of defaultProjects) {
          await timeTrackerApi.createProject(projectData);
        }
      }
    } catch (err) {
      console.error('Error initializing default projects:', err);
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(setLoading(true));

        // Initialize default projects if needed
        await initializeDefaultProjects();

        // Load projects and time entries
        await Promise.all([
          dispatch(fetchProjects()),
          dispatch(fetchTimeEntries())
        ]);

        dispatch(setError(null));
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [dispatch]);

  if (loading && projects.length === 0) { // Only show spinner if no projects loaded yet
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Noise Overlay */}
      <div className="noise-overlay"></div>

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 vibrant-text">Mini Time Tracker</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <TimeEntryForm projects={projects} />
        </div>

        <div className="lg:col-span-1">
          <EntryHistory />
        </div>
      </div>
    </div>
  );
}