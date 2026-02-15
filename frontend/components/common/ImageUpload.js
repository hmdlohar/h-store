"use client";

import React, { useState, useCallback, useRef } from "react";
import { 
  Box, 
  Button, 
  IconButton, 
  Paper, 
  Typography, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import Cropper from "react-easy-crop";
import { LocalStorageUtils } from "hyper-utils";

export default function ImageUpload({
  value,
  onChange,
  aspectRatio,
  label,
  disabled = false,
  error = false,
  helperText,
  size = "medium",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [src, setSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, "Type:", file.type, "aspectRatio prop:", aspectRatio);

    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      console.log("File loaded successfully");
      setSrc(reader.result);
      
      if (aspectRatio && aspectRatio > 0) {
        console.log("Opening crop modal - aspectRatio is:", aspectRatio);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setIsCropModalOpen(true);
      } else {
        console.log("No cropping needed - uploading directly");
        handleUpload(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      alert("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!src || !croppedAreaPixels) {
      console.log("Missing src or croppedAreaPixels");
      return;
    }

    setLoading(true);
    try {
      const croppedImage = await getCroppedImg(src, croppedAreaPixels);
      if (croppedImage) {
        await handleUpload(croppedImage);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Error processing image");
    } finally {
      setLoading(false);
      setIsCropModalOpen(false);
      setSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (imageData) => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const token = LocalStorageUtils.lsGet('authToken') || '';
      
      console.log("Uploading image...", backendUrl);
      
      const response = await fetch(`${backendUrl}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          image: imageData,
          fileName: `product-${Date.now()}.jpg`,
          folder: 'products'
        })
      });

      const data = await response.json();
      
      if (data.status) {
        console.log("Upload successful:", data.data.path);
        onChange(data.data.path);
      } else {
        console.error("Upload failed:", data.msg);
        alert('Failed to upload image: ' + (data.msg || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setSrc(null);
    setIsCropModalOpen(false);
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: 100, height: 100 };
      case "large":
        return { width: 200, height: 200 };
      default:
        return { width: 150, height: 150 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <>
      <Box>
        {label && (
          <Typography
            variant="body2"
            sx={{ mb: 1, display: "block", color: error ? "error.main" : "text.secondary" }}
          >
            {label}
            {helperText && (
              <Typography
                variant="caption"
                component="span"
                sx={{ pl: 0.5 }}
              >
                {helperText}
              </Typography>
            )}
          </Typography>
        )}
        
        <Paper
          elevation={2}
          sx={{
            p: 1,
            border: error ? "1px solid red" : "1px dashed #ccc",
            width: sizeStyles.width,
            height: sizeStyles.height,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled || loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            position: "relative",
            bgcolor: disabled ? "action.disabled" : "background.paper",
            opacity: loading ? 0.6 : 1,
            "&:hover": {
              bgcolor: disabled ? "action.disabled" : "grey.50",
              borderColor: disabled ? "action.disabled" : "grey.400",
            },
          }}
          onClick={() => {
            if (!disabled && !loading && !value) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: "none" }}
            disabled={disabled || loading}
          />

          {value ? (
            <>
              <img
                src={value.startsWith('http') ? value : `https://ik.imagekit.io/id4vmvhgeh/${value}?tr=w-${sizeStyles.width},h-${sizeStyles.height}`}
                alt="Uploaded"
                style={{
                  width: sizeStyles.width - 8,
                  height: sizeStyles.height - 8,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 1)",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                disabled={loading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          ) : loading ? (
            <CircularProgress size={40} />
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <AddIcon
                sx={{
                  fontSize: sizeStyles.width / 3,
                  color: "grey.400",
                }}
              />
              <Typography
                variant="caption"
                sx={{ mt: 1, color: "grey.600", display: "block" }}
              >
                {aspectRatio ? 'Click to upload & crop' : 'Click to upload'}
              </Typography>
            </Box>
          )}
        </Paper>
        
        {error && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
            {helperText}
          </Typography>
        )}
      </Box>

      {/* Crop Modal - Rendered at top level */}
      <Dialog
        open={isCropModalOpen}
        onClose={handleCropCancel}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={false}
      >
        <DialogTitle>
          Crop Image
          {aspectRatio && (
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              (Aspect ratio: {aspectRatio === 1 ? '1:1 (Square)' : aspectRatio.toFixed(2)})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
          {src && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 64,
                }}
              >
                <Cropper
                  image={src}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 2,
                  pb: 1,
                }}
              >
                <Typography variant="caption" gutterBottom display="block">
                  Zoom
                </Typography>
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e, value) => setZoom(value)}
                  disabled={loading}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCropCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCropConfirm}
            variant="contained"
            color="primary"
            disabled={loading || !croppedAreaPixels}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Processing...' : 'Crop & Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
