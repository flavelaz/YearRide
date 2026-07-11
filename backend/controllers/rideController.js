const fs = require("fs");
const Ride = require("../models/Ride");
const { parseGpxFile } = require("../utils/gpxParser");

const deleteTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const uploadRide = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Keine GPX-Datei hochgeladen" });
    }

    if (!title) {
      deleteTempFile(req.file.path);
      return res.status(400).json({ message: "Titel fehlt" });
    }

    const gpxData = parseGpxFile(req.file.path);

    const ride = await Ride.create({
      user: req.user._id,
      title,
      originalFileName: req.file.originalname,
      date: gpxData.date,
      distanceKm: gpxData.distanceKm,
      elevationGainM: gpxData.elevationGainM,
      durationSeconds: gpxData.durationSeconds
    });

    deleteTempFile(req.file.path);

    res.status(201).json({
      message: "Fahrt gespeichert",
      ride
    });
  } catch (error) {
    if (req.file) {
      deleteTempFile(req.file.path);
    }

    res.status(500).json({
      message: "Fehler beim Hochladen",
      error: error.message
    });
  }
};

const getRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).sort({ date: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({
      message: "Serverfehler",
      error: error.message
    });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!ride) {
      return res.status(404).json({ message: "Fahrt nicht gefunden" });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({
      message: "Serverfehler",
      error: error.message
    });
  }
};

const updateRide = async (req, res) => {
  try {
    const { title } = req.body;

    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      {
        title
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!ride) {
      return res.status(404).json({ message: "Fahrt nicht gefunden" });
    }

    res.json({
      message: "Fahrt aktualisiert",
      ride
    });
  } catch (error) {
    res.status(500).json({
      message: "Serverfehler",
      error: error.message
    });
  }
};

const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!ride) {
      return res.status(404).json({ message: "Fahrt nicht gefunden" });
    }

    res.json({
      message: "Fahrt gelöscht"
    });
  } catch (error) {
    res.status(500).json({
      message: "Serverfehler",
      error: error.message
    });
  }
};

const getYearReport = async (req, res) => {
  try {
    const year = Number(req.params.year);

    if (!year) {
      return res.status(400).json({ message: "Ungültiges Jahr" });
    }

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const rides = await Ride.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const totalRides = rides.length;

    const totalDistanceKm = rides.reduce((sum, ride) => {
      return sum + ride.distanceKm;
    }, 0);

    const totalElevationGainM = rides.reduce((sum, ride) => {
      return sum + ride.elevationGainM;
    }, 0);

    const totalDurationSeconds = rides.reduce((sum, ride) => {
      return sum + ride.durationSeconds;
    }, 0);

    const longestRide = rides.reduce((longest, ride) => {
      if (!longest || ride.distanceKm > longest.distanceKm) {
        return ride;
      }

      return longest;
    }, null);

    res.json({
      year,
      totalRides,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalElevationGainM,
      totalDurationSeconds,
      averageDistanceKm:
        totalRides > 0 ? Number((totalDistanceKm / totalRides).toFixed(2)) : 0,
      longestRide
    });
  } catch (error) {
    res.status(500).json({
      message: "Serverfehler",
      error: error.message
    });
  }
};

module.exports = {
  uploadRide,
  getRides,
  getRideById,
  updateRide,
  deleteRide,
  getYearReport
};
