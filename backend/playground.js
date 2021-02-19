const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let playground = new Schema(
  {
    _id: {
      type: Number
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