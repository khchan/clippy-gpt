
export enum Role { System, User }

export type ModelSummary = {
    table: string, 
    count: number
}

export type ModelContext = {
    // map of dimension name to member metadata
    dimensionality: Record<string, MemberMetadata[]>
}

export type SimilarityResult = {
    pageContent: string,
    metadata: object,
    score: number
}

export type RollupResult = {
    rollupResult: object[]
}

export type ChatMessage = {
    role: Role
    content: string
}

export type MemberMetadata = {
    level: number,
    member: string,
    dimension: string
}