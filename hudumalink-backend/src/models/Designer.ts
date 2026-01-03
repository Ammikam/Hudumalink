import mongoose from 'mongoose';

const designerSchema = new mongoose.Schema({
  clerkId: String, // for future auth
  name: { type: String, required: true },
  location: String,
  avatar: String,
  coverImage: String,
  about: String,
  rating: Number,
  reviewCount: Number,
  responseTime: String,
  startingPrice: Number,
  projectsCompleted: Number,
  styles: [String],
  superVerified: Boolean,
  verified: Boolean,
  portfolio: [{
    id: String,
    title: String,
    description: String,
    beforeImage: String,
    afterImage: String,
    budget: Number,
    timeline: String,
    style: String,
    location: String,
  }],
  reviews: [{
    id: String,
    clientName: String,
    clientAvatar: String,
    rating: Number,
    comment: String,
    date: String,
    projectImage: String,
  }],
});

export const Designer = mongoose.model('Designer', designerSchema);