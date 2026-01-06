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

  // NEW: Upload images for projects
  uploadProjectImages: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/upload/project-images`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload images');
    }
    
    return res.json();
  },

  // NEW: Upload images for portfolio
  uploadPortfolioImages: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/upload/portfolio-images`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload images');
    }
    
    return res.json();
  },

  // NEW: Upload single profile image
  uploadProfileImage: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/upload/profile-images`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload image');
    }
    
    return res.json();
  },

  // Create project
  createProject: async (projectData: any) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create project');
    }
    
    return res.json();
  },
};