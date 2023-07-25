import {TableDetails} from "@/app/types";

export const TABLE_PER_DIM: Record<string, TableDetails> = {
    "Account": {
        "tableName": "account",
        "shortName": "a",
        "foreignKeyColumn": "account",
        "description": "In International Financial Reporting Standards (IFRS),  financial statements are formal records of the financial activities and position of a business, organization, or individual. They provide a summary of an entity's financial transactions and allow stakeholders to assess its financial health and performance. The Account dimension contains specific line items that would show up on these financial statements, for example Sales i.e. Revenues, Cost of Goods Sold, Gross Margin, Operating Expenses, etc."
    },
    "Period": {
        "tableName": "periodmonth",
        "shortName": "per",
        "foreignKeyColumn": "periodmonth",
        "description": "This dimension contains all the periods in one year."
    },
    "Year": {
        "tableName": "periodyear",
        "shortName": "y",
        "foreignKeyColumn": "periodyear",
        "description": "This dimension contains all the years the business has been in operation. Oftentimes, Fiscal Year is used interchangeably with this name."
    },
    "Product": {
        "tableName": "product",
        "shortName": "prod",
        "foreignKeyColumn": "product",
        "description": "When a company refers to its \"product\", it is generally talking about the tangible or intangible item or service it offers for sale to customers. The product is the core offering of the company, representing what it produces, manufactures, or provides to meet the needs, wants, or demands of its target market. The Product dimension contains the 4 offerings (Plant-Based Burger, Ice Cream, Cola, and Burger)."
    },
    "Store": {
        "tableName": "store",
        "shortName": "s",
        "foreignKeyColumn": "store",
        "description": "This dimension contains a list of cities which have stores located in them; we can assume there is one store per city. These stores are where sales are made from, and are brick-and-mortar establishments that customers physically visit."
    },
};