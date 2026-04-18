import type {
  RawCheckin,
  RawMessage,
  RawPersonalNote,
  RawSighting,
  RawTip,
} from '../types/raw';
import type {
  Coordinates,
  EventType,
  Person,
  SuspicionLevel,
  TimelineEvent,
} from '../types/domain';

// ── Name normalisation ────────────────────────────────────────────────────────

/** Lower-case, trim, collapse internal spaces → used as Person.id */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Fuzzy match: treats "Kağan", "Kagan", "Kağan A." as the same person */
function fuzzyMatch(a: string, b: string): boolean {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[ğ]/g, 'g')
      .replace(/[ü]/g, 'u')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/\./g, '')
      .trim()
      .split(' ')[0]; // compare first token only

  return clean(a) === clean(b);
}

/** Resolve a raw name to the canonical Person id already in the map.
 *  Creates a new entry if no fuzzy match exists. */
function resolveId(name: string, registry: Map<string, string>): string {
  const norm = normalizeName(name);
  for (const [canonical] of registry) {
    if (fuzzyMatch(canonical, norm)) return canonical;
  }
  registry.set(norm, name.trim()); // canonical id → display name
  return norm;
}

// ── Coordinate parsing ────────────────────────────────────────────────────────

function parseCoords(raw: string): Coordinates | null {
  const parts = raw.split(',').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

// ── Suspicion scoring ─────────────────────────────────────────────────────────

const URGENCY_SCORE: Record<string, number> = { low: 0, medium: 5, high: 15 };
const CONFIDENCE_SCORE: Record<string, number> = { low: 10, medium: 20, high: 30 };

function scoreLevel(score: number): SuspicionLevel {
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  if (score >= 10) return 'low';
  return 'none';
}

// ── Timeline event helpers ────────────────────────────────────────────────────

function makeEvent(
  source: TimelineEvent['source'],
  type: EventType,
  timestamp: string,
  location: string,
  coordinates: string,
  description: string,
  suspicionLevel: SuspicionLevel,
  relatedPeople: string[],
): TimelineEvent {
  return {
    id: (source as { id: string }).id + '_' + type,
    type,
    timestamp,
    location,
    coordinates: parseCoords(coordinates),
    description,
    suspicionLevel,
    relatedPeople,
    source,
  };
}

// ── Main builder ──────────────────────────────────────────────────────────────

export interface RawDataBundle {
  checkins: RawCheckin[];
  messages: RawMessage[];
  sightings: RawSighting[];
  personalNotes: RawPersonalNote[];
  tips: RawTip[];
}

export function buildPeople(data: RawDataBundle): Person[] {
  // Step 1 — discover all person names + build canonical registry
  const registry = new Map<string, string>(); // canonical-id → display name

  const allNames: string[] = [
    ...data.checkins.map((c) => c.personName),
    ...data.messages.flatMap((m) => [m.senderName, m.recipientName]),
    ...data.sightings.flatMap((s) => [s.personName, s.seenWith]),
    ...data.personalNotes.map((n) => n.authorName),
    ...data.personalNotes.flatMap((n) =>
      n.mentionedPeople.split(',').map((p) => p.trim()).filter(Boolean),
    ),
    ...data.tips.map((t) => t.suspectName),
  ];

  allNames.filter(Boolean).forEach((name) => resolveId(name, registry));

  // Step 2 — initialise Person shells
  const personMap = new Map<string, Person>();

  for (const [id, displayName] of registry) {
    personMap.set(id, {
      id,
      name: displayName,
      suspicionScore: 0,
      suspicionLevel: 'none',
      checkins: [],
      messagesSent: [],
      messagesReceived: [],
      sightingsOf: [],
      sightingsWith: [],
      notesAuthored: [],
      notesMentioned: [],
      tips: [],
      timeline: [],
      lastSeenLocation: null,
      lastSeenTime: null,
      isMainSubject: fuzzyMatch(displayName, 'podo'),
    });
  }

  const getPerson = (name: string): Person | undefined =>
    personMap.get(resolveId(name, registry));

  // Step 3 — attach raw records & build timeline events

  // Checkins
  for (const c of data.checkins) {
    const p = getPerson(c.personName);
    if (!p) continue;
    p.checkins.push(c);
    p.timeline.push(
      makeEvent(c, 'checkin', c.timestamp, c.location, c.coordinates, c.note, 'none', []),
    );
  }

  // Messages
  for (const m of data.messages) {
    const sender = getPerson(m.senderName);
    const recipient = getPerson(m.recipientName);
    const level: SuspicionLevel = m.urgency === 'high' ? 'high' : m.urgency === 'medium' ? 'medium' : 'none';

    if (sender) {
      sender.messagesSent.push(m);
      sender.suspicionScore += URGENCY_SCORE[m.urgency] ?? 0;
      sender.timeline.push(
        makeEvent(
          m, 'message_sent', m.timestamp, m.location, m.coordinates,
          `Sent to ${m.recipientName}: "${m.text}"`, level, [m.recipientName],
        ),
      );
    }
    if (recipient) {
      recipient.messagesReceived.push(m);
      recipient.timeline.push(
        makeEvent(
          m, 'message_received', m.timestamp, m.location, m.coordinates,
          `Received from ${m.senderName}: "${m.text}"`, level, [m.senderName],
        ),
      );
    }
  }

  // Sightings
  for (const s of data.sightings) {
    const observed = getPerson(s.personName);
    const companion = getPerson(s.seenWith);

    if (observed) {
      observed.sightingsOf.push(s);
      observed.timeline.push(
        makeEvent(
          s, 'sighting_of', s.timestamp, s.location, s.coordinates,
          `Spotted with ${s.seenWith}: ${s.note}`, 'none', [s.seenWith],
        ),
      );
    }
    if (companion && s.seenWith.toLowerCase() !== 'unknown') {
      companion.sightingsWith.push(s);
      companion.timeline.push(
        makeEvent(
          s, 'sighting_with', s.timestamp, s.location, s.coordinates,
          `Seen with ${s.personName}: ${s.note}`, 'low', [s.personName],
        ),
      );
    }
  }

  // Personal Notes
  for (const n of data.personalNotes) {
    const author = getPerson(n.authorName);
    if (author) {
      author.notesAuthored.push(n);
      author.timeline.push(
        makeEvent(n, 'note_authored', n.timestamp, n.location, n.coordinates, n.note, 'none', []),
      );
    }
    const mentioned = n.mentionedPeople
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const name of mentioned) {
      const mp = getPerson(name);
      if (mp) {
        mp.notesMentioned.push(n);
        mp.timeline.push(
          makeEvent(
            n, 'note_mentioned', n.timestamp, n.location, n.coordinates,
            `Mentioned by ${n.authorName}: "${n.note}"`, 'none', [n.authorName],
          ),
        );
      }
    }
  }

  // Anonymous Tips
  for (const t of data.tips) {
    const suspect = getPerson(t.suspectName);
    if (!suspect) continue;
    suspect.tips.push(t);
    suspect.suspicionScore += CONFIDENCE_SCORE[t.confidence] ?? 10;
    const level = scoreLevel(CONFIDENCE_SCORE[t.confidence] ?? 10);
    suspect.timeline.push(
      makeEvent(
        t, 'tip', t.timestamp, t.location, t.coordinates,
        `Anonymous tip (${t.confidence} confidence): "${t.tip}"`, level, [],
      ),
    );
  }

  // Step 4 — sort timelines, derive last-seen, finalise suspicion level
  for (const p of personMap.values()) {
    p.timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const lastEvent = [...p.timeline].reverse().find((e) => e.location);
    if (lastEvent) {
      p.lastSeenLocation = lastEvent.location;
      p.lastSeenTime = lastEvent.timestamp;
    }

    // Bonus score: last person seen with Podo before disappearance
    const podo = personMap.get('podo');
    if (podo && p.id !== 'podo') {
      const lastPodoSighting = podo.sightingsOf
        .filter((s) => fuzzyMatch(s.seenWith, p.name))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
      if (lastPodoSighting) p.suspicionScore += 25;
    }

    p.suspicionScore = Math.min(100, p.suspicionScore);
    p.suspicionLevel = scoreLevel(p.suspicionScore);
  }

  return Array.from(personMap.values()).sort((a, b) => b.suspicionScore - a.suspicionScore);
}
