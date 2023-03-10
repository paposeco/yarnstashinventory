const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YarnSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Schema.Types.ObjectId, ref: "Weight", required: true },
  fibercomposition: [
    {
      fibertype: { type: Schema.Types.ObjectId, ref: "Fiber", required: true },
      percentage: { type: Number, required: true },
    },
  ],
  unitweight: { type: Number, required: true },
  meterage: { type: Number, required: true },
  price: { type: Number, min: 0 },
  producer: {
    type: Schema.Types.ObjectId,
    ref: "Producer",
    required: true,
  },
  imagepath: { type: String },
});

YarnSchema.virtual("url").get(function() {
  return `/inventory/yarn/${this._id}`;
});

module.exports = mongoose.model("Yarn", YarnSchema);
