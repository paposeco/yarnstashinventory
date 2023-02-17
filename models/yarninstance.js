const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YarnInstanceSchema = new Schema({
  yarn: { type: Schema.Types.ObjectId, ref: "Yarn", required: true },
  dyelot: { type: String, required: true },
  colorwayid: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

// not sure if colorwayid should be unique

module.exports = mongoose.model("YarnInstance", YarnInstanceSchema);
