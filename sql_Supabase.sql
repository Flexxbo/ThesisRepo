create extension vector;

create table squad (
  id text primary key,  
  document_title text,  
  context text,  
  question text default '',  
  answer_text text[],  
  answer_start int[],  
  url text default 'N/A', 
  token_count int default 0,  
  embedding vector (1536)
);

-- Reminder!! Achtung mit der order by clause, die ist nicht optimal, aber es funktioniert. Mit anderer clause hat es nie funktioniert. 

create or replace function squad_search (
  query_embedding vector (1536),
  similarity_threshold float,
  match_count int
) returns table (
  id bigint,
  url text,
  content text,
  title text,
  similarity float
) language plpgsql as $$
begin
  return query
  select
   preptest2.id,
    preptest2.url,
    preptest2.content,
    preptest2.title,
    1 - (preptest2.embedding <=> query_embedding) as similarity
  from preptest2
  where 1 - (preptest2.embedding <=> query_embedding) > similarity_threshold
  order by (1 - (preptest2.embedding <=> query_embedding)) DESC
  limit 5;
end;
$$;



create index on squad
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);