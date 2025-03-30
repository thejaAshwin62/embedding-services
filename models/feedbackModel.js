import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  ip: { type: String, default: 'Unknown IP' },
  city: { type: String, default: 'Unknown City' },
  region: { type: String, default: 'Unknown Region' },
  country: { type: String, default: 'Unknown Country' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  area: { type: String, default: 'Unknown Area' },
  locality: { type: String, default: 'Unknown Locality' },
  zip: { type: String, default: 'Unknown Zip' },
  formatted_address: { type: String, default: '' },
  timestamp: { type: String, required: true },
});

const feedbackSchema = new mongoose.Schema({
  id_date: { type: String, required: true },
  id_time: { type: String, required: true },
  timeRange: { type: String },
  timeStart: { type: String },
  timeEnd: { type: String },
  feedback: { type: String, required: true },
  embedded: { type: Boolean, default: false },
  objectCount: { type: Number, default: 0 },
  detectedObjects: { type: [String], default: [] }, // Store array of detected object names
  location: { 
    type: locationSchema, 
    _id: false  // Prevents Mongoose from creating an _id for the subdocument
  },
  imageLocation: { type: String }, // Store the path where image is saved
  createdAt: { type: Date, default: Date.now }
});

// Add index for better query performance
feedbackSchema.index({ id_date: 1, id_time: 1 });
feedbackSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
feedbackSchema.index({ embedded: 1 });
feedbackSchema.index({ detectedObjects: 1 }); // Add index for object queries

export default mongoose.model('Feedback', feedbackSchema);