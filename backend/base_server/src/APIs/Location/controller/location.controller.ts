// src/APIs/Location/controller/location.controller.ts
import { Request, Response } from 'express';
import asyncHandler from '../../../handlers/async';
import httpResponse from '../../../handlers/httpResponse';
import RecyclingCenter, { IRecyclingCenter } from '../model/location.model';

// Waste types data
const WASTE_TYPES = [
  { type: 'Plastic', color: 'bg-blue-500' },
  { type: 'Paper', color: 'bg-amber-500' },
  { type: 'Metal', color: 'bg-slate-500' },
  { type: 'Glass', color: 'bg-emerald-500' },
  { type: 'Electronics', color: 'bg-purple-500' },
  { type: 'Batteries', color: 'bg-red-500' },
  { type: 'Cardboard', color: 'bg-orange-500' },
  { type: 'Organic', color: 'bg-green-500' },
  { type: 'Textile', color: 'bg-pink-500' },
];

// Get all recycling centers
export const getRecyclingCenters = asyncHandler(async (req: Request, res: Response) => {
  const centers = await RecyclingCenter.find({ isOpen: true })
    .select('name address location types hours phone rating')
    .sort({ rating: -1, createdAt: -1 });

  const centersWithDistance = centers.map((center: IRecyclingCenter) => {
    const id = center._id?.toString() ?? '';
    const location = {
      lat: center.location.coordinates[1],
      lng: center.location.coordinates[0],
    };
    return {
      id,
      name: center.name,
      address: center.address,
      location,
      types: center.types,
      hours: center.hours,
      phone: center.phone,
      isOpen: center.isOpen,
      rating: center.rating || 0,
      distance: 'Calculating...',
    };
  });

  httpResponse(res, req, 200, 'Recycling centers retrieved successfully', {
    centers: centersWithDistance,
    wasteTypes: WASTE_TYPES,
  });
});

// Get nearest recycling centers
export const getNearestRecyclingCenters = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 10000 } = req.query;

  if (!latitude || !longitude) {
    return httpResponse(res, req, 400, 'Latitude and longitude are required', null);
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);
  const searchRadius = parseFloat(radius as string);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return httpResponse(res, req, 400, 'Invalid latitude or longitude', null);
  }

  const centers = await RecyclingCenter.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: searchRadius,
      },
    },
    isOpen: true,
  })
    .select('name address location types hours phone rating')
    .limit(20)
    .sort({ rating: -1 });

  const centersWithDistance = centers.map((center: IRecyclingCenter) => {
    const distance = calculateDistance(lat, lng, center.location.coordinates[1], center.location.coordinates[0]);
    const id = center._id?.toString() ?? '';
    const location = {
      lat: center.location.coordinates[1],
      lng: center.location.coordinates[0],
    };
    return {
      id,
      name: center.name,
      address: center.address,
      location,
      types: center.types,
      hours: center.hours,
      phone: center.phone,
      isOpen: center.isOpen,
      rating: center.rating || 0,
      distance: `${distance.toFixed(1)} km`,
    };
  });

  httpResponse(res, req, 200, 'Nearest recycling centers retrieved successfully', centersWithDistance);
});

// Get waste types
export const getWasteTypes = (req: Request, res: Response) => {
  httpResponse(res, req, 200, 'Waste types retrieved successfully', WASTE_TYPES);
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
