import { Box, Typography, Button } from "@mui/material";
import { useField } from "formik";

export default function ImageCustomizationField({ field, label, required, imageOptions }) {
  const [formikField, , helpers] = useField(field);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      helpers.setValue(file);
    }
  };

  return (
    <Box my={2}>
      <Typography gutterBottom>{label}</Typography>
      <Button variant="outlined" component="label">
        Upload Image
        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
      </Button>
      {formikField.value && (
        <Typography variant="body2" mt={1}>
          {typeof formikField.value === "string" ? formikField.value : formikField.value.name}
        </Typography>
      )}
    </Box>
  );
}
