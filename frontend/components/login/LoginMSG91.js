import { ApiService } from "@/services/ApiService";
import { useCommonStore } from "@/store/commonStore";
import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";

function openOTPDialog() {
  return new Promise((resolve, reject) => {
    const configuration = {
      widgetId: "356472656568393834363534",
      tokenAuth: "268957TNqdGIyyf6801ddc3P1",
      identifier: "",
      exposeMethods: false, // When true will expose the methods for OTP verification. Refer 'How it works?' for more details
      success: (data) => {
        // get verified token in response
        // console.log("success response", data);
        resolve(data);
      },
      failure: (error) => {
        // handle error
        // console.log("failure reason", error);
        reject(error);
      },
      OTP: "OTP",
    };
    let script = document.getElementById("msg91");
    console.log(script, "script ");
    if (!script) {
      script = document.createElement("script");
      script.id = "msg91";
      script.onload = () => {
        console.log("script loaded now");
        window?.initSendOTP(configuration);
      };
      script.src = "https://verify.msg91.com/otp-provider.js";
      document.body.appendChild(script);
    } else {
      console.log("script already loaded");
      window?.initSendOTP(configuration);
    }
  });
}

const LoginMSG91 = () => {
  const { user, authToken } = useCommonStore();
  useEffect(() => {
    console.log("opening dialog");
    if (authToken) {
      if (!user) {
        ApiService.call("/api/user")
          .then((res) => {
            useCommonStore.getState().setUser(res);
          })
          .catch((error) => {
            console.log("error", error);
          });
      } else {
        console.log("User was also there, don't know why we are here");
      }
    } else {
      openOTPDialog()
        .then(async (data) => {
          console.log("data", data);
          let response = await ApiService.call(
            "/api/public/verify-otp",
            "post",
            {
              accessToken: data.message,
            }
          );
          console.log("response", response);
          useCommonStore.getState().setLogin(response);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress color="primary" />
    </div>
  );
};

export default LoginMSG91;
