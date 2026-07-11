const express = require("express");
const multer = require("multer");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

("iMPORT");
const {
  uploadRide,
  getRides,
  getRideById,
  updateRide,
  deleteRide,
  getYearReport
} = require("../controllers/rideController");

const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("gpxFile"), uploadRide);
router.get("/", protect, getRides);
router.get("/report/:year", protect, getYearReport);
("id's");
router.get("/:id", protect, getRideById);
router.put("/:id", protect, updateRide);
router.delete("/:id", protect, deleteRide);

module.exports = router;
