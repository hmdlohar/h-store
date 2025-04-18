import { TextField } from "@mui/material";
import { useField } from "formik";

export default function TextCustomizationField({
  field,
  label,
  required,
  info,
}) {
  const [formikField, meta] = useField(field);
  return (
    <TextField
      {...formikField}
      onChange={(e) => {
        if (info?.uppercase) {
          e.target.value = e.target.value.toUpperCase();
        }
        formikField.onChange(e);
      }}
      label={label}
      fullWidth
      margin="normal"
      error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error}
    />
  );
}
