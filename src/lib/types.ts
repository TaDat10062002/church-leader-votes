export type Candidate = { id: string; name: string; image_url: string; display_order?: number };
export type CandidateDraft = { name: string; image: string };
export type ElectionData = { id: string; status: "opened" | "closed"; candidates?: Candidate[] };
export type ResultRow = Candidate & { total: number };
