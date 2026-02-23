import NoSSR from "@/common/NoSSR";
import JobsPage from "@/components/admin/jobs/JobsPage";
import AdminLayout from "@/layout/admin/AdminLayout";

export default function AdminJobs() {
  return (
    <AdminLayout>
      <NoSSR>
        <JobsPage />
      </NoSSR>
    </AdminLayout>
  );
}
