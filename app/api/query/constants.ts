import {TableDetails} from "@/app/types";

export const TABLE_PER_DIM: Record<string, TableDetails> = {
    "Account": {
        "tableName": "account",
        "shortName": "a",
        "foreignKeyColumn": "account"
    },
    "Period": {
        "tableName": "periodmonth",
        "shortName": "per",
        "foreignKeyColumn": "periodmonth"
    },
    "Year": {
        "tableName": "periodyear",
        "shortName": "y",
        "foreignKeyColumn": "periodyear"
    },
    "Product": {
        "tableName": "product",
        "shortName": "prod",
        "foreignKeyColumn": "product"
    },
    "Store": {
        "tableName": "store",
        "shortName": "s",
        "foreignKeyColumn": "store"
    },
};