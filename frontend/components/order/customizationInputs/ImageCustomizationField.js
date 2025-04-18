import EcomImage from "@/common/EcomImage";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slider,
  Alert,
  Stack,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { CommonUtils, parseErrorString } from "hyper-utils";

export default function ImageCustomizationField({
  field,
  label,
  required,
  imageOptions,
  info,
}) {
  const aspect = info?.aspectRatio || 1;
  const formik = useFormikContext();
  const { order } = useOrderStore();

  // Cropper dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Open crop dialog on file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Called by cropper
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Crop and resize image in browser
  async function getCroppedResizedBlob(imageSrc, crop, aspect) {
    // Load image
    const img = await new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageSrc;
    });
    const maxDim = 1500;
    const cropW = crop.width;
    const cropH = crop.height;
    // Resize logic
    let outW = cropW;
    let outH = cropH;
    if (cropW > maxDim || cropH > maxDim) {
      if (cropW > cropH) {
        outW = maxDim;
        outH = Math.round((cropH / cropW) * maxDim);
      } else {
        outH = maxDim;
        outW = Math.round((cropW / cropH) * maxDim);
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outW,
      outH
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }

  const action = useMutation({
    mutationFn: async (fileBlob) => {
      const formData = new FormData();
      formData.append("file", fileBlob, "cropped.jpg");
      formData.append("orderID", order?._id);
      const response = await ApiService.callWithFormData(
        "/api/order/upload-image",
        formData
      );
      if (!response?.data?.data?.filePath) {
        throw new Error(`Error uploading image. No path`);
      }
      formik.setFieldValue(field, response.data?.data?.filePath);
      return response.data?.data;
    },
  });

  // Handle crop confirm
  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setCropDialogOpen(false);
    // Crop and resize
    const blob = await getCroppedResizedBlob(
      cropSrc,
      croppedAreaPixels,
      aspect
    );
    action.mutate(blob, {
      onSuccess: () => {
        setSuccessMsg("Image uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      },
    });
    // Reset crop state
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  // Helper for aspect string
  const aspectStr =
    aspect === 1
      ? "1:1 (square)"
      : aspect === 16 / 9
      ? "16:9"
      : aspect === 4 / 3
      ? "4:3"
      : aspect === 3 / 4
      ? "3:4"
      : `${aspect}:1`;

  return (
    <Box my={2}>
      <Typography gutterBottom>{label}</Typography>

      <LoadingErrorRQ q={action} />
      {formik.values[field] && (
        <EcomImage
          path={formik.values[field]}
          alt={label}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      )}
      <Button
        fullWidth
        variant="outlined"
        component="label"
        disabled={action.isPending}
      >
        {formik.values[field] ? "Change Image" : "Upload Image"}
        <input
          type="file"
          hidden
          onChange={handleFileChange}
          accept="image/*"
        />
      </Button>
      {/* Cropper dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent
          sx={{ position: "relative", height: 400, bgcolor: "#222" }}
        >
          <Alert severity="info" sx={{ mb: 2 }}>
            Crop the image to <b>{aspectStr}</b> aspect ratio. You can zoom and
            move the crop area.
            <br />
            The result will be resized to max 1500px.
          </Alert>
          {cropSrc && (
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={true}
              style={{ containerStyle: { background: "#222" } }}
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 2,
            px: 3,
            pb: 3,
          }}
        >
          <Typography gutterBottom>
            Adjust the photo to make sure you get the subject in the focus
          </Typography>
          <Box sx={{ width: "100%", mb: 2 }}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(_, v) => setZoom(v)}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={() => setCropDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCropConfirm}
            >
              Crop & Upload
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {formik?.errors?.[field] && (
        <Typography color="error">
          {parseErrorString(formik?.errors?.[field])}
        </Typography>
      )}
    </Box>
  );
}
