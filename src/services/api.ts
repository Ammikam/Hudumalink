const API_URL = 'http://localhost:5000/api';

export const api = {
  // Get all designers
  getDesigners: async () => {
    const res = await fetch(`${API_URL}/designers`);
    const data = await res.json();
    if (data.success) return data.designers;
    throw new Error('Failed to fetch designers');
  },

  // Get all projects
  getProjects: async () => {
    const res = await fetch(`${API_URL}/projects`);
    const data = await res.json();
    if (data.success) return data.projects;
    throw new Error('Failed to fetch projects');
  },

  // Create project
  createProject: async (projectData: any) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    return res.json();
  },
};