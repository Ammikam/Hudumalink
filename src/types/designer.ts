// src/types/designer.ts

export interface Designer {
  _id: string;
  name: string;
  avatar: string;
  coverImage: string;
  tagline: string;
  location: string;
  verified: boolean;
  superVerified: boolean;
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  responseTime: string;
  startingPrice: number;
  styles: string[];
  portfolioImages: string[];
  about: string;
}
