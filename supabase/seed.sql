insert into
public.employees (name)
values
('Erlich Bachman'),
('Richard Hendricks'),
('Monica Hall');


-- account values
insert into Account (Account, Account_alias, Account_depth,
                     Account_level1, Account_level1_alias, Account_level2,
                     Account_level2_alias, Account_level3, Account_level3_alias)
values ('Assets', 'Assets', '3', 'All Accounts', 'All Accounts', 'Balance Sheet', 'Balance Sheet', 'Assets', 'Assets'),
       ('Cost', 'Cost', '2', 'Sales Margin', 'Sales Margin', 'Cost', 'Cost', 'null', 'null'),
       ('Cost per Unit', 'Cost per Unit', '2', 'Statistical', 'Statistical', 'Cost per Unit', 'Cost per Unit', 'null',
        'null'),
       ('Expense', 'Expense', '3', 'All Accounts', 'All Accounts', 'Income Statement', 'Income Statement', 'Expense',
        'Expense'),
       ('Liabilities', 'Liabilities', '3', 'All Accounts', 'All Accounts', 'Balance Sheet', 'Balance Sheet',
        'Liabilities', 'Liabilities'),
       ('Not Account Specific', 'Not Account Specific', '1', 'Not Account Specific', 'Not Account Specific', 'null',
        'null', 'null', 'null'),
       ('Other Accounts', 'Other Accounts', '2', 'All Accounts', 'All Accounts', 'Other Accounts', 'Other Accounts',
        'null', 'null'),
       ('Price per Unit', 'Price per Unit', '2', 'Statistical', 'Statistical', 'Price per Unit', 'Price per Unit',
        'null', 'null'),
       ('Revenue', 'Revenue', '2', 'Sales Margin', 'Sales Margin', 'Revenue', 'Revenue', 'null', 'null'),
       ('Revenue Sales', 'Revenue', '3', 'All Accounts', 'All Accounts', 'Income Statement', 'Income Statement',
        'Revenue', 'Revenue'),
       ('Statistical Accounts', 'Statistical Accounts', '2', 'All Accounts', 'All Accounts', 'Statistical Accounts',
        'Statistical Accounts', 'null', 'null'),
       ('Stockholders Equity', 'Stockholders Equity', '3', 'All Accounts', 'All Accounts', 'Balance Sheet',
        'Balance Sheet', 'Stockholders Equity', 'Stockholders Equity'),
       ('Undefined', 'Non Account', '1', 'Undefined', 'Non Account', 'null', 'null', 'null', 'null'),
       ('Units Sold', 'Units Sold', '2', 'Statistical', 'Statistical', 'Units Sold', 'Units Sold', 'null', 'null');


-- period values
insert into PeriodMonth (PeriodMonth, PeriodMonth_alias, PeriodMonth_depth, PeriodMonth_level1,
                         PeriodMonth_level1_alias, PeriodMonth_level2, PeriodMonth_level2_alias)
values ('1', 'Jan', '2', 'Full Year', 'Full Year', '1', 'Jan'),
       ('10', 'Oct', '2', 'Full Year', 'Full Year', '10', 'Oct'),
       ('11', 'Nov', '2', 'Full Year', 'Full Year', '11', 'Nov'),
       ('12', 'Dec', '2', 'Full Year', 'Full Year', '12', 'Dec'),
       ('2', 'Feb', '2', 'Full Year', 'Full Year', '2', 'Feb'),
       ('3', 'Mar', '2', 'Full Year', 'Full Year', '3', 'Mar'),
       ('4', 'Apr', '2', 'Full Year', 'Full Year', '4', 'Apr'),
       ('5', 'May', '2', 'Full Year', 'Full Year', '5', 'May'),
       ('6', 'Jun', '2', 'Full Year', 'Full Year', '6', 'Jun'),
       ('7', 'Jul', '2', 'Full Year', 'Full Year', '7', 'Jul'),
       ('8', 'Aug', '2', 'Full Year', 'Full Year', '8', 'Aug'),
       ('9', 'Sep', '2', 'Full Year', 'Full Year', '9', 'Sep'),
       ('Default member', 'Default member', '1', 'Default member', 'Default member', 'null', 'null'),
       ('Undefined', 'Non Period', '1', 'Undefined', 'Non Period', 'null', 'null');

-- product values
insert into Product (Product, Product_alias, Product_depth, Product_level1,
                     Product_level1_alias, Product_level2, Product_level2_alias)
values ('Burger', 'Burger', '2', 'All Products', 'All Products', 'Burger', 'Burger'),
       ('Cola', 'Cola', '2', 'All Products', 'All Products', 'Cola', 'Cola'),
       ('Default member', 'Default member', '1', 'Default member', 'Default member', 'null', 'null'),
       ('Ice Cream', 'Ice Cream', '2', 'All Products', 'All Products', 'Ice Cream', 'Ice Cream'),
       ('Plant-Based Burger', 'Plant-Based Burger', '2', 'All Products', 'All Products', 'Plant-Based Burger',
        'Plant-Based Burger'),
       ('Undefined', 'Non Product', '1', 'Undefined', 'Non Product', 'null', 'null');

-- store values
insert into Store (Store, Store_alias, Store_depth, Store_level1,
                   Store_level1_alias, Store_level2, Store_level2_alias)
values ('Dallas', 'Dallas', '2', 'All Stores', 'All Stores', 'Dallas', 'Dallas'),
       ('Default member', 'Default member', '1', 'Default member', 'Default member', 'null', 'null'),
       ('Los Angeles', 'Los Angeles', '2', 'All Stores', 'All Stores', 'Los Angeles', 'Los Angeles'),
       ('New York', 'New York', '2', 'All Stores', 'All Stores', 'New York', 'New York'),
       ('San Diego', 'San Diego', '2', 'All Stores', 'All Stores', 'San Diego', 'San Diego'),
       ('Toronto', 'Toronto', '2', 'All Stores', 'All Stores', 'Toronto', 'Toronto'),
       ('Undefined', 'Non Store', '1', 'Undefined', 'Non Store', 'null', 'null'),
       ('Vancouver', 'Vancouver', '2', 'All Stores', 'All Stores', 'Vancouver', 'Vancouver');

-- year values
insert into PeriodYear (PeriodYear, PeriodYear_alias, PeriodYear_depth, PeriodYear_level1,
                        PeriodYear_level1_alias, PeriodYear_level2, PeriodYear_level2_alias)
values ('2019', '2019', '2', 'All Years', 'All Years', '2019', '2019'),
       ('2020', '2020', '2', 'All Years', 'All Years', '2020', '2020'),
       ('2021', '2021', '2', 'All Years', 'All Years', '2021', '2021'),
       ('2022', '2022', '2', 'All Years', 'All Years', '2022', '2022'),
       ('2023', '2023', '2', 'All Years', 'All Years', '2023', '2023'),
       ('Not Year Specific', 'Not Year Specific', '1', 'Not Year Specific', 'Not Year Specific', 'null', 'null'),
       ('Undefined', 'Non Year', '1', 'Undefined', 'Non Year', 'null', 'null');

-- data values
insert into ModelValues (Account, Product, Store, PeriodYear, PeriodMonth, Values)
values ('Revenue', 'Burger', 'Dallas', '2020', '1', '13380.97'),
       ('Revenue', 'Burger', 'Dallas', '2020', '2', '13602.11'),
       ('Revenue', 'Burger', 'Dallas', '2020', '3', '13636.57'),
       ('Revenue', 'Burger', 'Los Angeles', '2020', '1', '30919.23'),
       ('Revenue', 'Burger', 'Los Angeles', '2020', '2', '30588.59'),
       ('Revenue', 'Burger', 'Los Angeles', '2020', '3', '33078.66'),
       ('Revenue', 'Burger', 'New York', '2020', '1', '39466.35'),
       ('Revenue', 'Burger', 'New York', '2020', '2', '43437.35'),
       ('Revenue', 'Burger', 'New York', '2020', '3', '41067.01'),
       ('Revenue', 'Burger', 'San Diego', '2020', '1', '23555.48'),
       ('Revenue', 'Burger', 'San Diego', '2020', '2', '26479.95'),
       ('Revenue', 'Burger', 'San Diego', '2020', '3', '29546.59'),
       ('Revenue', 'Burger', 'Toronto', '2020', '1', '18965.34'),
       ('Revenue', 'Burger', 'Toronto', '2020', '2', '19242.39'),
       ('Revenue', 'Burger', 'Toronto', '2020', '3', '18252.83'),
       ('Revenue', 'Burger', 'Toronto', '2020', '4', '18472.01'),
       ('Revenue', 'Burger', 'Vancouver', '2020', '1', '11962.04'),
       ('Revenue', 'Burger', 'Vancouver', '2020', '2', '12533.89'),
       ('Revenue', 'Burger', 'Vancouver', '2020', '3', '12689.77'),
       ('Revenue', 'Burger', 'Vancouver', '2020', '4', '9699.75');

