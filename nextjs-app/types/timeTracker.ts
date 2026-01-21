export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  date: string; // Format: YYYY-MM-DD
  hours: number;
  description: string;
  projectId: string;
  project?: Project; // Optional project relation
  createdAt: string;
  updatedAt: string;
}