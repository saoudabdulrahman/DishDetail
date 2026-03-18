export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  avatar: string | null;
  bio: string | null;
  role: 'user' | 'owner';
  ownedEstablishment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  role: 'user' | 'owner';
  ownedEstablishment: string | null;
}

export interface Establishment {
  _id: string;
  legacyId?: number;
  restaurantName: string;
  slug: string;
  cuisine: string;
  rating: number;
  description: string;
  address: string;
  hours?: string;
  phone: string;
  website: string | null;
  restaurantImage: string | null;
}

export interface Comment {
  _id: string;
  author: string;
  date: string;
  body: string;
  isEdited: boolean;
}

export interface OwnerResponse {
  date: string;
  body: string;
}

export interface Review {
  _id: string;
  legacyId?: number;
  establishment: string; // establishment ID
  title: string;
  rating: number;
  reviewer: string;
  reviewerAvatar: string | null;
  date: string;
  body: string;
  reviewImage: string | null;
  helpfulCount: number;
  unhelpfulCount: number;
  comments: Comment[];
  ownerResponse: OwnerResponse | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}
