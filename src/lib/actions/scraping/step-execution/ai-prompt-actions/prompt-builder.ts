import type { PageTextContent } from "../../types";

export function buildPromptForPage(
  basePrompt: string,
  pageContent: PageTextContent,
  downloadedFilesContent: string
): string {
  // Combine all content pieces from this page
  const pageTextContent = pageContent.content.join("\n\n--- Content Piece ---\n");

  let fullPrompt = basePrompt;
  if (downloadedFilesContent !== "") {
    fullPrompt = `${basePrompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
  }
  fullPrompt = `${fullPrompt}\n\n--- Page Content ---\n${pageTextContent}`;

  return fullPrompt;
}

export function buildPromptForDownloadedFilesOnly(
  basePrompt: string,
  downloadedFilesContent: string
): string {
  let fullPrompt = basePrompt;
  if (downloadedFilesContent !== "") {
    fullPrompt = `${basePrompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
  }
  return fullPrompt;
}
