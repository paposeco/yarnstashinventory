const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FiberSchema = new Schema({
  fibertype: {
    type: String,
    required: true,
    enum: [
      "Wool",
      "Cotton",
      "Alpaca",
      "Nylon",
      "Polyamide",
      "Yak",
      "Linen",
      "Silk",
      "Angora",
      "Bamboo",
      "Camel",
      "Cashemere",
      "Acrylic",
      "Mohair",
      "Hemp",
      "Bison",
      "Tencel",
      "Merino",
      "Other",
    ],
  },
});

FiberSchema.virtual("url").get(function() {
  return `/inventory/fiber/${this._id}`;
});

module.exports = mongoose.model("Fiber", FiberSchema);
