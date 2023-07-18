import { ModelContext, RollupResult } from "@/app/types";
import sql from './db';

export default async function rollup(context: ModelContext): Promise<RollupResult> {
    // TODO: build SQL based on context
    const rollupResult = await sql`
    select 
        a.account_level2, s.store_level2, p.periodyear_level2, 
        SUM(values) as NewValues
    from modelvalues as MV
        inner join account a on a.account = MV.account
        inner join store s on s.store = MV.store
        inner join periodyear p on p.periodyear = MV.periodyear
    where 
        a.account_level2 = 'Revenue' and 
        p.periodyear in ('2020', '2021')
    group by 
        a.account_level2, s.store_level2, p.periodyear_level2;
    `;

    return {rollupResult};
}