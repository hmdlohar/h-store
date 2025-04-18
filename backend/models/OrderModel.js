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
      variant: {
        type: String,
      },
      customization: {
        type: Object,
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
  deliveryAddress: Object,
  billingAddress: Object,
  status: {
    type: String,
    default: "pending",
  },
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
  info: {
    type: Object,
    default: {},
  },
});

//console.log(ProductSchema.statics);
module.exports = mongoose.model("Order", ProductSchema);
