import DashboardHeader from "@components/dashboard/dashboard-header";
import { createClient } from "@lib/supabase/server";

export default async function PersonalAccountDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseClient = createClient();

  const { data: personalAccount } = await supabaseClient.rpc("get_personal_account");

  const navigation = [
    {
      name: "Overview",
      href: "/dashboard",
    },
    {
      name: "Configurations",
      href: "/dashboard/configurations",
    },
    {
      name: "Opportunities",
      href: "/dashboard/opportunities",
    },
    {
      name: "Insights",
      href: "/dashboard/insights",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
    },
  ];

  return (
    <>
      <DashboardHeader accountId={personalAccount.account_id} navigation={navigation} />
      <div className="w-full p-8">{children}</div>
    </>
  );
}
