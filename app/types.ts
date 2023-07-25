
export enum Role { System, User }

export type ModelSummary = {
    table: string, 
    count: number
}

export class ModelContext {
    private context: Record<string, MemberMetadata[]>;

    constructor(context: Record<string, MemberMetadata[]> = {}) {
        this.context = context;
    }

    merge(other: ModelContext): void {
        for (const key in other.context) {
            if (this.context[key]) {
                // Assuming that uniqueness is based on 'member' and 'dimension'
                const existingMembers = new Set(this.context[key].map(member => member.member + member.dimension));
                this.context[key] = [
                    ...this.context[key], 
                    ...other.context[key].filter(member => !existingMembers.has(member.member + member.dimension))];
            } else {
                this.context[key] = other.context[key];
            }
        }
    }

    get(): Record<string, MemberMetadata[]> {
        return this.context;
    }
}

export type ClassificationResult = {analysis: string, intent: string};

export type EntityExtractResult = Record<string, string[]>;

export type SimilarityResult = {
    pageContent: string,
    metadata: object,
    score: number
}

export type Column = {
    name: string
}

export type RollupResult = {
    columns: Column[]
    rows: object[]
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

export type TableDetails = {
    tableName: string,
    shortName: string,
    foreignKeyColumn: string,
    description: string
}