import LoadingErrorRQ from "@/common/LoadingErrorRQ";
import useObjectState from "@/hooks/useObjectState";
import { ApiService } from "@/services/ApiService";
import { useQuery } from "@tanstack/react-query";
import OrderItem from "./OrderItem";
import { Stack, Pagination } from "@mui/material";
export default function OrdersPage() {
  const { state, setState } = useObjectState({
    page: 1,
    pageSize: 20,
  });
  const q = useQuery({
    queryKey: ["orders", state.page, state.pageSize],
    queryFn: async () => {
      const res = await ApiService.call("/api/admin/orders", "post", {
        page: state.page,
        pageSize: state.pageSize,
      });
      return res;
    },
  });

  return (
    <div>
      <LoadingErrorRQ q={q} />
      {q.data?.map((order) => (
        <OrderItem key={order._id} order={order} />
      ))}

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Pagination
          count={100}
          page={state.page}
          onChange={(e, value) => setState({ page: value })}
          color="primary"
          sx={{ mx: "auto" }}
        />
      </Stack>
    </div>
  );
}
