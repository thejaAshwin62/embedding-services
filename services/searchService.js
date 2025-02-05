import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
const HUGGINGFACE_MODEL = "intfloat/multilingual-e5-large";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const TIME_PERIODS = {
  MORNING: {
    name: "morning",
    startTime: "07:00:00",
    endTime: "08:00:00",
    timeRange: "07:00:00-08:00:00",
  },
  AFTERNOON: {
    name: "afternoon",
    startTime: "13:00:00",
    endTime: "14:00:00",
    timeRange: "13:00:00-14:00:00",
  },
  EVENING: {
    name: "evening",
    startTime: "17:00:00",
    endTime: "18:00:00",
    timeRange: "17:00:00-18:00:00",
  },
  NIGHT: {
    name: "night",
    startTime: "19:00:00",
    endTime: "20:00:00",
    timeRange: "19:00:00-20:00:00",
  },
};

async function generateEmbedding(text) {
  try {
    const response = await hf.featureExtraction({
      model: HUGGINGFACE_MODEL,
      inputs: text,
      options: { waitForModel: true },
    });
    return response;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

function convertTimeFormat(timeStr, modifier) {
  let [hours, minutes, seconds = "00"] = timeStr
    .split(":")
    .map((num) => parseInt(num));

  if (modifier && modifier.toLowerCase() === "pm") {
    if (hours < 12) hours += 12;
  } else if (modifier && modifier.toLowerCase() === "am") {
    if (hours === 12) hours = 0;
  }

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

function generateTimeRange(time24) {
  const [hours, minutes] = time24.split(":");
  const startMinutes = Math.floor(parseInt(minutes) / 15) * 15;
  const endMinutes = startMinutes + 15;

  const startTime = `${hours}:${startMinutes.toString().padStart(2, "0")}:00`;
  const endTime =
    endMinutes === 60
      ? `${(parseInt(hours) + 1).toString().padStart(2, "0")}:00:00`
      : `${hours}:${endMinutes.toString().padStart(2, "0")}:00`;

  return {
    start: startTime,
    end: endTime,
    range: `${startTime}-${endTime}`,
  };
}

function parseQuery(query) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let queryDate;
  if (query.toLowerCase().includes("today")) {
    queryDate = today.toLocaleDateString("en-GB");
  } else if (query.toLowerCase().includes("yesterday")) {
    queryDate = yesterday.toLocaleDateString("en-GB");
  } else {
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/;
    const dateMatch = query.match(datePattern);
    if (!dateMatch) {
      return {
        error: "Invalid date format",
        message: "Please specify a date (DD/MM/YYYY) or use 'today'/'yesterday'",
      };
    }
    queryDate = dateMatch[1];
  }

  let timePeriod = null;
  for (const [key, period] of Object.entries(TIME_PERIODS)) {
    if (query.toLowerCase().includes(period.name)) {
      timePeriod = period;
      break;
    }
  }

  if (timePeriod) {
    const formattedQuery = `Date: ${queryDate}, TimeRange: ${timePeriod.timeRange}, Period: ${timePeriod.name}, Query: ${query}`;
    return {
      date: queryDate,
      originalTime: timePeriod.name,
      timeRange: {
        start: timePeriod.startTime,
        end: timePeriod.endTime,
        range: timePeriod.timeRange,
      },
      formattedQuery: formattedQuery,
      period: timePeriod.name,
    };
  }

  const timePattern = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = query.match(timePattern);

  if (!timeMatch) {
    return {
      error: "Invalid time format",
      message: "Please specify either a time period (morning/afternoon/evening/night) or time in format HH:MM AM/PM",
    };
  }

  const hours = timeMatch[1];
  const minutes = timeMatch[2];
  const seconds = timeMatch[3] || "00";
  const modifier = timeMatch[4];

  const time24 = convertTimeFormat(`${hours}:${minutes}:${seconds}`, modifier);
  const formattedTime = `${time24.hours}:${time24.minutes}:${time24.seconds}`;
  const timeRange = generateTimeRange(formattedTime);

  const formattedQuery = `Date: ${queryDate}, TimeRange: ${timeRange.range}, Time: ${formattedTime}, Query: ${query}`;

  return {
    date: queryDate,
    originalTime: `${hours}:${minutes}${seconds !== "00" ? ":" + seconds : ""}${
      modifier ? " " + modifier.toUpperCase() : ""
    }`,
    time24: formattedTime,
    timeRange: timeRange,
    formattedQuery: formattedQuery,
  };
}

function generate15MinuteIntervals(startTime, endTime) {
  const intervals = [];
  const [startHour] = startTime.split(":").map(Number);
  const [endHour] = endTime.split(":").map(Number);

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const start = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`;
      const end =
        minute === 45 && hour === endHour
          ? endTime
          : minute === 45
          ? `${(hour + 1).toString().padStart(2, "0")}:00:00`
          : `${hour.toString().padStart(2, "0")}:${(minute + 15)
              .toString()
              .padStart(2, "0")}:00`;

      intervals.push({
        start,
        end,
        range: `${start}-${end}`,
      });

      if (hour === endHour && minute + 15 >= 0) break;
    }
  }
  return intervals;
}

function formatSearchResult(match) {
  return {
    Date: match.metadata.id_date,
    Time: match.metadata.id_time,
    TimeRange: match.metadata.timeRange,
    Feedback: match.metadata.feedback,
    Location: {
      city: match.metadata.location_city,
      region: match.metadata.location_region,
      country: match.metadata.location_country,
      latitude: parseFloat(match.metadata.location_latitude),
      longitude: parseFloat(match.metadata.location_longitude)
    },
    Score: match.score
  };
}

export async function performSemanticSearch(query) {
  try {
    const parsedQuery = parseQuery(query);

    if (parsedQuery.error) {
      return parsedQuery;
    }

    const index = pinecone.index("multi-emb");
    const queryEmbedding = await generateEmbedding(parsedQuery.formattedQuery);

    if (parsedQuery.period) {
      const intervals = generate15MinuteIntervals(
        parsedQuery.timeRange.start,
        parsedQuery.timeRange.end
      );

      let allResults = [];

      for (const interval of intervals) {
        const searchFilter = {
          id_date: parsedQuery.date,
          timeRange: interval.range,
        };

        const searchResponse = await index.query({
          vector: queryEmbedding,
          topK: 1,
          includeMetadata: true,
          filter: searchFilter,
        });

        if (searchResponse.matches.length > 0) {
          allResults.push(
            ...searchResponse.matches.map((match) => ({
              Date: match.metadata.id_date,
              Time: match.metadata.id_time,
              TimeRange: match.metadata.timeRange,
              Feedback: match.metadata.feedback,
              Location: {
                city: match.metadata.location_city,
                region: match.metadata.location_region,
                country: match.metadata.location_country,
                latitude: parseFloat(match.metadata.location_latitude),
                longitude: parseFloat(match.metadata.location_longitude)
              },
              Score: match.score,
              Interval: interval.range,
            }))
          );
        }
      }

      allResults.sort((a, b) => b.Score - a.Score);

      return {
        results: allResults.slice(0, 1),
        exactMatch: true,
        queryInfo: {
          requestedDate: parsedQuery.date,
          requestedTime: parsedQuery.originalTime,
          timeRange: parsedQuery.timeRange.range,
          totalMatches: allResults.length,
        },
      };
    } else {
      const searchFilter = {
        id_date: parsedQuery.date,
        timeRange: parsedQuery.timeRange.range,
      };

      console.log('Searching with filter:', searchFilter);

      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: 1,
        includeMetadata: true,
        filter: searchFilter,
      });

      if (searchResponse.matches.length === 0) {
        return {
          message: `No memories found at ${parsedQuery.originalTime} on ${parsedQuery.date}`,
          queryInfo: {
            requestedDate: parsedQuery.date,
            requestedTime: parsedQuery.originalTime,
            timeRange: parsedQuery.timeRange.range,
          },
        };
      }

      const results = searchResponse.matches.map(match => formatSearchResult(match));

      return {
        results,
        exactMatch: true,
        queryInfo: {
          requestedDate: parsedQuery.date,
          requestedTime: parsedQuery.originalTime,
          timeRange: parsedQuery.timeRange.range,
          totalMatches: results.length,
        },
      };
    }
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
} 