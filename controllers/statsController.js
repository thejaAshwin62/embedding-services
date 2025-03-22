import Feedback from '../models/feedbackModel.js';
import mongoose from 'mongoose';
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  
  // Today (start of day to now)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // This week (start of week to now)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Go back to Sunday
  weekStart.setHours(0, 0, 0, 0);
  
  // This month (start of month to now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Last month (start of last month to end of last month)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  return {
    todayStart,
    weekStart,
    monthStart,
    lastMonthStart,
    lastMonthEnd,
    now
  };
};

// Get overall statistics
export const getOverallStats = async (req, res) => {
  try {
    const { todayStart, weekStart, monthStart, lastMonthStart, lastMonthEnd } = getDateRanges();
    
    // Count documents for different time periods
    const totalCount = await Feedback.countDocuments();
    const todayCount = await Feedback.countDocuments({ createdAt: { $gte: todayStart } });
    const thisWeekCount = await Feedback.countDocuments({ createdAt: { $gte: weekStart } });
    const thisMonthCount = await Feedback.countDocuments({ createdAt: { $gte: monthStart } });
    const lastMonthCount = await Feedback.countDocuments({ 
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } 
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount
      }
    });
  } catch (error) {
    console.error('Error getting overall stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get daily breakdown for a specific time period
export const getDailyBreakdown = async (req, res) => {
  try {
    const { period } = req.params; // 'week', 'month', 'lastMonth'
    const { todayStart, weekStart, monthStart, lastMonthStart, lastMonthEnd } = getDateRanges();
    
    let startDate, endDate;
    
    switch (period) {
      case 'week':
        startDate = weekStart;
        endDate = new Date();
        break;
      case 'month':
        startDate = monthStart;
        endDate = new Date();
        break;
      case 'lastMonth':
        startDate = lastMonthStart;
        endDate = lastMonthEnd;
        break;
      default:
        startDate = todayStart;
        endDate = new Date();
    }
    
    // Aggregate to group by day
    const dailyStats = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          count: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      period,
      data: dailyStats
    });
  } catch (error) {
    console.error(`Error getting ${req.params.period} breakdown:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily breakdown',
      error: error.message
    });
  }
};

// Get detailed stats with pagination
export const getDetailedStats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await Feedback.countDocuments();
    
    // Get paginated data with relevant fields
    const data = await Feedback.find()
      .select('id_date id_time feedback location.city location.country createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error getting detailed stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed statistics',
      error: error.message
    });
  }
};

// Get object detection statistics
export const getObjectStats = async (req, res) => {
  try {
    // Aggregate to group objects by frequency
    const objectStats = await Feedback.aggregate([
      {
        $unwind: "$detectedObjects" // Split array elements to individual documents
      },
      {
        $group: {
          _id: "$detectedObjects",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 } // Sort by frequency in descending order
      },
      {
        $project: {
          _id: 0,
          object: "$_id",
          count: 1
        }
      }
    ]);
    
    // Get total objects count
    const totalObjectsCount = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$objectCount" }
        }
      }
    ]);
    
    // Calculate total instances of all objects combined
    const totalObjectInstances = objectStats.reduce((total, obj) => total + obj.count, 0);
    
    // Get average objects per image
    const avgObjectsPerImage = await Feedback.aggregate([
      {
        $match: { objectCount: { $gt: 0 } } // Only consider images with objects
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$objectCount" }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        // objectFrequency: objectStats,
        totalObjectsCount: totalObjectInstances, // Renamed for clarity
        totalUniqueObjects: totalObjectsCount.length > 0 ? totalObjectsCount[0].total : 0,
        averagePerImage: avgObjectsPerImage.length > 0 ? avgObjectsPerImage[0].average : 0,
        // uniqueObjectTypes: objectStats.length
      }
    });
  } catch (error) {
    console.error('Error getting object detection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch object detection statistics',
      error: error.message
    });
  }
};

// Get object detection trends over time
export const getObjectTrends = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const { weekStart, monthStart } = getDateRanges();
    
    let startDate;
    switch (period) {
      case 'week':
        startDate = weekStart;
        break;
      case 'month':
      default:
        startDate = monthStart;
    }
    
    // Aggregate objects by day
    const trends = await Feedback.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          objectCount: { $sum: "$objectCount" },
          imageCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          objectCount: 1,
          imageCount: 1,
          avgObjectsPerImage: { $divide: ["$objectCount", "$imageCount"] }
        }
      }
    ]);
    
    res.json({
      success: true,
      period,
      data: trends
    });
  } catch (error) {
    console.error('Error getting object trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch object detection trends',
      error: error.message
    });
  }
};

// Get face index names and scores from Pinecone
export const getFaceIndexStats = async (req, res) => {
  try {
    // Connect to the "faceindex" index in Pinecone
    const faceIndex = pinecone.index("faceindex");
    
    // Use a zero vector matching your Pinecone index dimension (128 as per your DB info)
    const VECTOR_DIMENSION = 128;
    
    // Query all vectors (or use pagination if there are many records)
    const queryResponse = await faceIndex.query({
      vector: Array(VECTOR_DIMENSION).fill(0), // Zero vector with correct dimension
      topK: 10000, // Adjust based on your expected data size
      includeMetadata: true
    });
    
    if (!queryResponse.matches) {
      return res.json({
        success: true,
        data: {
          faceRecords: []
        }
      });
    }
    
    // Extract names and scores from the response - keep all original data
    const faceRecords = queryResponse.matches.map(match => {
      const originalScore = match.score || 0;
      
      return {
        id: match.id,
        name: match.metadata?.name || "Unknown",
        score: originalScore, // Keep original full score
        // Display formatted score for UI purposes if needed
      };
    });

    // Sort by score in descending order
    faceRecords.sort((a, b) => b.score - a.score);
    
    res.json({
      success: true,
      data: {
        faceRecords,
        total: faceRecords.length
      }
    });
  } catch (error) {
    console.error('Error getting face index stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch face index statistics',
      error: error.message
    });
  }
};
