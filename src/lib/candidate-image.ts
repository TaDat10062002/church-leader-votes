/** Only proxy images from our own public candidate bucket through Next.js. */
export function candidateImageRemotePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/v1/object/public/candidate-images/**",
      search: "",
    };
  } catch {
    return null;
  }
}

export function canOptimizeCandidateImage(src: string) {
  const pattern = candidateImageRemotePattern();
  if (!pattern) return false;
  try {
    const url = new URL(src);
    return url.protocol === `${pattern.protocol}:` &&
      url.hostname === pattern.hostname && url.port === pattern.port &&
      url.pathname.startsWith("/storage/v1/object/public/candidate-images/") &&
      !url.search && !url.hash;
  } catch {
    return false;
  }
}
