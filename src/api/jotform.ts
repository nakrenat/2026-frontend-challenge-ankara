import type { JotformApiResponse, JotformSubmission } from '../types/raw';

const API_KEY = import.meta.env.VITE_JOTFORM_API_KEY as string;
const BASE_URL = 'https://api.jotform.com';
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 450;

export const FORM_IDS = {
  checkins:      '261065067494966',
  messages:      '261065765723966',
  sightings:     '261065244786967',
  personalNotes: '261065509008958',
  anonymousTips: '261065875889981',
} as const;

class JotformRequestError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = 'JotformRequestError';
    this.retryable = retryable;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

function backoffDelayMs(attempt: number): number {
  const exponential = BASE_RETRY_DELAY_MS * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 120);
  return exponential + jitter;
}

async function fetchPage(formId: string, offset: number, limit = 100): Promise<JotformApiResponse> {
  if (!API_KEY) throw new Error('VITE_JOTFORM_API_KEY is not set. Add it to .env.local and restart the dev server.');

  const url = new URL(`${BASE_URL}/form/${formId}/submissions`);
  url.searchParams.set('apiKey', API_KEY);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('orderby', 'created_at');
  url.searchParams.set('direction', 'DESC');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const retryable = isRetryableStatus(res.status);
    throw new JotformRequestError(`HTTP ${res.status} for form ${formId}`, retryable);
  }

  const json = await res.json() as JotformApiResponse;

  // Jotform returns HTTP 200 even for auth failures — check the inner responseCode
  if (json.responseCode !== 200) {
    const retryable = isRetryableStatus(json.responseCode);
    throw new JotformRequestError(`Jotform API error ${json.responseCode} for form ${formId}`, retryable);
  }

  return json;
}

async function fetchPageWithRetry(formId: string, offset: number, limit = 100): Promise<JotformApiResponse> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fetchPage(formId, offset, limit);
    } catch (error) {
      const isRetryable =
        error instanceof JotformRequestError
          ? error.retryable
          : false;

      if (!isRetryable || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = backoffDelayMs(attempt);
      console.warn(
        `[jotform] retrying form=${formId} offset=${offset} in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(delay);
    }
  }

  // Unreachable guard for TypeScript
  throw new Error(`Unexpected retry flow for form ${formId}`);
}

export async function fetchAllSubmissions(formId: string): Promise<JotformSubmission[]> {
  const all: JotformSubmission[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await fetchPageWithRetry(formId, offset, limit);
    const batch = Array.isArray(data.content) ? data.content : [];
    console.log(`[jotform] form=${formId} offset=${offset} batch=${batch.length}`);
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return all;
}

function extractAnswer(
  answers: JotformSubmission['answers'],
  name: string,
): string {
  const entry = Object.values(answers).find((a) => a.name === name);
  if (!entry) return '';
  const val = entry.answer;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  return '';
}

// ── Typed parsers ────────────────────────────────────────────────────────────

import type {
  RawCheckin,
  RawMessage,
  RawPersonalNote,
  RawSighting,
  RawTip,
} from '../types/raw';

export function parseCheckin(sub: JotformSubmission): RawCheckin {
  const a = sub.answers;
  return {
    id: sub.id,
    created_at: sub.created_at,
    personName: extractAnswer(a, 'personName'),
    timestamp:  extractAnswer(a, 'timestamp'),
    location:   extractAnswer(a, 'location'),
    coordinates: extractAnswer(a, 'coordinates'),
    note:       extractAnswer(a, 'note'),
  };
}

export function parseMessage(sub: JotformSubmission): RawMessage {
  const a = sub.answers;
  const urgencyRaw = extractAnswer(a, 'urgency') as RawMessage['urgency'];
  const urgency: RawMessage['urgency'] = ['low', 'medium', 'high'].includes(urgencyRaw)
    ? urgencyRaw
    : 'low';
  return {
    id: sub.id,
    created_at: sub.created_at,
    senderName:    extractAnswer(a, 'senderName'),
    recipientName: extractAnswer(a, 'recipientName'),
    timestamp:     extractAnswer(a, 'timestamp'),
    location:      extractAnswer(a, 'location'),
    coordinates:   extractAnswer(a, 'coordinates'),
    text:          extractAnswer(a, 'text'),
    urgency,
  };
}

export function parseSighting(sub: JotformSubmission): RawSighting {
  const a = sub.answers;
  return {
    id: sub.id,
    created_at: sub.created_at,
    personName:  extractAnswer(a, 'personName'),
    seenWith:    extractAnswer(a, 'seenWith'),
    timestamp:   extractAnswer(a, 'timestamp'),
    location:    extractAnswer(a, 'location'),
    coordinates: extractAnswer(a, 'coordinates'),
    note:        extractAnswer(a, 'note'),
  };
}

export function parsePersonalNote(sub: JotformSubmission): RawPersonalNote {
  const a = sub.answers;
  return {
    id: sub.id,
    created_at: sub.created_at,
    authorName:      extractAnswer(a, 'authorName'),
    timestamp:       extractAnswer(a, 'timestamp'),
    location:        extractAnswer(a, 'location'),
    coordinates:     extractAnswer(a, 'coordinates'),
    note:            extractAnswer(a, 'note'),
    mentionedPeople: extractAnswer(a, 'mentionedPeople'),
  };
}

export function parseTip(sub: JotformSubmission): RawTip {
  const a = sub.answers;
  const confRaw = extractAnswer(a, 'confidence') as RawTip['confidence'];
  const confidence: RawTip['confidence'] = ['low', 'medium', 'high'].includes(confRaw)
    ? confRaw
    : 'low';
  return {
    id: sub.id,
    created_at: sub.created_at,
    submissionDate: extractAnswer(a, 'submissionDate'),
    timestamp:      extractAnswer(a, 'timestamp'),
    location:       extractAnswer(a, 'location'),
    coordinates:    extractAnswer(a, 'coordinates'),
    suspectName:    extractAnswer(a, 'suspectName'),
    tip:            extractAnswer(a, 'tip'),
    confidence,
  };
}
