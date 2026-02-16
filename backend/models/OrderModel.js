var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  orderNumber: {
    type: String,
    required: true,
    default: function () {
      // Generate a random string for order number
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      return `${randomString}`;
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
  userID: {
    type: String,
  },
  pg: {
    type: String,
    default: "cashfree",
  },
  pgOrderID: {
    type: String,
  },
});

ProductSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const { getCommonValue, setCommonValue } = require("./CommonModel");
    const lastOrderNumber =
      (await getCommonValue("lastOrderNumber")) || "10000";
    const nextOrderNumber = (parseInt(lastOrderNumber) + 1).toString();

    // Set the new _id with prefix ORD and padded number
    this.orderNumber = nextOrderNumber;

    // Save the new last order number
    await setCommonValue("lastOrderNumber", nextOrderNumber);

    next();
  } catch (error) {
    next(error);
  }
});

//console.log(ProductSchema.statics);
module.exports = mongoose.model("Order", ProductSchema);
