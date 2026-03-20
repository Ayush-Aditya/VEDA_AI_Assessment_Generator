# VedaAI

AI-powered assessment generation platform for teachers.

VedaAI lets educators configure an exam pattern, generate questions with Gemini, review/edit the paper, and export a polished question paper.

## Highlights

- Full-stack TypeScript monorepo (Next.js + Express)
- Assignment CRUD with MongoDB persistence
- Synchronous and asynchronous question generation endpoints
- Redis + BullMQ queue pipeline for long-running generation
- WebSocket job status updates
- PDF-ready question paper preview/download flow

## Architecture

### Frontend

- Next.js 16 (App Router), React 19, Tailwind CSS
- Zustand for assignment and UI state
- Axios-based API clients

### Backend

- Express 5 + TypeScript
- MongoDB (Mongoose) for saved assignments
- Redis for job state and queue backend
- BullMQ worker for async generation jobs
- WebSocket broadcast channel for realtime job updates

### AI Layer

- Gemini API integration (model configurable via env)
- Prompt builder composes assignment settings + optional context
- JSON-only response strategy for stable parsing

## Why This Architecture

- Fast UX: sync endpoint gives quick results for small workloads.
- Scalable UX: async endpoint prevents UI timeout for larger jobs.
- Reliability: queue retries and cached job states improve resilience.
- Extensibility: provider/model can be swapped from environment config.
- Deployment-friendly: frontend/backend can be deployed independently.

## Folder Structure

```text
vedaAI/
   backend/
      src/
         config/
         infra/
         jobs/
         services/
         websocket/
         server.ts
   frontend/
      app/
      components/
      lib/
      src/store/
      public/
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB URI (Atlas or local)
- Redis URL (local or managed)
- Gemini API key

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure backend environment

Copy and edit backend environment file:

```bash
cd backend
copy .env.example .env
```

Required fields in backend/.env:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000

MONGODB_URI=your_mongodb_uri
MONGODB_FALLBACK_URI=
ALLOW_START_WITHOUT_DB=false

REDIS_URL=your_redis_url

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

### 3) Start backend

```bash
cd backend
npm run dev
```

Backend URL: http://localhost:5000

### 4) Start frontend

```bash
cd frontend
npm run dev
```

Frontend URL: http://localhost:3000

## Test With Your Own API

After setting GEMINI_API_KEY and starting both services:

1. Open the assignment page.
2. Fill assignment details and question configuration.
3. Generate questions using sync or async flow.
4. Save and verify assignment appears in list.
5. Download question paper PDF.

Quick backend health check:

```bash
curl http://localhost:5000/health
```

## API Surface

### Assignments

- GET /api/assignments
- POST /api/assignments
- PATCH /api/assignments/:id
- DELETE /api/assignments/:id

### Question Generation

- POST /api/questions/generate
- POST /api/questions/generate-async
- GET /api/questions/jobs/:jobId

### Realtime

- WebSocket endpoint: /ws

## Deployment Notes

- Set ALLOW_START_WITHOUT_DB=false in production.
- Use managed MongoDB and Redis with stable network egress.
- Keep REDIS eviction policy as noeviction for BullMQ reliability.
- Configure CORS_ORIGIN to deployed frontend URL.

## License

Private project for assessment workflow implementation.
  difficultyLevel: "easy" | "medium" | "hard" | "mixed";
  dueDate: string;
  questionConfigs: QuestionConfig[];
  fileUpload?: File;
  context?: string; // Curriculum content
  customPrompt?: string; // User instructions
  additionalInstructions: string;
}
```

### Generated Question
```typescript
interface GeneratedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  section: string;
  options?: string[]; // for MCQ
  correctAnswer?: string;
  explanation?: string;
}
```

## Rate Limiting Strategy

For free tier LLM APIs:
1. **Caching** - Redis stores generated questions
2. **Batch Processing** - Process all configurations in one API call
3. **Job Queue** - BullMQ with exponential backoff
4. **Database Deduplication** - Reuse similar papers
5. **Progressive Generation** - Generate one section at a time

## Testing Checklist

- [ ] Create assignment form validation
- [ ] Question configuration UI
- [ ] File upload working
- [ ] Zustand state updates properly
- [ ] Question paper preview displays correctly
- [ ] Mobile responsiveness tested
- [ ] PDF generation working

## Deployment Considerations

### Frontend
- Deploy to Vercel, Netlify, or similar
- Environment variables for API URL

### Backend
- Deploy to Railway, Render, Heroku, or self-hosted
- Ensure MongoDB & Redis accessible
- Set environment variables securely

## Future Enhancements

1. **Advanced PDF Export**
   - Install `html2pdf.js` or `jsPDF`
   - Better LaTeX rendering

2. **Answer Sheet Generation**
   - Auto-generate answer key
   - MCQ answer bubbles

3. **Question Bank**
   - Save reusable questions
   - Category-based filtering

4. **Collaboration Features**
   - Share assignments with colleagues
   - Comments & annotations

5. **Analytics**
   - Track student performance
   - Question difficulty analysis

## Support

For issues or questions about the implementation, refer to the Figma design:
[VedaAI Design File](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment)

---

**Happy Teaching! 🎓**
