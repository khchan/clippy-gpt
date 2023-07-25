import sql from './db';
import {MemberMetadata, ModelContext, RollupResult} from "@/app/types";
import {TABLE_PER_DIM} from "@/app/api/query/constants";

export default async function rollup(context: ModelContext): Promise<RollupResult> {

    var selects: string[] = [];
    var joins: string[] = [];
    var conditions: string[] = [];

    for (const [member, memberMetadata] of Object.entries(context.get())) {
        const tableDetails = TABLE_PER_DIM[member];
        const tableName = tableDetails.tableName;
        const resultingSetOfMembers: string[] = [];

        var deepestMemberFound = false;
        var deepestLevel = -1;

        // Part 1: For every member find the deepest non-null child on the same level, so, the resulting query for dimension won't have more than one level
        if (memberMetadata.length > 0) {
            do {
                const deepestContextLevel = deepestLevel < 0 ? memberMetadata.reduce((max, current) => (current.level > max.level ? current : max), memberMetadata[0]).level : deepestLevel;

                for (const metadata of memberMetadata.filter(metadata => metadata !== undefined)) {
                    if (metadata.level < deepestContextLevel) {
                        //fetch the deepest levels for current member and check if on that level they are not null
                        const deepestMembers = await sql`${sql.unsafe(createQueryToFindDeepestLevel(tableName, deepestContextLevel, metadata))}`;

                        const resultingMemberOnDeepestLevel = deepestMembers[0][`${tableName}_level${deepestContextLevel}`];
                        if (resultingMemberOnDeepestLevel === null || resultingMemberOnDeepestLevel == 'null') {
                            deepestMemberFound = false;
                            deepestLevel = deepestContextLevel - 1;
                            break;
                        }

                        deepestMembers.forEach(row => {
                            !resultingSetOfMembers.includes(row[`${tableName}_level${deepestContextLevel}`]) && resultingSetOfMembers.push(row[`${tableName}_level${deepestContextLevel}`]);
                        })

                        deepestMemberFound = true;
                        deepestLevel = deepestContextLevel;
                    } else {
                        if (metadata.level == deepestContextLevel) {
                            !resultingSetOfMembers.includes(metadata.member) && resultingSetOfMembers.push(metadata.member);
                        }

                        deepestMemberFound = true;
                        deepestLevel = deepestContextLevel;
                    }
                }

            } while (!deepestMemberFound);
        }

        // Part 2: Start making the whole SQL query from the context
        joins.push(createJoinFromParams(tableName, tableDetails.shortName, tableDetails.foreignKeyColumn));

        if (memberMetadata.length > 0) {
            let memberConditions: Record<string, string[]> = {};

            resultingSetOfMembers.forEach((metadata) => {
                var columnName = `${tableName}_level${deepestLevel}`;

                (memberConditions[columnName] ??= []).push(`'${metadata}'`);
                selects.includes(`${tableDetails.shortName}.${columnName}`) || selects.push(`${tableDetails.shortName}.${columnName}`);
            });

            Object.keys(memberConditions).forEach(columnName => {
                conditions.push(createConditionFromParams(tableDetails.shortName, columnName, memberConditions[columnName]));
            });
        } else {
            selects.push(tableDetails.shortName + "." + tableDetails.tableName);
        }
    }

    var finalQuery = createResultingQuery(selects, joins, conditions);
    console.log(finalQuery);

    const rollupResult = await sql`${sql.unsafe(finalQuery)}`;

    console.log(rollupResult);
    return {columns: rollupResult["columns"], rows: rollupResult};
}

function createQueryToFindDeepestLevel(tableName: string, deepestContextLevel: number, memberToSearchFor: MemberMetadata): string {
    return `select ${tableName}_level${deepestContextLevel}
            from ${tableName}
            where ${tableName}_level${memberToSearchFor.level} = '${memberToSearchFor.member}'`;
}

function createJoinFromParams(tableName: string, shortName: string, fk: string): string {
    return `inner join ${tableName} ${shortName} on ${shortName}.${fk} = MV.${fk} `;
}

function createConditionFromParams(shortName: string, columnName: string, members: string[]): string {
    if (members.length == 1) {
        return `${shortName}.${columnName} = ${members}`;
    } else {
        return `${shortName}.${columnName} in (${members.join(", ")})`;
    }
}

function createResultingQuery(selects: string[], joins: string[], conditions: string[]): string {
    return `select ${selects.join(", ")}, SUM(values) as rollupValues
            from modelvalues as MV ${joins.join(" ")}
            where ${conditions.join(" and ")}
            group by ${selects.join(", ")} `;
}