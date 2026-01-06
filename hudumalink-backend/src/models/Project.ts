// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   budget: {
//     type: Number,
//     required: true,
//   },
//   photos: [String], // array of image URLs (Cloudinary later)
//   client: {
//   clerkId: {
//     type: String,
//     required: true,
//   },
//   name: String,
//   email: String,
// },
//   invitedDesigner: {
//     type: mongoose.Schema.Types.String,
//     // ref: 'Designer',
//   },
//   status: {
//     type: String,
//     enum: ['open', 'invited', 'in_progress', 'completed'],
//     default: 'open',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export const Project = mongoose.model('Project', projectSchema);

import mongoose, { Schema, Document } from 'mongoose';

interface IProject extends Document {
  title: string;
  description: string;
  location: string;
  budget: number;
  timeline: string;
  styles: string[];
  photos: string[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'open' | 'in_progress' | 'completed';
  proposals: any[];
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  timeline: { type: String, required: true },
  styles: [{ type: String }],
  photos: [{ type: String }],
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'completed'],
    default: 'open'
  },
  proposals: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProject>('Project', ProjectSchema);
