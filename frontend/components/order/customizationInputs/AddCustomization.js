import { useOrderStore } from "@/store/orderStore";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextCustomizationField from "./TextCustomizationField";
import ColorCustomizationField from "./ColorCustomizationField";
import ImageCustomizationField from "./ImageCustomizationField";
import { Box } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { ApiService } from "@/services/ApiService";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import OrderStepWrapper from "../OrderStepWrapper";
import { useRef, useState } from "react";

export default function AddCustomization() {
  const { order, product, setOrder, setStep, step, hasVariants } = useOrderStore();
  const customizations = product?.customizations || [];
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleBack = () => setStep(step - 1);

  const handleContinue = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setIsSubmitting(true);
    action.mutate(values, {
      onSettled: () => {
        setSubmitting(false);
        setIsSubmitting(false);
      },
    });
  };

  return (
    <OrderStepWrapper
      title="Customize Your Order"
      onBack={handleBack}
      onContinue={handleContinue}
      showBack={true}
      backText="Back"
      continueText="Continue"
      continueLoading={isSubmitting}
    >
      <Formik
        innerRef={formRef}
        initialValues={initial}
        validationSchema={Yup.object().shape(shape)}
        onSubmit={handleSubmit}
      >
        {({ isValid }) => (
          <Form>
            {customizations.map((c) => {
              if (c.fieldType === "text" || c.fieldType === "text_alphabet")
                return (
                  <TextCustomizationField
                    key={c.field}
                    field={c.field}
                    label={c.label}
                    description={c.description}
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
                    description={c.description}
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
                    description={c.description}
                    required={c.required}
                    imageOptions={c.imageOptions}
                  />
                );
              return null;
            })}
            
            <LoadingErrorRQ q={action} />
          </Form>
        )}
      </Formik>
    </OrderStepWrapper>
  );
}
