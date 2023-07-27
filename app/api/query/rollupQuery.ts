import sql from './db';
import { ModelContext, RollupResult } from "@/app/types";
import { TABLE_PER_DIM } from "./constants";

export default async function rollup(context: ModelContext): Promise<RollupResult> {
    const tableNames = Object.keys(context.get()).map(d => TABLE_PER_DIM[d].tableName);

    /*
     * subselects only apply if we got matches on members
     * should produce something like this for each dimension:
     *  account in (select account from account where account_level1 = 'Sales Margin' or ...) and
     *  store in (select store from store where store_level2 = 'New York')
     */
    const subselects = Object.entries(context.get())
        .filter(([, members]) => members.length > 0)
        .map(([dim, members]) => {
            const tableName = TABLE_PER_DIM[dim].tableName;
            const subselect = members.map(member => `${tableName}_level${member.level} = '${member.member}'`).join(" or ");
            return `${tableName} in (select ${tableName} from ${tableName} where ${subselect})`;
        })
        .join(" and\n");

    const finalQuery = `
    select 
        ${tableNames.join(", ")},
        SUM(values) as rollupvalue
    from modelvalues as mv
    where 
        ${subselects}
    group by 
        ${tableNames.join(", ")}
    `;
    console.log(finalQuery);

    const rollupResult = await sql`${sql.unsafe(finalQuery)}`;

    // console.log(rollupResult);

    return {columns: rollupResult["columns"], rows: rollupResult};
}
