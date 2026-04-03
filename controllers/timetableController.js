const Timetable = require("../models/timetableSchema");

// POST: Create/Update Timetable
exports.addTimetable = (fields) => async (dispatch) => {
  dispatch(getRequest());

  try {
    // console.log("Sending Fields:", fields); // Uncomment to debug
    const result = await axios.post(`${BASE_URL}/Timetable/save`, fields);
    if (result.data.message) {
      dispatch(saveSuccess(result.data));
    } else {
      dispatch(getFailed("Failed to save timetable"));
    }
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};

exports.saveTimetable = async (req, res) => {
  try {
    const { sclass, periodDefinitions, schedule } = req.body;

    let existingTimetable = await Timetable.findOne({ sclass });

    if (existingTimetable) {
      // Update logic
      if (periodDefinitions)
        existingTimetable.periodDefinitions = periodDefinitions;
      if (schedule) existingTimetable.schedule = schedule;

      // Mongoose Map update detect karne ke liye zaroori hai
      if (schedule) existingTimetable.markModified("schedule");

      await existingTimetable.save();
      res.send({
        message: "Timetable updated successfully",
        data: existingTimetable,
      });
    } else {
      // Create logic
      const newTimetable = new Timetable({
        sclass,
        periodDefinitions,
        schedule,
      });
      await newTimetable.save();
      res.send({
        message: "Timetable created successfully",
        data: newTimetable,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get Timetable
exports.getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ sclass: req.params.id });
    if (timetable) {
      res.send(timetable);
    } else {
      res.send({ message: "No timetable found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Delete Timetable (Agar zaroorat pade)
exports.deleteTimetable = async (req, res) => {
  try {
    const result = await Timetable.findOneAndDelete({ sclass: req.params.id });
    if (result) {
      res.send({ message: "Timetable deleted successfully" });
    } else {
      res.send({ message: "No timetable found to delete" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
