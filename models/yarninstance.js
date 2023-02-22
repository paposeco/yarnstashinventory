const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YarnInstanceSchema = new Schema({
  yarn: { type: Schema.Types.ObjectId, ref: "Yarn", required: true },
  dyelot: { type: String, required: true },
  colorwayid: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

YarnInstanceSchema.virtual("url").get(function() {
  return `/inventory/yarncolorway/${this._id}`;
});

// not sure if colorwayid should be unique. check on create

module.exports = mongoose.model("YarnInstance", YarnInstanceSchema);
