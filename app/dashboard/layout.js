import { IdleSessionTimeout } from "@/components/IdleSessionTimeout";

export default function DashboardLayout({ children }) {
  return (
    <>
      <IdleSessionTimeout />
      {children}
    </>
  );
}
