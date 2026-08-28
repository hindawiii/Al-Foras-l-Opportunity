import { toast } from "sonner";

export const nativeShare = async (data: { title: string; text: string; url?: string }) => {
  const url = data.url ?? window.location.href;
  const payload = { title: data.title, text: data.text, url };
  // Prefer the OS share sheet on mobile when available and allowed.
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    // canShare() guards against environments that expose share() but reject our payload.
    const canShare = typeof (navigator as any).canShare === "function"
      ? (navigator as any).canShare(payload)
      : true;
    if (canShare) {
    try {
        await navigator.share(payload);
      return true;
      } catch (e: any) {
        // User cancelled — silent. Otherwise fall through to clipboard fallback.
        if (e?.name === "AbortError") return false;
      }
    }
  }
  try {
    await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${url}`);
    toast.success("تم نسخ الرابط — يمكنك مشاركته الآن");
    return true;
  } catch {
    toast.error("تعذر مشاركة المحتوى");
    return false;
  }
};
