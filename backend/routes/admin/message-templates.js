const express = require("express");
const router = express.Router();
const MessageTemplate = require("../../models/MessageTemplate");

router.get("/", async (req, res) => {
  const { page = 1, pageSize = 20, search, type, isActive } = req.query;

  try {
    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      matchConditions.type = type;
    }

    if (isActive !== undefined) {
      matchConditions.isActive = isActive === "true";
    }

    const templates = await MessageTemplate.find(matchConditions)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    const total = await MessageTemplate.countDocuments(matchConditions);

    res.sendSuccess({
      templates,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching message templates:", error);
    res.sendError("Failed to fetch message templates", 500);
  }
});

router.post("/", async (req, res) => {
  const { name, type, subject, content, isActive } = req.body;

  if (!name || !type || !content) {
    return res.sendError("Name, type, and content are required", 400);
  }

  if (!["sms", "email", "whatsapp"].includes(type)) {
    return res.sendError("Invalid type. Must be sms, email, or whatsapp", 400);
  }

  try {
    const existing = await MessageTemplate.findOne({ name });
    if (existing) {
      return res.sendError("Template with this name already exists", 400);
    }

    const template = new MessageTemplate({
      name,
      type,
      subject,
      content,
      isActive,
    });
    await template.save();

    res.sendSuccess(template, "Template created successfully");
  } catch (error) {
    console.error("Error creating message template:", error);
    res.sendError("Failed to create message template", 500);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, subject, content, isActive } = req.body;

  try {
    const updateData = {};

    if (name) {
      const existing = await MessageTemplate.findOne({ name, _id: { $ne: id } });
      if (existing) {
        return res.sendError("Template with this name already exists", 400);
      }
      updateData.name = name;
    }

    if (type) {
      if (!["sms", "email", "whatsapp"].includes(type)) {
        return res.sendError("Invalid type. Must be sms, email, or whatsapp", 400);
      }
      updateData.type = type;
    }

    if (subject !== undefined) updateData.subject = subject;
    if (content) updateData.content = content;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await MessageTemplate.findByIdAndUpdate(id, updateData, { new: true });

    if (!template) {
      return res.sendError("Template not found", 404);
    }

    res.sendSuccess(template, "Template updated successfully");
  } catch (error) {
    console.error("Error updating message template:", error);
    res.sendError("Failed to update message template", 500);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const template = await MessageTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.sendError("Template not found", 404);
    }

    res.sendSuccess(null, "Template deleted successfully");
  } catch (error) {
    console.error("Error deleting message template:", error);
    res.sendError("Failed to delete message template", 500);
  }
});

router.post("/preview", async (req, res) => {
  const { content, subject, variables } = req.body;

  if (!content) {
    return res.sendError("Content is required", 400);
  }

  try {
    const regex = /\$\{([^}]+)\}/g;
    const foundVariables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }
    if (subject) {
      while ((match = regex.exec(subject)) !== null) {
        foundVariables.push(match[1]);
      }
    }

    const uniqueVars = [...new Set(foundVariables)];

    const previewContent = content.replace(/\$\{([^}]+)\}/g, (full, varName) => {
      return variables && variables[varName] !== undefined ? variables[varName] : full;
    });

    const previewSubject = subject ? subject.replace(/\$\{([^}]+)\}/g, (full, varName) => {
      return variables && variables[varName] !== undefined ? variables[varName] : full;
    }) : "";

    res.sendSuccess({
      variables: uniqueVars,
      preview: {
        subject: previewSubject,
        content: previewContent,
      },
    });
  } catch (error) {
    console.error("Error previewing template:", error);
    res.sendError("Failed to preview template", 500);
  }
});

module.exports = router;
