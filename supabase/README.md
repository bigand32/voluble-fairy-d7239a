# Supabase 포트폴리오 Admin 설정

## 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **Project Settings → API** 에서 URL, anon key 복사

## 2. 설정 파일
```bash
cp assets/js/supabase-config.example.js assets/js/supabase-config.js
```
`supabase-config.js` 에 URL과 anon key 입력

## 3. DB & Storage 설정
Supabase Dashboard → **SQL Editor** → `supabase/schema.sql` 내용 붙여넣기 후 실행

또는 Storage에서 수동으로:
- 버킷 이름: `portfolio`
- **Public bucket** 체크

## 4. 관리자 계정
Dashboard → **Authentication → Users → Add user**
- 이메일 / 비밀번호로 관리자 계정 생성

## 5. 사용
- Admin: `admin.html` 접속 → 로그인 → 포트폴리오 등록/삭제, **문의 접수 확인**
- 사이트: `portfolio.html` 에서 Supabase 데이터 자동 표시
- 문의: `contact.html` 폼 제출 → Admin **문의** 탭에서 확인

## 파일 구조
```
admin.html              — 관리 페이지 (포트폴리오 + 문의)
assets/js/admin.js      — 포트폴리오 업로드/수정/삭제
assets/js/admin-inquiries.js — 문의 목록
assets/js/contact.js    — 문의 폼 제출
assets/js/supabase-config.js  — API 키 (직접 입력)
supabase/schema.sql     — DB 테이블 & RLS
```
