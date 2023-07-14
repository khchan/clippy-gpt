
export enum Role { System, User }

export type ModelSummary = {
    table: string, 
    count: number
}

export type SimilaritySearchResponse = {
    dimensionality: SimilarityResult[],
    members: SimilarityResult[]
}

export type SimilarityResult = {
    pageContent: string,
    metadata: object,
    score: number
}

export type ChatMessage = {
    role: Role
    content: string
}
