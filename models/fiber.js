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
    default: "Wool",
  },
});

module.exports = mongoose.model("Fiber", FiberSchema);
