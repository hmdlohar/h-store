import { useOrderStore } from "@/store/orderStore";
import { useCommonStore } from "@/store/commonStore";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";

const PINCODE_API = "https://api.postalpincode.in/pincode/";

const AddressSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  mobile: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
    .required("Required"),
  pincode: Yup.string()
    .matches(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .required("Required"),
  home: Yup.string().required("Required"),
  area: Yup.string().required("Required"),
});

function fetchPinInfo(pincode) {
  return fetch(PINCODE_API + pincode)
    .then((res) => res.json())
    .then((data) => {
      if (
        data[0].Status === "Success" &&
        data[0].PostOffice &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        return { city: po.District, state: po.State };
      }
      throw new Error("Invalid pincode. Please check and try again.");
    });
}

export default function GetAddress() {
  const { order, setStep, setOrder } = useOrderStore();
  const { user } = useCommonStore();
  const userMobile = user && user.mobile ? user.mobile : "";

  const action = useMutation({
    mutationFn: async (values) => {
      const response = await ApiService.call(
        `/api/order/set-address/${order._id}`,
        "put",
        values
      );
      setOrder(response.data?.data);
      setStep(3);
      return response.data?.data;
    },
  });

  return (
    <Box maxWidth={400} mx="auto" mt={4}>
      <Typography variant="h6" mb={2}>
        Delivery Address
      </Typography>
      <Formik
        initialValues={{
          name: order?.deliveryAddress?.name || "",
          mobile:
            order?.deliveryAddress?.mobile || userMobile?.substring(2, 12),
          pincode: order?.deliveryAddress?.pincode || "",
          city: order?.deliveryAddress?.city || "",
          state: order?.deliveryAddress?.state || "",
          home: order?.deliveryAddress?.home || "",
          area: order?.deliveryAddress?.area || "",
        }}
        validationSchema={AddressSchema}
        onSubmit={(values) => {
          return action.mutateAsync(values);
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
          // React Query for pincode lookup
          const {
            data: pinData,
            error: pinQueryError,
            isLoading: pinLoading,
            isSuccess: pinSuccess,
            refetch,
            isFetching,
          } = useQuery({
            queryKey: ["pincode", values.pincode],
            queryFn: () => fetchPinInfo(values.pincode),
            enabled: values.pincode.length === 6,
            staleTime: 1000 * 60 * 10,
            retry: false,
          });

          // Autofill city/state when pinData changes
          if (
            pinSuccess &&
            pinData &&
            (values.city !== pinData.city || values.state !== pinData.state)
          ) {
            setFieldValue("city", pinData.city, false);
            setFieldValue("state", pinData.state, false);
          }
          if ((!pinSuccess || pinQueryError) && (values.city || values.state)) {
            setFieldValue("city", "", false);
            setFieldValue("state", "", false);
          }

          return (
            <Form autoComplete="off">
              <TextField
                name="pincode"
                label="Pincode"
                fullWidth
                margin="dense"
                value={values.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFieldValue("pincode", val);
                }}
                error={
                  Boolean(touched.pincode && errors.pincode) || !!pinQueryError
                }
                helperText={
                  (touched.pincode && errors.pincode) ||
                  (pinQueryError && values.pincode.length === 6
                    ? pinQueryError.message
                    : " ")
                }
                inputProps={{ maxLength: 6 }}
              />
              <LoadingErrorRQ
                q={{
                  error: pinQueryError,
                  isLoading: pinLoading || isFetching,
                }}
              />
              {pinSuccess && pinData && (
                <>
                  <TextField
                    name="city"
                    label="City"
                    fullWidth
                    margin="dense"
                    value={pinData.city}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    name="state"
                    label="State"
                    fullWidth
                    margin="dense"
                    value={pinData.state}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    name="country"
                    label="Country"
                    fullWidth
                    margin="dense"
                    value="India"
                    InputProps={{ readOnly: true }}
                  />
                </>
              )}
              {/* Show rest of address fields only if city/state are filled */}
              {pinSuccess && pinData && (
                <>
                  <TextField
                    name="home"
                    label="Home / Flat / House No."
                    fullWidth
                    margin="dense"
                    value={values.home}
                    onChange={(e) => setFieldValue("home", e.target.value)}
                    error={Boolean(touched.home && errors.home)}
                    helperText={touched.home && errors.home}
                  />
                  <TextField
                    name="area"
                    label="Area / Landmark"
                    fullWidth
                    margin="dense"
                    value={values.area}
                    onChange={(e) => setFieldValue("area", e.target.value)}
                    error={Boolean(touched.area && errors.area)}
                    helperText={touched.area && errors.area}
                  />

                  <TextField
                    name="name"
                    label="Recipient Name"
                    fullWidth
                    margin="dense"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    name="mobile"
                    label="Mobile Number"
                    fullWidth
                    margin="dense"
                    value={values.mobile}
                    onChange={(e) =>
                      setFieldValue("mobile", e.target.value.replace(/\D/g, ""))
                    }
                    error={Boolean(touched.mobile && errors.mobile)}
                    helperText={touched.mobile && errors.mobile}
                    inputProps={{ maxLength: 10 }}
                  />
                  <LoadingErrorRQ q={action} />
                  <Box mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}
