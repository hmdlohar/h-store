import EcomImage from "@/common/EcomImage";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useOrderStore } from "@/store/orderStore";
import { Box, Typography, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { CommonUtils, parseErrorString } from "hyper-utils";

export default function ImageCustomizationField({
  field,
  label,
  required,
  imageOptions,
}) {
  const formik = useFormikContext();
  const { order } = useOrderStore();

  const action = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
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
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              action.mutateAsync(file);
            }
          }}
        />
      </Button>
      {formik?.errors?.[field] && (
        <Typography color="error">
          {parseErrorString(formik?.errors?.[field])}
        </Typography>
      )}
    </Box>
  );
}
