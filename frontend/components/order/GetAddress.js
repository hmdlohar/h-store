import { useOrderStore } from "@/store/orderStore";
import { useCommonStore } from "@/store/commonStore";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, TextField, Typography, Paper, CircularProgress } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import OrderStepWrapper from "./OrderStepWrapper";

const PINCODE_API = "https://api.postalpincode.in/pincode/";

const AddressSchema = Yup.object().shape({
  name: Yup.string().required("Please enter recipient name"),
  mobile: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
    .required("Please enter mobile number"),
  pincode: Yup.string()
    .matches(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .required("Please enter pincode"),
  city: Yup.string().required("Please enter city"),
  state: Yup.string().required("Please enter state"),
  home: Yup.string().required("Please enter house/flat number"),
  area: Yup.string().required("Please enter area or landmark"),
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
        return { city: po.District, state: po.State, pincode };
      }
      return null;
    })
    .catch(() => null);
}

export default function GetAddress() {
  const { order, setStep, setOrder, product, step, hasVariants } = useOrderStore();
  const { user } = useCommonStore();
  const userMobile = user && user.mobile ? user.mobile : "";
  
  const [pincodeManual, setPincodeManual] = useState(false);

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
      setStep(hasVariants ? 2 : 2);
      return response;
    },
  });

  const formik = useFormik({
    initialValues: {
      name: order?.deliveryAddress?.name || "",
      mobile: order?.deliveryAddress?.mobile || userMobile?.substring(2, 12) || "",
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

  const {
    data: pinData,
    error: pinQueryError,
    isLoading: pinLoading,
    isSuccess: pinSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["pincode", formik.values.pincode],
    queryFn: () => fetchPinInfo(formik.values.pincode),
    enabled: formik.values.pincode.length === 6 && !pincodeManual,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  if (
    pinSuccess &&
    pinData &&
    (formik.values.city !== pinData.city ||
      formik.values.state !== pinData.state) &&
    !pincodeManual
  ) {
    formik.setFieldValue("city", pinData.city, false);
    formik.setFieldValue("state", pinData.state, false);
  }

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    formik.setFieldValue("pincode", val);
    if (val.length !== 6) {
      formik.setFieldValue("city", "", false);
      formik.setFieldValue("state", "", false);
    }
  };

  const showAddressFields = pinSuccess && pinData && !pincodeManual;

  const handleBack = () => setStep(step - 1);
  const handleContinue = () => formik.handleSubmit();
  const canContinue = formik.isValid && !formik.isSubmitting;
  const showBack = step > 1;

  return (
    <OrderStepWrapper
      title="Where should we deliver?"
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      continueLoading={formik.isSubmitting}
      showBack={showBack}
    >
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        {user && <LoadingErrorRQ q={existingAddress} />}
        
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonIcon sx={{ color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Contact Details
            </Typography>
          </Box>
          
          <TextField
            name="name"
            label="Full Name"
            placeholder="Enter recipient's full name"
            fullWidth
            margin="dense"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: 1 }}
          />
          
          <TextField
            name="mobile"
            label="Mobile Number"
            placeholder="10-digit mobile number"
            fullWidth
            margin="dense"
            value={formik.values.mobile}
            onChange={(e) =>
              formik.setFieldValue(
                "mobile",
                e.target.value.replace(/\D/g, "")
              )
            }
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.mobile && formik.errors.mobile)}
            helperText={(formik.touched.mobile && formik.errors.mobile) || "We'll call for delivery updates"}
            inputProps={{ maxLength: 10 }}
            sx={{ mb: 1 }}
          />
          
          <TextField
            name="email"
            label="Email Address"
            placeholder="order confirmation (optional)"
            fullWidth
            margin="dense"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.email && formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LocationOnIcon sx={{ color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Delivery Address
            </Typography>
          </Box>
          
          <TextField
            name="home"
            label="House No. / Building Name"
            placeholder="Flat No., Building Name"
            fullWidth
            margin="dense"
            value={formik.values.home}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.home && formik.errors.home)}
            helperText={formik.touched.home && formik.errors.home}
            sx={{ mb: 1 }}
          />
          
          <TextField
            name="area"
            label="Area, Colony, Street"
            placeholder="Street name, colony, area"
            fullWidth
            margin="dense"
            value={formik.values.area}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.area && formik.errors.area)}
            helperText={formik.touched.area && formik.errors.area}
            sx={{ mb: 1 }}
          />
          
          <TextField
            name="pincode"
            label="Pincode"
            placeholder="6-digit pincode"
            fullWidth
            margin="dense"
            value={formik.values.pincode}
            onChange={handlePincodeChange}
            onBlur={formik.handleBlur}
            error={
              Boolean(formik.touched.pincode && formik.errors.pincode) ||
              (pinQueryError && formik.values.pincode.length === 6)
            }
            helperText={
              (formik.touched.pincode && formik.errors.pincode) ||
              (pinQueryError && formik.values.pincode.length === 6
                ? "Enter valid pincode or fill manually"
                : pinLoading || isFetching
                ? "Checking pincode..."
                : " ")
            }
            inputProps={{ maxLength: 6 }}
            InputProps={{
              endAdornment: (pinLoading || isFetching) && (
                <CircularProgress size={20} />
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box display="flex" gap={1} alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {pincodeManual ? "Enter city manually" : "Or enter manually:"}
            </Typography>
            <Typography
              component="button"
              variant="body2"
              onClick={() => {
                setPincodeManual(!pincodeManual);
                if (pincodeManual) {
                  formik.setFieldValue("city", "", false);
                  formik.setFieldValue("state", "", false);
                }
              }}
              sx={{ 
                textDecoration: 'underline', 
                cursor: 'pointer', 
                color: 'primary.main',
                border: 'none',
                bgcolor: 'transparent',
                p: 0,
                font: 'inherit'
              }}
            >
              {pincodeManual ? "Auto-detect from pincode" : "Enter manually"}
            </Typography>
          </Box>

          {(showAddressFields || pincodeManual) && (
            <Box sx={{ mt: 1 }}>
              <Box display="flex" gap={2}>
                <TextField
                  name="city"
                  label="City"
                  placeholder="City"
                  fullWidth
                  margin="dense"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.city && formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                  disabled={!pincodeManual}
                />
                <TextField
                  name="state"
                  label="State"
                  placeholder="State"
                  fullWidth
                  margin="dense"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.state && formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                  disabled={!pincodeManual}
                />
              </Box>
            </Box>
          )}
        </Paper>

        <LoadingErrorRQ q={action} />
      </form>
    </OrderStepWrapper>
  );
}
