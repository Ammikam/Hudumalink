import express from 'express';
import { Project } from '../models/Project';

const router = express.Router();

// CREATE PROJECT (from invite or post project)
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// GET ALL PROJECTS
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;