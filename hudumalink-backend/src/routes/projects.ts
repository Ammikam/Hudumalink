import express from 'express';
import Project from '../models/Project';

const router = express.Router();

// GET /api/projects - Get all projects with success wrapper
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch projects' 
    });
  }
});

// GET /api/projects/user/:clerkId - Get projects by Clerk user ID
router.get('/user/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const projects = await Project.find({ 'client.clerkId': clerkId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch projects' 
    });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project' 
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    // Validate required client fields
    if (!req.body.client || !req.body.client.clerkId) {
      return res.status(400).json({
        success: false,
        error: 'Client information with Clerk ID is required',
      });
    }

    const project = new Project(req.body);
    await project.save();
    
    console.log('Project created:', project._id, 'for user:', project.client.clerkId);
    
    res.status(201).json({
      success: true,
      project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create project' 
    });
  }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update project' 
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete project' 
    });
  }
});

export default router;