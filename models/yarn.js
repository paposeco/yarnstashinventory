const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YarnSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Schema.Types.ObjectId, ref: "Weight", required: true },
  fibertype: [{ type: Schema.Types.ObjectId, ref: "Fiber", required: true }],
  unitweight: { type: Number, required: true },
  meterage: { type: Number, required: true },
  price: { type: Number, min: 0 },
  producer: {
    type: Schema.Types.ObjectId,
    ref: "Producer",
    required: true,
  },
});

module.exports = mongoose.model("Yarn", YarnSchema);
