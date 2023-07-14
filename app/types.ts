
export enum Role { System, User }

export type ModelSummary = {
    table: string, 
    count: number
}

export type SimilaritySearchResponse = {
    pageContent: string,
    metadata: object
}

export type ChatMessage = {
    role: Role
    content: string
}
