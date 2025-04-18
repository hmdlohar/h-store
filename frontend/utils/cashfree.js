// Utility to load Cashfree JS SDK and launch payment
export function loadCashfreeSdk() {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(window.Cashfree);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export async function launchCashfreePayment(sessionId) {
  const Cashfree = await loadCashfreeSdk();
  console.log(Cashfree, "sdk");
  return new Promise((resolve, reject) => {
    const cashfree = Cashfree({
      mode: "sandbox",
    });

    let checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_modal",
    };
    cashfree.checkout(checkoutOptions).then((result) => {
      if (result.error) {
        // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
        console.log(
          "User has closed the popup or there is some payment error, Check for Payment Status"
        );
        console.log(result.error);
        reject(result.error);
      }
      if (result.redirect) {
        // This will be true when the payment redirection page couldnt be opened in the same window
        // This is an exceptional case only when the page is opened inside an inAppBrowser
        // In this case the customer will be redirected to return url once payment is completed
        console.log("Payment will be redirected");
      }
      if (result.paymentDetails) {
        // This will be called whenever the payment is completed irrespective of transaction status
        console.log("Payment has been completed, Check for Payment Status");
        console.log(result.paymentDetails.paymentMessage);
        resolve(result);
      }
    });
  });
}
