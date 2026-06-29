-- ART CENTER ART HOUSE — Portfolio Admin Schema
-- Supabase Dashboard > SQL Editor 에서 실행하세요.

-- 1. 포트폴리오 항목
create table if not exists public.portfolio_items (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    thumb_url text not null,
    sort_order bigint not null default 0,
    created_at timestamptz not null default now()
);

-- 2. 포트폴리오 상세 이미지 (라이트박스용)
create table if not exists public.portfolio_images (
    id uuid primary key default gen_random_uuid(),
    portfolio_id uuid not null references public.portfolio_items(id) on delete cascade,
    image_url text not null,
    sort_order bigint not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists portfolio_items_sort_idx on public.portfolio_items (sort_order desc, created_at desc);
create index if not exists portfolio_images_portfolio_idx on public.portfolio_images (portfolio_id, sort_order);

-- 기존 DB 마이그레이션 (sort_order가 int인 경우 — Date.now() 밀리초 오류 방지)
alter table public.portfolio_items alter column sort_order type bigint;
alter table public.portfolio_images alter column sort_order type bigint;

-- 3. RLS
alter table public.portfolio_items enable row level security;
alter table public.portfolio_images enable row level security;

-- 누구나 읽기 (공개 포트폴리오)
create policy "portfolio_items public read"
    on public.portfolio_items for select
    using (true);

create policy "portfolio_images public read"
    on public.portfolio_images for select
    using (true);

-- 로그인한 관리자만 쓰기
create policy "portfolio_items admin insert"
    on public.portfolio_items for insert
    to authenticated
    with check (true);

create policy "portfolio_items admin update"
    on public.portfolio_items for update
    to authenticated
    using (true);

create policy "portfolio_items admin delete"
    on public.portfolio_items for delete
    to authenticated
    using (true);

create policy "portfolio_images admin insert"
    on public.portfolio_images for insert
    to authenticated
    with check (true);

create policy "portfolio_images admin update"
    on public.portfolio_images for update
    to authenticated
    using (true);

create policy "portfolio_images admin delete"
    on public.portfolio_images for delete
    to authenticated
    using (true);

-- 4. Storage 버킷 (Dashboard > Storage 에서 'portfolio' 버킷 생성 후 Public 체크)
-- 또는 아래 storage policies만 적용 (버킷은 UI에서 생성)

-- Storage policies (버킷 이름: portfolio)
-- Dashboard > Storage > portfolio > Policies 에서 추가하거나 SQL:

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

create policy "portfolio storage public read"
    on storage.objects for select
    using (bucket_id = 'portfolio');

create policy "portfolio storage admin upload"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'portfolio');

create policy "portfolio storage admin update"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'portfolio');

create policy "portfolio storage admin delete"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'portfolio');

-- 5. 문의 폼
create table if not exists public.contact_inquiries (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text,
    inquiry_type text not null,
    message text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_idx on public.contact_inquiries (created_at desc);
create index if not exists contact_inquiries_unread_idx on public.contact_inquiries (is_read, created_at desc);

alter table public.contact_inquiries enable row level security;

-- 누구나 문의 접수 (anon 포함)
create policy "contact_inquiries public insert"
    on public.contact_inquiries for insert
    to anon, authenticated
    with check (true);

-- 관리자만 조회/수정/삭제
create policy "contact_inquiries admin select"
    on public.contact_inquiries for select
    to authenticated
    using (true);

create policy "contact_inquiries admin update"
    on public.contact_inquiries for update
    to authenticated
    using (true);

create policy "contact_inquiries admin delete"
    on public.contact_inquiries for delete
    to authenticated
    using (true);

-- 6. 홈 스튜디오 갤러리
create table if not exists public.studio_items (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    image_url text not null,
    sort_order bigint not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists studio_items_sort_idx on public.studio_items (sort_order asc, created_at asc);

alter table public.studio_items enable row level security;

create policy "studio_items public read"
    on public.studio_items for select
    using (true);

create policy "studio_items admin insert"
    on public.studio_items for insert
    to authenticated
    with check (true);

create policy "studio_items admin update"
    on public.studio_items for update
    to authenticated
    using (true);

create policy "studio_items admin delete"
    on public.studio_items for delete
    to authenticated
    using (true);

-- studio_items 상세 필드 (스튜디오 페이지용)
alter table public.studio_items add column if not exists branch text;
alter table public.studio_items add column if not exists category text;
alter table public.studio_items add column if not exists address text;
alter table public.studio_items add column if not exists area text;
alter table public.studio_items add column if not exists size_spec text;
alter table public.studio_items add column if not exists power text;
alter table public.studio_items add column if not exists facilities text;
alter table public.studio_items add column if not exists amenities text;
alter table public.studio_items add column if not exists slug text;

create unique index if not exists studio_items_slug_idx on public.studio_items (slug) where slug is not null;

alter table public.portfolio_items add column if not exists category text;

alter table public.studio_items add column if not exists layout_image_url text;

-- 7. 스튜디오 상세 갤러리 섹션
create table if not exists public.studio_sections (
    id uuid primary key default gen_random_uuid(),
    studio_id uuid not null references public.studio_items(id) on delete cascade,
    title text not null,
    floor_label text,
    sort_order bigint not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.studio_section_images (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references public.studio_sections(id) on delete cascade,
    image_url text not null,
    sort_order bigint not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists studio_sections_studio_idx on public.studio_sections (studio_id, sort_order);
create index if not exists studio_section_images_section_idx on public.studio_section_images (section_id, sort_order);

alter table public.studio_sections enable row level security;
alter table public.studio_section_images enable row level security;

create policy "studio_sections public read" on public.studio_sections for select using (true);
create policy "studio_section_images public read" on public.studio_section_images for select using (true);
create policy "studio_sections admin insert" on public.studio_sections for insert to authenticated with check (true);
create policy "studio_sections admin update" on public.studio_sections for update to authenticated using (true);
create policy "studio_sections admin delete" on public.studio_sections for delete to authenticated using (true);
create policy "studio_section_images admin insert" on public.studio_section_images for insert to authenticated with check (true);
create policy "studio_section_images admin update" on public.studio_section_images for update to authenticated using (true);
create policy "studio_section_images admin delete" on public.studio_section_images for delete to authenticated using (true);
