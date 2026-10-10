/** Keep the URL alive long enough for browsers to finish starting the download. */
export function downloadBlob(blob: Blob, filename: string): void {
  if (!blob.size) throw new Error("The exported image is empty");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
