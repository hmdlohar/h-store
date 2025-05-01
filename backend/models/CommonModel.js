var mongoose = require("mongoose");

var CommonSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return new mongoose.Types.ObjectId();
    },
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  info: {
    type: Object,
    default: {},
  },
});

//console.log(ProductSchema.statics);
const CommonModel = mongoose.model("Common", CommonSchema);

async function getCommonValue(key) {
  const common = await CommonModel.findOne({ _id: key });
  return common?.value;
}

async function setCommonValue(key, value) {
  await CommonModel.updateOne(
    { _id: key },
    { $set: { value } },
    { upsert: true }
  );
}

module.exports = { getCommonValue, setCommonValue };
