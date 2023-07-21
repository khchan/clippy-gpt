import sql from './db';
import {MemberMetadata, ModelContext, RollupResult, TableDetails} from "@/app/types";
import {TABLE_PER_DIM} from "@/app/api/query/constants";

export default async function rollup(context: ModelContext): Promise<RollupResult> {

    var selects: string[] = [];
    var joins: string[] = [];
    var conditions: string[] = [];

    for (const [member, memberMetadata] of Object.entries(context.get())) {
        var tableDetails = TABLE_PER_DIM[member];

        joins.push(createJoinFromParams(tableDetails.tableName, tableDetails.shortName, tableDetails.foreignKeyColumn));

        if (memberMetadata.length > 0) {
            let memberConditions: Record<string, string[]> = {};

            memberMetadata.filter(metadata => metadata !== undefined).forEach((metadata) => {
                var columnName = `${tableDetails.tableName}_level${metadata.level}`;

                (memberConditions[columnName] ??= []).push(`'${metadata.member}'`);
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

    const rollupResult = await sql`${finalQuery}`;
    return {rollupResult};
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
            where ${conditions.join(" or ")}
            group by ${selects.join(", ")} `;
}