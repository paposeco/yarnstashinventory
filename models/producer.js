const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProducerSchema = new Schema({
  brandname: { type: String, required: true },
  country: { type: String },
  contact: { type: String },
});

ProducerSchema.virtual("url").get(function() {
  return `/inventory/producers/${this._id}`;
});

module.exports = mongoose.model("Producer", ProducerSchema);
