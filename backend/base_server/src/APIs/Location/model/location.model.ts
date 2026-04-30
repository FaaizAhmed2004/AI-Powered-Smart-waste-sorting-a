// src/APIs/Location/model/location.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRecyclingCenter extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  types: string[]; // waste types accepted
  hours: string;
  phone: string;
  isOpen: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecyclingCenterSchema = new Schema<IRecyclingCenter>(
  {
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
          validator: function (value: number[]) {
            return value.length === 2 &&
                   value[0] >= -180 && value[0] <= 180 && // longitude
                   value[1] >= -90 && value[1] <= 90;     // latitude
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
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
RecyclingCenterSchema.index({ location: '2dsphere' });

export default mongoose.model<IRecyclingCenter>('RecyclingCenter', RecyclingCenterSchema);