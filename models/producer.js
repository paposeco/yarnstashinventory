const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProducerSchema = new Schema({
  brandname: { type: String, required: true },
  country: { type: String },
  telephonenumber: { type: String },
});

module.exports = mongoose.model("Producer", ProducerSchema);