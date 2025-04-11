var mongoose = require("mongoose");
const BaseSchema = require("./BaseSchema");

var ProductSchema = new BaseSchema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    required: true,
    of: {
      type: {
        imagePath: {
          type: String,
          required: true,
        },
      },
    },
  },
  isActive: {
    type: Boolean,
    default: 0,
  },
  description: {
    // HTML/Markdown with images support
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  id: Number,
});

//console.log(ProductSchema.statics);
module.exports = mongoose.model("Product", ProductSchema);
