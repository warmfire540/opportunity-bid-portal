import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filepath = searchParams.get("filepath");

  if (!filepath) {
    return NextResponse.json({ error: "Missing filepath parameter" }, { status: 400 });
  }

  console.log(`[DOWNLOAD API] Downloading file with filepath: ${filepath}`);

  try {
    const supabase = createClient();

    // Download the file directly from storage using the filepath
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("scrape-downloads")
      .download(filepath);

    if (downloadError !== null) {
      console.error("[DOWNLOAD API] Download error:", downloadError);
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    // Extract filename from the filepath
    const filename = filepath.split("/").pop() ?? "downloaded-file";
    
    // Get file info to determine MIME type
    const { data: fileInfo } = await supabase.storage
      .from("scrape-downloads")
      .list(filepath.split("/").slice(0, -1).join("/"), {
        search: filename,
        limit: 1
      });

    if (!fileInfo || fileInfo.length === 0) {
      console.error("[DOWNLOAD API] File info not found:", filepath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fileInfo[0];

    // Return the file as a response
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": file.metadata?.mimetype ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[DOWNLOAD API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 