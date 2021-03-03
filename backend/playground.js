const mongoose = require("mongoose");
const uuid = require("node-uuid");

const Schema = mongoose.Schema;

let playground = new Schema(
  {
    _id: {
      type: String,
      default: uuid.v4,
    },
    sample: {
      type: Object
    },
    formula: {
      type: String
    },
    preview: {
      type: Object
    }
  },
  { collection: "Playground" }
);

module.exports = mongoose.model("playground", playground);