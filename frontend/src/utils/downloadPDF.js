/**
 * Professional PDF Download Utility for CrimePilot AI
 *
 * Extracts backend Content-Disposition filename or formats a clean human-readable filename:
 * CrimePilot_Report_YYYY-MM-DD_HH-mm.pdf
 *
 * Handles Blob object URL generation, direct link.download property assignment,
 * invisible <a> trigger, and memory cleanup.
 */
export const downloadPDFResponse = (response, fallbackPrefix = 'CrimePilot_Report') => {
  let filename = '';

  // 1. Extract filename from Content-Disposition header if present
  const disposition = response?.headers?.['content-disposition'] || response?.headers?.['Content-Disposition'];
  if (disposition) {
    const utf8Matches = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Matches && utf8Matches[1]) {
      try {
        filename = decodeURIComponent(utf8Matches[1]).trim();
      } catch (e) {
        filename = utf8Matches[1].trim();
      }
    } else {
      const matches = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (matches && matches[1]) {
        filename = matches[1].trim();
      }
    }
  }

  // 2. Fallback formatting if header missing: CrimePilot_Report_YYYY-MM-DD_HH-mm.pdf
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    filename = `${fallbackPrefix}_${year}-${month}-${day}_${hours}-${minutes}.pdf`;
  }

  // Sanitize filename to prevent filesystem illegal characters
  filename = filename.replace(/[/\\?%*:|"<>]/g, '_');

  // 3. Create Blob safely with explicit application/pdf MIME type
  const blobData = response?.data instanceof Blob 
    ? response.data 
    : new Blob([response.data], { type: 'application/pdf' });

  const downloadUrl = window.URL.createObjectURL(blobData);

  // 4. Create <a> element and explicitly set BOTH property and attribute
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename; // Critical for Chrome/Edge/Firefox filename overriding
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // 5. Cleanup DOM & revoke Object URL after download trigger
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    window.URL.revokeObjectURL(downloadUrl);
  }, 200);

  return filename;
};
