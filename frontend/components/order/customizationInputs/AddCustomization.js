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

function getInitialValues(customizations) {
  const initial = {};
  customizations.forEach((c) => {
    initial[c.field] = c.fieldType === "image" ? null : "";
  });
  return initial;
}

export default function AddCustomization() {
  const { order, product, setOrder, setStep } = useOrderStore();
  const customizations = product?.customizations || [];
  const action = useMutation({
    mutationFn: async (values) => {
      const response = await ApiService.call(
        `/api/order/set-customization/${order._id}/${product._id}`,
        "put",
        values
      );
      setOrder(response.data?.data);
      setStep(2);
      return response.data?.data;
    },
  });

  const shape = {};
  customizations.forEach((c) => {
    let validator = c.fieldType === "image" ? Yup.mixed() : Yup.string();
    if (order?.info?.variant && c.fieldType === "text") {
      const objVariant = product.variants?.[order.info.variant];
      if (objVariant?.maxLength) {
        validator = validator.max(
          objVariant.maxLength,
          `Can not add more than ${objVariant.maxLength} characters. You may choose different variant.`
        );
      }
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
      <Typography variant="h6" mb={2}>
        Add Customization
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
              if (c.fieldType === "text")
                return (
                  <TextCustomizationField
                    key={c.field}
                    field={c.field}
                    label={c.label}
                    required={c.required}
                    info={c.info}
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
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || !isValid}
                fullWidth
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
