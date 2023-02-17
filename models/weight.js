const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WeightSchema = new Schema({
  weight: {
    type: String,
    required: true,
    enum: ["Lace", "Fingering", "Sport", "DK", "Worsted", "Aran", "Bulky"],
    default: "Lace",
  },
});

module.exports = mongoose.model("Weight", WeightSchema);
