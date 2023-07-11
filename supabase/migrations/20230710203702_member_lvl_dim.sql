-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
drop table if exists member_lvl_dim cascade;
create table member_lvl_dim (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector(1536) -- 1536 works for OpenAI embeddings, change if needed
);

-- Create a function to search for documents
create function member_lvl_match_queries (
  query_embedding vector(1536),
  match_count int default null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (member_lvl_dim.embedding <=> query_embedding) as similarity
  from member_lvl_dim
  where metadata @> filter
  order by member_lvl_dim.embedding <=> query_embedding
  limit match_count;
end;
$$;