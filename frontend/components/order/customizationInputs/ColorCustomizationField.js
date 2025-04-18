import { Box, Chip, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import { parseErrorString } from "hyper-utils";

export default function ColorCustomizationField({
  field,
  label,
  required,
  options,
}) {
  const formik = useFormikContext();

  return (
    <Box my={2}>
      <Typography gutterBottom>{label}</Typography>
      {formik.touched[field] && formik.errors[field] && (
        <Typography variant="body2" color="error">
          {parseErrorString(formik.errors[field])}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {options.map((opt) => (
          <Chip
            key={opt.code}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: opt.code,
                    mr: 1,
                  }}
                />
                {opt.name}
              </Box>
            }
            sx={{
              ...(formik.values[field] === opt.code && {
                border: "2px solid #333",
              }),
            }}
            onClick={() => formik.setFieldValue(field, opt.code)}
          />
        ))}
      </Box>
    </Box>
  );
}
