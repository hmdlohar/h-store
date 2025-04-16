var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      tax: {
        type: Object,
      },
    },
  ],
  subTotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Object,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//console.log(ProductSchema.statics);
module.exports = mongoose.model("Product", ProductSchema);
