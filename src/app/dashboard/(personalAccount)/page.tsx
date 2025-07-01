import ManageScrapeConfigurations from "@/src/components/scraping/manage-scrape-configurations";
import { createClient } from "@/src/lib/supabase/server";

export default async function PersonalAccountPage() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  return (
    <div className="flex flex-col gap-y-8">
      {user && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            <strong>Current User ID:</strong> {user.id}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      )}
      <ManageScrapeConfigurations />
    </div>
  );
}
