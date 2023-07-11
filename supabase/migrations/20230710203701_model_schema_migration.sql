drop table if exists Account cascade;
create table Account
(
    Account              varchar(255) not null
        primary key,
    Account_alias        text null,
    Account_depth        int null,
    Account_level1       text null,
    Account_level1_alias text null,
    Account_level2       text null,
    Account_level2_alias text null,
    Account_level3       text null,
    Account_level3_alias text null,
    constraint Account_constraint
        unique (Account)
);

drop table if exists PeriodMonth cascade;
create table PeriodMonth
(
    PeriodMonth              varchar(255) not null
        primary key,
    PeriodMonth_alias        text null,
    PeriodMonth_depth        int null,
    PeriodMonth_level1       text null,
    PeriodMonth_level1_alias text null,
    PeriodMonth_level2       text null,
    PeriodMonth_level2_alias text null,
    constraint PeriodMonth_constraint
        unique (PeriodMonth)
);

drop table if exists Product cascade;
create table Product
(
    Product              varchar(255) not null
        primary key,
    Product_alias        text null,
    Product_depth        int null,
    Product_level1       text null,
    Product_level1_alias text null,
    Product_level2       text null,
    Product_level2_alias text null,
    constraint Product_constraint
        unique (Product)
);

drop table if exists Store cascade;
create table Store
(
    Store              varchar(255) not null
        primary key,
    Store_alias        text null,
    Store_depth        int null,
    Store_level1       text null,
    Store_level1_alias text null,
    Store_level2       text null,
    Store_level2_alias text null,
    constraint Store_constraint
        unique (Store)
);

drop table if exists PeriodYear cascade;
create table PeriodYear
(
    PeriodYear              varchar(255) not null
        primary key,
    PeriodYear_alias        text null,
    PeriodYear_depth        int null,
    PeriodYear_level1       text null,
    PeriodYear_level1_alias text null,
    PeriodYear_level2       text null,
    PeriodYear_level2_alias text null,
    constraint PeriodYear_constraint
        unique (PeriodYear)
);

drop table if exists ModelValues cascade;
create table ModelValues
(
    Account     varchar(255) null,
    Product     varchar(255) null,
    Store       varchar(255) null,
    PeriodYear  varchar(255) null,
    PeriodMonth varchar(255) null,
    Values      Decimal null,
    constraint values_Account_Account_fk
        foreign key (Account) references Account (Account),
    constraint values_Period_Period_fk
        foreign key (PeriodMonth) references PeriodMonth (PeriodMonth),
    constraint values_Product_Product_fk
        foreign key (Product) references Product (Product),
    constraint values_Store_Store_fk
        foreign key (Store) references Store (Store),
    constraint values_Year_Year_fk
        foreign key (PeriodYear) references PeriodYear (PeriodYear)
);