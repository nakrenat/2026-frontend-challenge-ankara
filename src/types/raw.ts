// Raw shapes returned by the Jotform API after answer parsing

export interface RawCheckin {
  id: string;
  created_at: string;
  personName: string;
  timestamp: string;
  location: string;
  coordinates: string;
  note: string;
}

export interface RawMessage {
  id: string;
  created_at: string;
  senderName: string;
  recipientName: string;
  timestamp: string;
  location: string;
  coordinates: string;
  text: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface RawSighting {
  id: string;
  created_at: string;
  personName: string;
  seenWith: string;
  timestamp: string;
  location: string;
  coordinates: string;
  note: string;
}

export interface RawPersonalNote {
  id: string;
  created_at: string;
  authorName: string;
  timestamp: string;
  location: string;
  coordinates: string;
  note: string;
  mentionedPeople: string;
}

export interface RawTip {
  id: string;
  created_at: string;
  submissionDate: string;
  timestamp: string;
  location: string;
  coordinates: string;
  suspectName: string;
  tip: string;
  confidence: 'low' | 'medium' | 'high';
}

// Jotform API submission wrapper
export interface JotformSubmission {
  id: string;
  created_at: string;
  answers: Record<string, { name: string; answer: string | Record<string, string> }>;
}

export interface JotformApiResponse {
  content: JotformSubmission[];
  resultSet: { offset: number; limit: number; count: number };
  responseCode: number;
}
