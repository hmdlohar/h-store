import { useOrderStore } from "@/store/orderStore";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextCustomizationField from "./TextCustomizationField";
import ColorCustomizationField from "./ColorCustomizationField";
import ImageCustomizationField from "./ImageCustomizationField";
import { Button, Box, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";

export default function AddCustomization() {
  const { order, product, setOrder, setStep, step } = useOrderStore();
  const customizations = product?.customizations || [];
  const hasVariants = Object.keys(product?.variants || {}).length > 0;
  const action = useMutation({
    mutationFn: async (values) => {
      const response = await ApiService.call(
        `/api/order/set-customization/${order._id}/${product._id}`,
        "put",
        values
      );
      setOrder(response);
      setStep(hasVariants ? 4 : 3);
      return response;
    },
  });

  const shape = {};
  customizations.forEach((c) => {
    let validator = c.fieldType === "image" ? Yup.mixed() : Yup.string();
    let minlength = c.info?.minLength;
    let maxlength = c.info?.maxLength;
    if (order?.info?.variant && (c.fieldType === "text" || c.fieldType === "text_alphabet")) {
      const objVariant = product.variants?.[order.info.variant];
      if (objVariant?.maxLength) {
        maxlength = objVariant.maxLength;
      }
      if (objVariant?.minLength) {
        minlength = objVariant.minLength;
      }
    }
    if (minlength) {
      validator = validator.min(
        minlength,
        `Can not add less than ${minlength} characters. You may choose different variant.`
      );
    }
    if (maxlength) {
      validator = validator.max(
        maxlength,
        `Can not add more than ${maxlength} characters. You may choose different variant.`
      );
    }
    if (c.required) validator = validator.required("Required");
    shape[c.field] = validator;
  });

  const initial = {};
  customizations.forEach((c) => {
    initial[c.field] = c.fieldType === "image" ? null : "";
    if (order?.items?.[0]?.customization?.[c.field]) {
      initial[c.field] = order.items[0].customization[c.field];
    }
  });

  return (
    <Box>
      <Typography variant="h6" mb={1}>
        Add Customization Details
      </Typography>
      <Formik
        initialValues={initial}
        validationSchema={Yup.object().shape(shape)}
        onSubmit={(values) => {
          return action.mutateAsync(values);
        }}
      >
        {({ isSubmitting, isValid, values, errors }) => (
          <Form>
            {customizations.map((c) => {
              // console.log(values, errors, "form");
              if (c.fieldType === "text" || c.fieldType === "text_alphabet")
                return (
                  <TextCustomizationField
                    key={c.field}
                    field={c.field}
                    label={c.label}
                    required={c.required}
                    info={c.info}
                    alphabetOnly={c.fieldType === "text_alphabet"}
                  />
                );
              if (c.fieldType === "color")
                return (
                  <ColorCustomizationField
                    key={c.field}
                    field={c.field}
                    label={c.label}
                    required={c.required}
                    options={c.options}
                  />
                );
              if (c.fieldType === "image")
                return (
                  <ImageCustomizationField
                    key={c.field}
                    field={c.field}
                    label={c.label}
                    required={c.required}
                    imageOptions={c.imageOptions}
                  />
                );
              return null;
            })}
            <LoadingErrorRQ q={action} />
            <Box mt={1} display="flex" justifyContent="space-between" gap={2}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting || (!hasVariants && step <= 1)}
                sx={{
                  py: 1.5,
                  borderRadius: "100px",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !isValid}
                sx={{
                  py: 1.5,
                  borderRadius: "100px",
                  fontWeight: 700,
                  bgcolor: "#FFD814",
                  color: "#0F1111",
                  border: "1px solid #FCD200",
                  boxShadow: "0 2px 5px 0 rgba(213,217,217,.5)",
                  "&:hover": {
                    bgcolor: "#F7CA00",
                    borderColor: "#F2C200",
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
