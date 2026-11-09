export type Candidate = { id: string; name_zh: string; name_vi: string; image_url: string; display_order?: number };
export type CandidateDraft = { name_zh: string; name_vi: string; image: string };
export type ElectionData = { id: string; status: "opened" | "closed"; candidates?: Candidate[] };
export type ResultRow = Candidate & { total: number };
