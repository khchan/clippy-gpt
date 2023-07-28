import sql from './db';
import { ModelContext, RollupResult } from "@/app/types";
import { TABLE_PER_DIM } from "./constants";
import fs from "fs";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {createClient} from "@supabase/supabase-js";
import {v4 as uuidv4} from 'uuid';

export default async function rollup(context: ModelContext, client: SupabaseClient) {
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

    //part 2 - store to file, TODO check here
    const columns = rollupResult.columns.map((column) => column.name);
    const rows = rollupResult
        .map((row: Record<string, any>) => columns.map((header) => `${row[header]}`).join(","))
        .join("\n");
    const dataToStore = `${columns}\n${rows}`;

    const dataPath = "/tmp/data.csv";
    await fs.writeFile(dataPath, dataToStore, function(err) {
        if(err) {
            const b = false;
            // too bad for us
        } else {

        }
    });

    // const fileName = `${uuidv4()}.csv`

    // const fileContent = await fs.promises.readFile(dataPath, 'utf-8');
    // const { data, error } = await client.storage
    //     .from('csv_files')
    //     .upload(fileName, fileContent, {upsert: true});

    return dataPath;
}
