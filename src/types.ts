/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  province?: string;
  city?: string;
  regional?: string; // New field replacing province/city dropdown
  plateNumber: string;
  chassisNumber: string;
  carPhoto: string; // Base64 or Unsplash placeholder
  ownerPhoto?: string; // Base64 or placeholder avatar for the owner
  registeredAt: string;
  email: string;
  pin: string;
  membershipTier?: "GOLD" | "SILVER";
  birthDate?: string; // Tanggal lahir
  hasOwnerPhoto?: boolean;
  garageImages?: string[]; // Array up to 6 base64 image strings or file paths
  garageCarName?: string; // Custom title of the car
  garageDescription?: string; // Custom mod story or details
  showInGarage?: boolean; // Show off EV in homepage/public showcase
  hideIdentityPublic?: boolean; // If true, masks name and plate to the public
  censorPlatePhoto?: boolean; // If true, overlays a digital plate sticker across car photos
  censorPlateY?: number; // Custom Y coordinate percentage (e.g. 74) for the overlay tag
  censorPlateX?: number; // Custom X coordinate percentage (e.g. 50) for the overlay tag
  censorPlateRotate?: number; // Rotation degrees (e.g. 0) for the overlay tag
  censorPlateScale?: number; // Custom scaling size percentage (e.g. 100)
  censorPlateIndices?: number[]; // List of specific image indices that should have the plate censored
  censorPositions?: { x: number; y: number; rotate: number; scale: number }[]; // Per-image sensor coordinates for different angles
  ratings?: number[]; // Array of ratings given by visitors
  ratingAverage?: number; // Calculated average rating
  ratingCount?: number; // Total count of star ratings
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string; // Activity photo
  status: "upcoming" | "completed" | "ongoing";
  slots: number;
  time?: string; // e.g. "09:00 - Selesai"
  galleryImages?: string[]; // Multiple photos uploaded for event gallery
}

export interface EventRegistration {
  id: string;
  memberId: string;
  eventId: string;
  registeredAt: string;
  status: "Registered" | "Attended" | "Absent";
  notes?: string;
  pax?: number;
}

// Stats interface for dashboard reporting
export interface DashboardStats {
  totalMembers: number;
  totalEvents: number;
  totalParticipations: number;
  attendanceRate: number;
}

export interface FAQ {
  id: string;
  category: string;
  problem: string;
  frequency: "High" | "Med" | "Low";
  solution: string;
}

export interface SponsorProduct {
  id: string;
  name: string;
  photos: string[]; // Base64 or Unsplash URLs
  price?: string | number;
  showPrice: boolean;
  useSponsorContact?: boolean;
  customContact?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  contact: string;
  logo: string; // Logo image as Base64/url
  description: string;
  products: SponsorProduct[];
  username?: string;
  password?: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutDescription: string;
  heroBadge?: string;
}


