import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

interface StorageObject {
  id: string;
  name: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
  created_at: string;
  updated_at: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const configurationId = searchParams.get("configurationId");
  const stepId = searchParams.get("stepId");

  if (configurationId == null) {
    return NextResponse.json({ error: "Missing configuration ID parameter" }, { status: 400 });
  }

  console.log(
    `[FILES API] Listing files for configuration: ${configurationId}${stepId != null && stepId !== "" ? `, step: ${stepId}` : ""}`
  );

  try {
    const supabase = createClient();

    // Determine the path to list files from
    const listPath = stepId != null ? `${configurationId}/${stepId}` : configurationId;

    // List all objects in the configuration's folder (or step-specific folder)
    const { data: objects, error } = await supabase.storage
      .from("scrape-downloads")
      .list(listPath, {
        limit: 1000,
        offset: 0,
      });

    if (error != null) {
      console.error("[FILES API] Error listing files:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }

    // Transform the objects into a more useful format
    const files = objects.map((obj: StorageObject) => ({
      id: obj.id,
      name: obj.name,
      filename: obj.name.split("/").pop() ?? obj.name,
      size: obj.metadata?.size ?? 0,
      mimeType: obj.metadata?.mimetype ?? "application/octet-stream",
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
      downloadUrl: `/api/scrape/download?filepath=${listPath}/${obj.name}`,
    }));

    console.log(
      `[FILES API] Found ${files.length} files for ${stepId != null ? `step ${stepId}` : `configuration ${configurationId}`}`
    );

    return NextResponse.json({ files });
  } catch (error: unknown) {
    console.error("[FILES API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
