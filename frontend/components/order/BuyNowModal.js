import OrderPage from "./OrderPage";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";

export default function BuyNowModal({ open, onClose, product }) {
  const { setProduct } = useOrderStore();
  useEffect(() => {
    setProduct(product);
  }, []);
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent>
        <IconButton
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <OrderPage />
      </DialogContent>
    </Dialog>
  );
}
