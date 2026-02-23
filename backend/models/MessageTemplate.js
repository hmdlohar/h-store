const mongoose = require("mongoose");

const MessageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["sms", "email", "whatsapp"],
  },
  subject: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    required: true,
  },
  variables: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

MessageTemplateSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  this.variables = this.extractVariables(this.content);
  if (this.subject) {
    this.variables = [...new Set([...this.variables, ...this.extractVariables(this.subject)])];
  }
  next();
});

MessageTemplateSchema.methods.extractVariables = function (text) {
  if (!text) return [];
  const regex = /\$\{([^}]+)\}/g;
  const vars = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    vars.push(match[1]);
  }
  return vars;
};

module.exports = mongoose.model("MessageTemplate", MessageTemplateSchema);
