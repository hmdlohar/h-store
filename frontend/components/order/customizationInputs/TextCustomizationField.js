import { TextField, Typography, Box } from "@mui/material";
import { useField } from "formik";

export default function TextCustomizationField({
  field,
  label,
  description,
  required,
  info,
  alphabetOnly,
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
    <Box mb={2}>
      <TextField
        {...formikField}
        onChange={(e) => {
          let value = e.target.value;
          if (info?.uppercase) {
            value = value.toUpperCase();
          }
          if (alphabetOnly) {
            value = value.replace(/[^a-zA-Z]/g, "");
          }
          e.target.value = value;
          formikField.onChange(e);
        }}
        label={label}
        fullWidth
        margin="dense"
        error={Boolean(meta.touched && meta.error) || isOverLimit || isUnderMin}
        helperText={
          <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
            <span>{getHelperText()}</span>
            {description && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                {description}
              </Typography>
            )}
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
    </Box>
  );
}
