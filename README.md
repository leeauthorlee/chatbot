# Green Cup

한국어 커피 추천 챗봇입니다. Next.js App Router와 OpenAI API를 사용하며 Vercel에 배포할 수 있습니다.

## 시작하기

```bash
npm install
copy .env.example .env.local
```

`.env.local`에 OpenAI API 키를 입력한 뒤 개발 서버를 실행합니다.

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

```bash
npm run dev
```

## Vercel 배포

저장소를 Vercel에 연결하고 프로젝트 설정의 **Environment Variables**에 `OPENAI_API_KEY`를 추가하세요. 필요하면 `OPENAI_MODEL`도 설정할 수 있습니다. 이후 배포하면 됩니다. API 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다.

## 확인

```bash
npm run build
```
