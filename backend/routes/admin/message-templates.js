const express = require("express");
const fs = require("fs");
const path = require("path");
const templateRegistry = require("../../templates/templateRegistry");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const templates = await Promise.all(
      Object.entries(templateRegistry).map(async ([name, config]) => {
        const fileName = config?.file;
        const variables = config?.variables || [];
        const filePath = path.join(__dirname, "..", "..", "templates", fileName || "");

        let content = "";
        let loadError = "";

        try {
          content = fileName ? await fs.promises.readFile(filePath, "utf8") : "";
        } catch (error) {
          loadError = error.message;
        }

        return {
          name,
          file: fileName,
          variables,
          content,
          loadError,
        };
      }),
    );

    templates.sort((a, b) => a.name.localeCompare(b.name));
    res.sendSuccess({ templates });
  } catch (error) {
    console.error("Error fetching message templates:", error);
    res.sendError("Failed to fetch message templates", 500);
  }
});

module.exports = router;
