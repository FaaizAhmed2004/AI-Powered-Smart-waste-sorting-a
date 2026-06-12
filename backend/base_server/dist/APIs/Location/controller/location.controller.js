"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWasteTypes = exports.getNearestRecyclingCenters = exports.getRecyclingCenters = void 0;
const async_1 = __importDefault(require("../../../handlers/async"));
const httpResponse_1 = __importDefault(require("../../../handlers/httpResponse"));
const location_model_1 = __importDefault(require("../model/location.model"));
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
exports.getRecyclingCenters = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const centers = yield location_model_1.default.find({ isOpen: true })
        .select('name address location types hours phone rating')
        .sort({ rating: -1, createdAt: -1 });
    const centersWithDistance = centers.map((center) => {
        var _a, _b;
        const id = (_b = (_a = center._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
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
    (0, httpResponse_1.default)(res, req, 200, 'Recycling centers retrieved successfully', {
        centers: centersWithDistance,
        wasteTypes: WASTE_TYPES,
    });
}));
// Get nearest recycling centers
exports.getNearestRecyclingCenters = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, radius = 10000 } = req.query;
    if (!latitude || !longitude) {
        return (0, httpResponse_1.default)(res, req, 400, 'Latitude and longitude are required', null);
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const searchRadius = parseFloat(radius);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return (0, httpResponse_1.default)(res, req, 400, 'Invalid latitude or longitude', null);
    }
    const centers = yield location_model_1.default.find({
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
    const centersWithDistance = centers.map((center) => {
        var _a, _b;
        const distance = calculateDistance(lat, lng, center.location.coordinates[1], center.location.coordinates[0]);
        const id = (_b = (_a = center._id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
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
    (0, httpResponse_1.default)(res, req, 200, 'Nearest recycling centers retrieved successfully', centersWithDistance);
}));
// Get waste types
const getWasteTypes = (req, res) => {
    (0, httpResponse_1.default)(res, req, 200, 'Waste types retrieved successfully', WASTE_TYPES);
};
exports.getWasteTypes = getWasteTypes;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
