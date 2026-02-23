import NoSSR from "@/common/NoSSR";
import MessageLogsPage from "@/components/admin/message-logs/MessageLogsPage";
import AdminLayout from "@/layout/admin/AdminLayout";

export default function AdminMessageLogs() {
  return (
    <AdminLayout>
      <NoSSR>
        <MessageLogsPage />
      </NoSSR>
    </AdminLayout>
  );
}
