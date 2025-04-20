import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    accessCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

// This line is crucial for the performance and scalability of your URL shortener. 
// It instructs the database to create an optimized data structure (an index) specifically for the shortCode field, 
// allowing for near-instantaneous retrieval of documents based on their short code,
// which is essential for fast redirects and data lookups.
UrlSchema.index({ shortCode: 1 });

const Url = mongoose.model('Url', UrlSchema); 

export default Url; 