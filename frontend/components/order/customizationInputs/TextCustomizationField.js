import { TextField, Typography, Box } from "@mui/material";
import { useField } from "formik";

export default function TextCustomizationField({
  field,
  label,
  required,
  info,
}) {
  const [formikField, meta] = useField(field);
  const currentLength = formikField.value?.length || 0;
  const maxLength = info?.maxLength;
  const minLength = info?.minLength;
  
  const getHelperText = () => {
    if (meta.touched && meta.error) {
      return meta.error;
    }
    
    let text = "";
    if (minLength && maxLength) {
      text = `${currentLength}/${maxLength} characters (min: ${minLength})`;
    } else if (maxLength) {
      text = `${currentLength}/${maxLength} characters`;
    } else if (minLength) {
      text = `${currentLength} characters (min: ${minLength})`;
    }
    
    return text;
  };
  
  const isOverLimit = maxLength && currentLength > maxLength;
  const isUnderMin = minLength && currentLength < minLength && currentLength > 0;
  
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
      margin="dense"
      error={Boolean(meta.touched && meta.error) || isOverLimit || isUnderMin}
      helperText={
        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{getHelperText()}</span>
          {(isOverLimit || isUnderMin) && (
            <Typography component="span" color="error" variant="caption">
              {isOverLimit ? 'Too long' : 'Too short'}
            </Typography>
          )}
        </Box>
      }
      inputProps={{
        maxLength: maxLength,
      }}
    />
  );
}
