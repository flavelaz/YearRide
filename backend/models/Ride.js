const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    originalFileName: {
      type: String
    },
    date: {
      type: Date
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    elevationGainM: {
      type: Number,
      default: 0
    },
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Ride", rideSchema);
