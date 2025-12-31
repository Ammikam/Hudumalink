import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  photos: [String], // array of image URLs (Cloudinary later)
  client: {
  clerkId: {
    type: String,
    required: true,
  },
  name: String,
  email: String,
},
  invitedDesigner: {
    type: mongoose.Schema.Types.String,
    // ref: 'Designer',
  },
  status: {
    type: String,
    enum: ['open', 'invited', 'in_progress', 'completed'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Project = mongoose.model('Project', projectSchema);