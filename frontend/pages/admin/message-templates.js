import NoSSR from "@/common/NoSSR";
import MessageTemplatesPage from "@/components/admin/message-templates/MessageTemplatesPage";
import AdminLayout from "@/layout/admin/AdminLayout";

export default function AdminMessageTemplates() {
  return (
    <AdminLayout>
      <NoSSR>
        <MessageTemplatesPage />
      </NoSSR>
    </AdminLayout>
  );
}
