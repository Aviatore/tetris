create table if not exists score (
    score_id serial primary key not null,
    score integer
);

-- The table 'score' needs at least one value for the database to work properly
-- Below query adds a zero to the table
insert into score(score)
values(0);