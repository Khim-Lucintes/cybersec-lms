import { SystemMaintenanceLockout } from "@/components/SystemMaintenanceLockout";

export default function StudentDashboardLayout({ children }) {
  return (
    <>
      <SystemMaintenanceLockout />
      {children}
    </>
  );
}
