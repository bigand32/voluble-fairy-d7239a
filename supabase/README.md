# Supabase 설정 가이드

## 1. Supabase 프로젝트
1. [supabase.com](https://supabase.com) → 프로젝트 생성 (이미 있으면 생략)
2. **Project Settings → API** 에서 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

---

## 2. DB & Storage (한 번만)
Supabase Dashboard → **SQL Editor** → `supabase/schema.sql` **전체** 붙여넣기 → Run

Storage 버킷 `portfolio` 가 Public 인지 확인 (schema.sql 에 포함)

---

## 3. Admin 로그인 계정 (4번 — Authentication)

**Supabase 웹사이트 회원가입이 아닙니다.** Admin 페이지(`admin.html`)에 로그인할 **관리자 계정**을 만드는 단계입니다.

1. Supabase Dashboard → **Authentication** → **Users**
2. **Add user** → **Create new user**
3. 이메일·비밀번호 입력 (예: `admin@arthouse.co` / 원하는 비밀번호)
4. **Auto Confirm User** 켜기 (이메일 인증 없이 바로 로그인)
5. Create

이 이메일/비밀번호로 배포된 사이트의 `admin.html` 에 로그인합니다.

---

## 4. Netlify (배포 사이트)

`supabase-config.js` 는 Git에 올리지 않습니다. Netlify 빌드 시 환경 변수로 생성됩니다.

1. Netlify → **Site configuration** → **Environment variables**
2. 추가:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | anon public key |

3. **Deploys** → **Trigger deploy** → **Deploy site**

---

## 5. 로컬 개발

```bash
cp assets/js/supabase-config.example.js assets/js/supabase-config.js
# supabase-config.js 에 URL, anon key 입력

python3 -m http.server 8080
# http://localhost:8080/admin.html
```

---

## 사용
- **Admin** `admin.html` — 포트폴리오 등록/수정, 문의 확인
- **포트폴리오** `portfolio.html` — Supabase 데이터 표시
- **문의** `contact.html` — 폼 제출 → Admin 문의 탭
