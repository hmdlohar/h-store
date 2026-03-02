import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import { ApiService } from "@/services/ApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  GIFT_SHOP_SOURCE_OPTIONS,
  GIFT_SHOP_STATUS_LABEL_MAP,
  GIFT_SHOP_STATUS_OPTIONS,
} from "./constants";

const defaultGiftShop = {
  externalId: "",
  shopName: "",
  shopPersonName: "",
  mobileNumber: "",
  additionalMobileNumbers: [],
  email: "",
  additionalEmails: [],
  photoLink: "",
  websiteLink: "",
  additionalLinks: [],
  source: "manual",
  status: "new",
  statusMeta: "",
  comments: [],
};

const csvToArray = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function GiftShopEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const isNew = id === "new";

  const [giftShop, setGiftShop] = useState(defaultGiftShop);
  const [additionalMobilesText, setAdditionalMobilesText] = useState("");
  const [additionalEmailsText, setAdditionalEmailsText] = useState("");
  const [additionalLinksText, setAdditionalLinksText] = useState("");
  const [newComment, setNewComment] = useState("");

  const giftShopQuery = useQuery({
    queryKey: ["admin-gift-shop", id],
    queryFn: async () => {
      if (isNew) return null;
      return await ApiService.call(`/api/admin/gift-shops/${id}`, "get");
    },
    enabled: !!id && !isNew,
  });

  useEffect(() => {
    if (!giftShopQuery.data) return;
    const item = { ...defaultGiftShop, ...giftShopQuery.data };
    setGiftShop(item);
    setAdditionalMobilesText((item.additionalMobileNumbers || []).join(", "));
    setAdditionalEmailsText((item.additionalEmails || []).join(", "));
    setAdditionalLinksText((item.additionalLinks || []).join(", "));
  }, [giftShopQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isNew) {
        return await ApiService.call("/api/admin/gift-shops", "post", payload);
      }
      return await ApiService.call(`/api/admin/gift-shops/${id}`, "put", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-gift-shops"],
        refetchType: "all",
      });
      if (!isNew) {
        await queryClient.invalidateQueries({ queryKey: ["admin-gift-shop", id] });
      }
      router.push("/admin/gift-shops");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment) => {
      return await ApiService.call(`/api/admin/gift-shops/${id}/comments`, "post", {
        comment,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["admin-gift-shop", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-gift-shops"] });
    },
  });

  const payload = useMemo(
    () => ({
      ...giftShop,
      additionalMobileNumbers: csvToArray(additionalMobilesText),
      additionalEmails: csvToArray(additionalEmailsText),
      additionalLinks: csvToArray(additionalLinksText),
    }),
    [giftShop, additionalMobilesText, additionalEmailsText, additionalLinksText],
  );

  const handleField = (key, value) => {
    setGiftShop((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          {isNew ? "Add Gift Shop" : "Edit Gift Shop"}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="outlined" onClick={() => router.push("/admin/gift-shops")}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => saveMutation.mutate(payload)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Stack>

      <LoadingErrorRQ q={giftShopQuery} />

      {(isNew || giftShopQuery.data) && (
        <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack spacing={2}>
            <TextField
              label="Shop Name"
              value={giftShop.shopName}
              onChange={(e) => handleField("shopName", e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="External ID"
              value={giftShop.externalId || ""}
              onChange={(e) => handleField("externalId", e.target.value)}
              helperText="Unique ID from source system"
              fullWidth
            />
            <TextField
              label="Shop Person Name"
              value={giftShop.shopPersonName}
              onChange={(e) => handleField("shopPersonName", e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Mobile Number"
                value={giftShop.mobileNumber}
                onChange={(e) => handleField("mobileNumber", e.target.value)}
                fullWidth
              />
              <TextField
                label="Additional Mobile Numbers"
                value={additionalMobilesText}
                onChange={(e) => setAdditionalMobilesText(e.target.value)}
                helperText="Comma separated"
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Email"
                value={giftShop.email}
                onChange={(e) => handleField("email", e.target.value)}
                fullWidth
              />
              <TextField
                label="Additional Emails"
                value={additionalEmailsText}
                onChange={(e) => setAdditionalEmailsText(e.target.value)}
                helperText="Comma separated"
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Photo Link"
                value={giftShop.photoLink}
                onChange={(e) => handleField("photoLink", e.target.value)}
                fullWidth
              />
              <TextField
                label="Website Link"
                value={giftShop.websiteLink}
                onChange={(e) => handleField("websiteLink", e.target.value)}
                helperText="Can be site, Google Maps, or Justdial URL"
                fullWidth
              />
            </Stack>

            <TextField
              label="Additional Links"
              value={additionalLinksText}
              onChange={(e) => setAdditionalLinksText(e.target.value)}
              helperText="Comma separated"
              fullWidth
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Source"
                value={giftShop.source || "manual"}
                onChange={(e) => handleField("source", e.target.value)}
                fullWidth
              >
                {GIFT_SHOP_SOURCE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Status"
                value={giftShop.status || "new"}
                onChange={(e) => handleField("status", e.target.value)}
                fullWidth
              >
                {GIFT_SHOP_STATUS_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="Status Meta"
              value={giftShop.statusMeta}
              onChange={(e) => handleField("statusMeta", e.target.value)}
              helperText="Optional short note for current status"
              fullWidth
            />

            {!isNew ? (
              <>
                <Divider />

                <Typography variant="h6">CRM Comments</Typography>
                <Stack spacing={1}>
                  {(giftShopQuery.data?.comments || []).length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No comments added yet.
                    </Typography>
                  ) : (
                    giftShopQuery.data.comments
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt || 0).getTime() -
                          new Date(a.createdAt || 0).getTime(),
                      )
                      .map((item) => (
                        <Paper key={item._id} variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="body2">{item.comment}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.createdBy || "system"} | {new Date(item.createdAt).toLocaleString()}
                          </Typography>
                        </Paper>
                      ))
                  )}
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <TextField
                    label="Add Comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={() => addCommentMutation.mutate(newComment)}
                    disabled={addCommentMutation.isPending || !newComment.trim()}
                    sx={{ alignSelf: { xs: "stretch", md: "center" } }}
                  >
                    {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                  </Button>
                </Stack>

                <Typography color="text.secondary" variant="caption">
                  Current status: {GIFT_SHOP_STATUS_LABEL_MAP[giftShop.status] || giftShop.status}
                </Typography>
              </>
            ) : null}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
