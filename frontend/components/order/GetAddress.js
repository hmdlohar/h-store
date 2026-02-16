import { useOrderStore } from "@/store/orderStore";
import { useCommonStore } from "@/store/commonStore";
import { useState } from "react";
import { useFormik } from "formik";
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
  email: Yup.string().email("Enter a valid email address").nullable(),
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
  const { order, setStep, setOrder, product } = useOrderStore();
  const { user } = useCommonStore();
  const userMobile = user && user.mobile ? user.mobile : "";

  const existingAddress = useQuery({
    queryKey: ["existing-address", order._id],
    queryFn: async () => {
      const res = await ApiService.call(
        `/api/user/get-existing-address`,
        "get"
      );

      if (res) {
        formik.setValues(res);
      }
      return res;
    },
    enabled: !!user,
  });

  const action = useMutation({
    mutationFn: async (values) => {
      const response = await ApiService.call(
        `/api/order/set-address/${order._id}`,
        "put",
        values
      );
      setOrder(response);
      setStep(3);
      return response;
    },
  });

  const formik = useFormik({
    initialValues: {
      name: order?.deliveryAddress?.name || "",
      mobile: order?.deliveryAddress?.mobile || userMobile?.substring(2, 12),
      pincode: order?.deliveryAddress?.pincode || "",
      city: order?.deliveryAddress?.city || "",
      state: order?.deliveryAddress?.state || "",
      home: order?.deliveryAddress?.home || "",
      area: order?.deliveryAddress?.area || "",
      email: order?.deliveryAddress?.email || user?.email || "",
    },
    validationSchema: AddressSchema,
    onSubmit: (values) => {
      return action.mutateAsync(values);
    },
  });

  // React Query for pincode lookup
  const {
    data: pinData,
    error: pinQueryError,
    isLoading: pinLoading,
    isSuccess: pinSuccess,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["pincode", formik.values.pincode],
    queryFn: () => fetchPinInfo(formik.values.pincode),
    enabled: formik.values.pincode.length === 6,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // Autofill city/state when pinData changes
  if (
    pinSuccess &&
    pinData &&
    (formik.values.city !== pinData.city ||
      formik.values.state !== pinData.state)
  ) {
    formik.setFieldValue("city", pinData.city, false);
    formik.setFieldValue("state", pinData.state, false);
  }
  if (
    (!pinSuccess || pinQueryError) &&
    (formik.values.city || formik.values.state)
  ) {
    formik.setFieldValue("city", "", false);
    formik.setFieldValue("state", "", false);
  }

  return (
    <Box maxWidth={400} mx="auto" mt={2}>
      <Typography variant="h6" mb={1}>
        Delivery Address
      </Typography>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        {user && <LoadingErrorRQ q={existingAddress} />}
        <TextField
          name="pincode"
          label="Pincode"
          fullWidth
          margin="dense"
          value={formik.values.pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            formik.setFieldValue("pincode", val);
          }}
          error={
            Boolean(formik.touched.pincode && formik.errors.pincode) ||
            !!pinQueryError
          }
          helperText={
            (formik.touched.pincode && formik.errors.pincode) ||
            (pinQueryError && formik.values.pincode.length === 6
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
        {pinSuccess && pinData && (
          <>
            <TextField
              name="home"
              label="Home / Flat / House No."
              fullWidth
              margin="dense"
              value={formik.values.home}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.home && formik.errors.home)}
              helperText={formik.touched.home && formik.errors.home}
            />
            <TextField
              name="area"
              label="Area / Landmark"
              fullWidth
              margin="dense"
              value={formik.values.area}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.area && formik.errors.area)}
              helperText={formik.touched.area && formik.errors.area}
            />

            <TextField
              name="name"
              label="Recipient Name"
              fullWidth
              margin="dense"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              name="mobile"
              label="Mobile Number"
              fullWidth
              margin="dense"
              value={formik.values.mobile}
              onChange={(e) =>
                formik.setFieldValue(
                  "mobile",
                  e.target.value.replace(/\D/g, "")
                )
              }
              error={Boolean(formik.touched.mobile && formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              name="email"
              label="Email Address (Optional)"
              fullWidth
              margin="dense"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.email && formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <LoadingErrorRQ q={action} />
            <Box mt={1}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={formik.isSubmitting}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </form>
    </Box>
  );
}
