import type { RawCheckin, RawMessage, RawPersonalNote, RawSighting, RawTip } from './raw';

export type SuspicionLevel = 'none' | 'low' | 'medium' | 'high';
export type EventType =
  | 'checkin'
  | 'message_sent'
  | 'message_received'
  | 'sighting_of'
  | 'sighting_with'
  | 'note_authored'
  | 'note_mentioned'
  | 'tip';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;
  location: string;
  coordinates: Coordinates | null;
  description: string;
  suspicionLevel: SuspicionLevel;
  relatedPeople: string[];
  source: RawCheckin | RawMessage | RawSighting | RawPersonalNote | RawTip;
}

export interface Person {
  id: string;           // slug of normalized name
  name: string;
  suspicionScore: number;   // 0–100
  suspicionLevel: SuspicionLevel;
  checkins: RawCheckin[];
  messagesSent: RawMessage[];
  messagesReceived: RawMessage[];
  sightingsOf: RawSighting[];     // sightings where this person is personName
  sightingsWith: RawSighting[];   // sightings where this person appears in seenWith
  notesAuthored: RawPersonalNote[];
  notesMentioned: RawPersonalNote[];
  tips: RawTip[];
  timeline: TimelineEvent[];
  lastSeenLocation: string | null;
  lastSeenTime: string | null;
  isMainSubject: boolean;  // true for Podo
}

export interface InvestigationState {
  people: Person[];
  isLoading: boolean;
  error: string | null;
  selectedPersonId: string | null;
  searchQuery: string;
}
