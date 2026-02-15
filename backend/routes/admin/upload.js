const express = require("express");
const router = express.Router();
const ImageKitService = require("../../services/ImageKitService");

// POST /api/admin/upload - Upload image to ImageKit
router.post("/", async (req, res) => {
  try {
    const { image, fileName, folder = "products" } = req.body;
    
    if (!image) {
      return res.sendError(null, "Image data is required", 400);
    }

    // Check if image is base64 data URL
    if (image.startsWith("data:image")) {
      // Extract base64 data from data URL
      const base64Data = image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      // Generate filename if not provided
      const finalFileName = fileName || `image-${Date.now()}.jpg`;
      
      // Upload to ImageKit
      const result = await ImageKitService.uploadImage(
        buffer,
        finalFileName,
        folder
      );
      
      return res.sendSuccess(
        { url: result.url, fileId: result.fileId, path: result.filePath },
        "Image uploaded successfully"
      );
    } else {
      // If it's already a URL (not base64), just return it
      return res.sendSuccess(
        { url: image, path: image },
        "Image URL saved"
      );
    }
  } catch (err) {
    console.error("Image upload error:", err);
    res.sendError(err, "Error uploading image", 500);
  }
});

module.exports = router;
