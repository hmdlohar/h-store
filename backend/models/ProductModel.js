var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  mrp: Number,
  price: Number,
  mainImage: {
    imagePath: String,
  },
  images: [
    {
      imagePath: {
        type: String,
        required: true,
      },
    },
  ],
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
});

//console.log(ProductSchema.statics);
module.exports = mongoose.model("Product", ProductSchema);
