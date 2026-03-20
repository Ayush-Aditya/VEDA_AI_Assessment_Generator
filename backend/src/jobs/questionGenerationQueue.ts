import { Queue, Worker, Job, QueueEvents, JobsOptions, RedisOptions } from 'bullmq';
import PromptBuilder from '../services/promptBuilder';
import LLMService from '../services/llmService';
import { Assignment } from '../types';
import { saveJobState } from '../infra/redis';

const QUEUE_NAME = 'question-generation';

export interface QuestionGenerationJobData {
  assignment: Assignment;
  context?: string;
  customPrompt?: string;
}

export interface QuestionGenerationJobResult {
  questions: Record<string, unknown>[];
}

interface QueueSetupOptions {
  redisUrl?: string;
  onStatusChange?: (event: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    message?: string;
    data?: Record<string, unknown>;
    error?: string;
  }) => void;
}

let queue: Queue<QuestionGenerationJobData, QuestionGenerationJobResult> | null = null;
let worker: Worker<QuestionGenerationJobData, QuestionGenerationJobResult> | null = null;
let queueEvents: QueueEvents | null = null;
let queueReady = false;

function buildConnection(redisUrl?: string): RedisOptions | null {
  const effectiveUrl = redisUrl?.trim() || process.env.REDIS_URL?.trim();

  if (!effectiveUrl) {
    return null;
  }

  const parsed = new URL(effectiveUrl);
  const connection: RedisOptions = {
    host: parsed.hostname,
    port: Number(parsed.port || '6379'),
    maxRetriesPerRequest: null,
  };

  if (parsed.password) {
    connection.password = parsed.password;
  }

  if (parsed.username) {
    connection.username = parsed.username;
  }

  if (parsed.protocol === 'rediss:') {
    connection.tls = {};
  }

  return connection;
}

async function setAndEmit(
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed',
  options: {
    message?: string;
    data?: Record<string, unknown>;
    error?: string;
    onStatusChange?: QueueSetupOptions['onStatusChange'];
  } = {}
): Promise<void> {
  const payload = {
    jobId,
    status,
    message: options.message,
    data: options.data,
    error: options.error,
    updatedAt: new Date().toISOString(),
  };

  await saveJobState(jobId, payload);

  if (options.onStatusChange) {
    options.onStatusChange(payload);
  }
}

export async function initializeQuestionGenerationQueue(options: QueueSetupOptions = {}): Promise<boolean> {
  const connection = buildConnection(options.redisUrl);

  if (!connection) {
    console.warn('BullMQ disabled: REDIS_URL not set');
    return false;
  }

  if (queueReady) {
    return true;
  }

  const defaultJobOptions: JobsOptions = {
    attempts: 2,
    removeOnComplete: 100,
    removeOnFail: 100,
  };

  queue = new Queue<QuestionGenerationJobData, QuestionGenerationJobResult>(QUEUE_NAME, {
    connection,
    defaultJobOptions,
  });

  queueEvents = new QueueEvents(QUEUE_NAME, { connection });

  worker = new Worker<QuestionGenerationJobData, QuestionGenerationJobResult>(
    QUEUE_NAME,
    async (job: Job<QuestionGenerationJobData, QuestionGenerationJobResult>) => {
      await setAndEmit(job.id!, 'processing', {
        message: 'Question generation started',
        onStatusChange: options.onStatusChange,
      });

      const { assignment, context, customPrompt } = job.data;

      const llmService = new LLMService();
      const generationPrompt = PromptBuilder.buildGenerationPrompt({
        assignment,
        context,
        customPrompt,
      });

      const result = await llmService.generateQuestionsWithLatex(generationPrompt, assignment);

      if (!result.success || !result.questions) {
        const normalizedError = result.error || 'Failed to generate questions';
        throw new Error(normalizedError);
      }

      return {
        questions: result.questions as Record<string, unknown>[],
      };
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on('completed', async (job, result) => {
    if (!job?.id) {
      return;
    }

    await setAndEmit(job.id, 'completed', {
      message: 'Question generation completed',
      data: { questions: result.questions },
      onStatusChange: options.onStatusChange,
    });
  });

  worker.on('failed', async (job, error) => {
    if (!job?.id) {
      return;
    }

    await setAndEmit(job.id, 'failed', {
      message: 'Question generation failed',
      error: error.message,
      onStatusChange: options.onStatusChange,
    });
  });

  queueReady = true;
  console.log('✅ BullMQ queue and worker ready');
  return true;
}

export async function enqueueQuestionGenerationJob(data: QuestionGenerationJobData): Promise<string> {
  if (!queue || !queueReady) {
    throw new Error('Question queue is not ready. Ensure REDIS_URL is configured and server is restarted.');
  }

  const job = await queue.add('generate', data);
  const jobId = String(job.id);

  await saveJobState(jobId, {
    jobId,
    status: 'queued',
    message: 'Job queued successfully',
    updatedAt: new Date().toISOString(),
  });

  return jobId;
}

export async function getQuestionGenerationJob(jobId: string): Promise<Job<QuestionGenerationJobData, QuestionGenerationJobResult> | null> {
  if (!queue || !queueReady) {
    return null;
  }

  const job = await queue.getJob(jobId);
  return job ?? null;
}

export async function closeQuestionGenerationQueue(): Promise<void> {
  queueReady = false;

  if (worker) {
    await worker.close();
    worker = null;
  }

  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }

  if (queue) {
    await queue.close();
    queue = null;
  }
}
