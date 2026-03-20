import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { connectDatabase } from './config/database';
import PromptBuilder from './services/promptBuilder';
import LLMService from './services/llmService';
import { Assignment } from './types';
import { initializeRedis, getJobState, closeRedis } from './infra/redis';
import {
  initializeQuestionGenerationQueue,
  enqueueQuestionGenerationJob,
  getQuestionGenerationJob,
  closeQuestionGenerationQueue,
} from './jobs/questionGenerationQueue';
import {
  initializeWebSocketServer,
  broadcastJobStatus,
  closeWebSocketServer,
} from './websocket/realtime';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
let httpServer: ReturnType<typeof createServer> | null = null;

const savedAssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    examDate: { type: String, default: '--' },
    assignedOn: { type: String, required: true },
    questionPaper: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const SavedAssignment =
  mongoose.models.SavedAssignment ||
  mongoose.model('SavedAssignment', savedAssignmentSchema);

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/assignments', async (_req: Request, res: Response) => {
  try {
    const assignments = await SavedAssignment.find().sort({ createdAt: -1 }).lean();

    const data = assignments.map((item: any) => ({
      id: String(item._id),
      title: item.title,
      assignedOn: item.assignedOn,
      examDate: item.examDate,
      paper: item.questionPaper,
    }));

    return res.json({ success: true, data: { assignments: data } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch assignments' });
  }
});

app.post('/api/assignments', async (req: Request, res: Response) => {
  try {
    const assignment = req.body?.assignment as Assignment | undefined;
    const questionPaper = req.body?.questionPaper as Record<string, unknown> | undefined;

    if (!assignment || !questionPaper) {
      return res.status(400).json({ success: false, error: 'Missing assignment or questionPaper payload' });
    }

    const assignedOn = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const examDate = assignment.examDate?.trim() || '--';
    const title = assignment.title?.trim() || `${assignment.subject} Assignment`;

    const saved = await SavedAssignment.create({
      title,
      subject: assignment.subject,
      examDate,
      assignedOn,
      questionPaper,
    });

    return res.status(201).json({
      success: true,
      data: {
        assignment: {
          id: String(saved._id),
          title: saved.title,
          assignedOn: saved.assignedOn,
          examDate: saved.examDate,
          paper: saved.questionPaper,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to save assignment' });
  }
});

app.patch('/api/assignments/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const title = String(req.body?.title || '').trim();

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const updated = await SavedAssignment.findByIdAndUpdate(
      id,
      { $set: { title } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    return res.json({
      success: true,
      data: {
        assignment: {
          id: String(updated._id),
          title: updated.title,
          assignedOn: updated.assignedOn,
          examDate: updated.examDate,
          paper: updated.questionPaper,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to rename assignment' });
  }
});

app.delete('/api/assignments/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deleted = await SavedAssignment.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete assignment' });
  }
});

app.post('/api/questions/generate', async (req: Request, res: Response) => {
  try {
    const assignment = req.body?.assignment as Assignment | undefined;
    const context = req.body?.context as string | undefined;
    const customPrompt = req.body?.customPrompt as string | undefined;

    if (!assignment) {
      return res.status(400).json({ success: false, error: 'Missing assignment payload' });
    }

    if (!assignment.subject || !assignment.questionConfigs?.length) {
      return res.status(400).json({
        success: false,
        error: 'Assignment must include subject and at least one question configuration',
      });
    }

    const llmService = new LLMService();

    const generationPrompt = PromptBuilder.buildGenerationPrompt({
      assignment,
      context,
      customPrompt,
    });

    // Single optimized API call - generates questions and LaTeX together
    const result = await llmService.generateQuestionsWithLatex(generationPrompt, assignment);
    
    if (!result.success || !result.questions) {
      const statusMatch = result.error?.match(/^\[(\d{3})\]/);
      const status = statusMatch ? Number(statusMatch[1]) : 500;
      const normalizedError = result.error?.replace(/^\[\d{3}\]\s*/, '') || 'Failed to generate questions';
      return res.status(status).json({
        success: false,
        error: normalizedError,
      });
    }

    return res.json({
      success: true,
      data: {
        questions: result.questions,
      },
    });
  } catch (error: any) {
    console.error('Question generation endpoint error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions',
    });
  }
});

app.post('/api/questions/generate-async', async (req: Request, res: Response) => {
  try {
    const assignment = req.body?.assignment as Assignment | undefined;
    const context = req.body?.context as string | undefined;
    const customPrompt = req.body?.customPrompt as string | undefined;

    if (!assignment) {
      return res.status(400).json({ success: false, error: 'Missing assignment payload' });
    }

    if (!assignment.subject || !assignment.questionConfigs?.length) {
      return res.status(400).json({
        success: false,
        error: 'Assignment must include subject and at least one question configuration',
      });
    }

    const jobId = await enqueueQuestionGenerationJob({
      assignment,
      context,
      customPrompt,
    });

    broadcastJobStatus({
      type: 'job-status',
      payload: {
        jobId,
        status: 'queued',
        message: 'Question generation job queued',
        updatedAt: new Date().toISOString(),
      },
    });

    return res.status(202).json({
      success: true,
      data: {
        jobId,
        status: 'queued',
      },
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to queue question generation job';
    const isQueueConfigError = message.toLowerCase().includes('queue is not ready');

    return res.status(isQueueConfigError ? 503 : 500).json({
      success: false,
      error: message,
    });
  }
});

app.get('/api/questions/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const jobIdParam = req.params.jobId;
    const jobId = Array.isArray(jobIdParam) ? jobIdParam[0] : jobIdParam;

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'jobId is required' });
    }

    const cached = await getJobState(jobId);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const job = await getQuestionGenerationJob(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const state = await job.getState();

    return res.json({
      success: true,
      data: {
        jobId,
        status: state,
        result: job.returnvalue || null,
        failedReason: job.failedReason || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job status',
    });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
async function startServer() {
  try {
    const dbConnected = await connectDatabase();
    await initializeRedis();

    await initializeQuestionGenerationQueue({
      onStatusChange: (event) => {
        broadcastJobStatus({
          type: 'job-status',
          payload: {
            jobId: event.jobId,
            status: event.status,
            message: event.message,
            data: event.data,
            error: event.error,
            updatedAt: new Date().toISOString(),
          },
        });
      },
    });
    
    httpServer = createServer(app);

    httpServer.listen(PORT, () => {
      initializeWebSocketServer(httpServer!);
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📀 Database: ${dbConnected ? 'Connected' : 'Unavailable (degraded mode)'}`);
      console.log(`💾 Redis: ${process.env.REDIS_URL ? 'Connected' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Closing resources...`);

  await closeQuestionGenerationQueue();
  await closeWebSocketServer();
  await closeRedis();

  if (httpServer) {
    httpServer.close();
  }

  process.exit(0);
}

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

export default app;
