import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const configurationId = searchParams.get("configurationId");

  if (!configurationId) {
    return NextResponse.json({ error: "Missing configuration ID parameter" }, { status: 400 });
  }

  console.log(`[FILES API] Listing files for configuration: ${configurationId}`);

  try {
    const supabase = createClient();

    // List all objects in the configuration's folder
    const { data: objects, error } = await supabase.storage
      .from("scrape-downloads")
      .list(configurationId, {
        limit: 1000,
        offset: 0,
      });

    if (error) {
      console.error("[FILES API] Error listing files:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }

    // Transform the objects into a more useful format
    const files = objects.map((obj: any) => ({
      id: obj.id,
      name: obj.name,
      filename: obj.name.split("/").pop() ?? obj.name,
      size: obj.metadata?.size ?? 0,
      mimeType: obj.metadata?.mimetype ?? "application/octet-stream",
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
      downloadUrl: `/api/scrape/download?filepath=${configurationId}/${obj.name}`,
    }));

    console.log(`[FILES API] Found ${files.length} files for configuration ${configurationId}`);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("[FILES API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
