"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/APIs/Location/model/location.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const RecyclingCenterSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: function (value) {
                    return value.length === 2 &&
                        value[0] >= -180 && value[0] <= 180 && // longitude
                        value[1] >= -90 && value[1] <= 90; // latitude
                },
                message: 'Invalid coordinates'
            }
        },
    },
    types: [{
            type: String,
            required: true,
            enum: ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics', 'Batteries', 'Cardboard', 'Organic', 'Textile'],
        }],
    hours: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
}, {
    timestamps: true,
});
// Index for geospatial queries
RecyclingCenterSchema.index({ location: '2dsphere' });
exports.default = mongoose_1.default.model('RecyclingCenter', RecyclingCenterSchema);
