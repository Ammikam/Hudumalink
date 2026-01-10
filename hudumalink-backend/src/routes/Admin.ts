import express from 'express';
import Project from '../models/Project';
import {Designer} from '../models/Designer';

import { requireAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/roles';

const router = express.Router();

/**
 * ADMIN DASHBOARD STATS
 * GET /api/admin/overview
 */
router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
  const [projects, designers] = await Promise.all([
    Project.countDocuments(),
    Designer.countDocuments(),
  ]);

  res.json({
    success: true,
    stats: {
      totalProjects: projects,
      totalDesigners: designers,
    },
  });
});

/**
 * VIEW ALL PROJECTS (ADMIN)
 * GET /api/admin/projects
 */
router.get('/projects', requireAuth, requireAdmin, async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    projects,
  });
});

/**
 * APPROVE DESIGNER
 * PATCH /api/admin/designers/:id/approve
 */
router.patch(
  '/designers/:id/approve',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const designer = await Designer.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer not found',
      });
    }

    res.json({
      success: true,
      designer,
      message: 'Designer approved',
    });
  }
);

/**
 * REJECT DESIGNER
 * PATCH /api/admin/designers/:id/reject
 */
router.patch(
  '/designers/:id/reject',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const designer = await Designer.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer not found',
      });
    }

    res.json({
      success: true,
      designer,
      message: 'Designer rejected',
    });
  }
);

export default router;
