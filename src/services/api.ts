const API_URL = 'http://localhost:5000/api';

export const api = {
  // Get all designers
  getDesigners: async (token?: string) => {
    const res = await fetch(`${API_URL}/designers`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json();
    if (data.success) return data.designers;
    throw new Error('Failed to fetch designers');
  },

  // Get all projects
  getProjects: async (token?: string) => {
    const res = await fetch(`${API_URL}/projects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const data = await res.json();
    if (data.success) return data.projects;
    throw new Error('Failed to fetch projects');
  },

 // Get projects for logged-in client
getUserProjects: async (token?: string) => {
  if (!token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(`${API_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch user projects');
  }

  return data.projects;
},

  // Upload project images
  uploadProjectImages: async (formData: FormData, token?: string) => {
    const res = await fetch(`${API_URL}/upload/project-images`, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload images');
    }
    return res.json();
  },

  // Upload portfolio images
  uploadPortfolioImages: async (formData: FormData, token?: string) => {
    const res = await fetch(`${API_URL}/upload/portfolio-images`, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload images');
    }
    return res.json();
  },

  // Upload profile image
  uploadProfileImage: async (formData: FormData, token?: string) => {
    const res = await fetch(`${API_URL}/upload/profile-images`, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload image');
    }
    return res.json();
  },

  // Create project
  createProject: async (projectData: any, token?: string) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
