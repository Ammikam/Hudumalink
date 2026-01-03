import express from 'express';
import { Designer } from '../models/Designer';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const designers = await Designer.find();
    res.json({ success: true, designers });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;