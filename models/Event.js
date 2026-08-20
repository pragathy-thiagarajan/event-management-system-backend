const mongoose = require("mongoose");

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

// Schedule / session schema
const scheduleItemSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    sessionTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    speaker: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
    },

    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },

    bannerImage: {
      type: String,
      default: "",
    },

    ticketTypes: {
      type: [ticketTypeSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one ticket type is required",
      },
    },

    // Event schedule
    schedule: {
      type: [scheduleItemSchema],
      default: [],
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Event", eventSchema);