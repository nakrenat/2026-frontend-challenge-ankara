import { useEffect, useReducer } from 'react';
import {
  fetchAllSubmissions,
  FORM_IDS,
  parseCheckin,
  parseMessage,
  parseSighting,
  parsePersonalNote,
  parseTip,
} from '../api/jotform';
import { buildPeople } from '../models/buildPeople';
import type { InvestigationState } from '../types/domain';

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: InvestigationState['people'] }
  | { type: 'ERROR'; payload: string }
  | { type: 'SELECT_PERSON'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string };

function reducer(state: InvestigationState, action: Action): InvestigationState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SUCCESS':
      return { ...state, isLoading: false, people: action.payload };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SELECT_PERSON':
      return { ...state, selectedPersonId: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
  }
}

const initialState: InvestigationState = {
  people: [],
  isLoading: true,
  error: null,
  selectedPersonId: null,
  searchQuery: '',
};

export function useInvestigation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'LOADING' });

    const jobs = [
      { key: 'checkins', promise: fetchAllSubmissions(FORM_IDS.checkins) },
      { key: 'messages', promise: fetchAllSubmissions(FORM_IDS.messages) },
      { key: 'sightings', promise: fetchAllSubmissions(FORM_IDS.sightings) },
      { key: 'personalNotes', promise: fetchAllSubmissions(FORM_IDS.personalNotes) },
      { key: 'anonymousTips', promise: fetchAllSubmissions(FORM_IDS.anonymousTips) },
    ] as const;

    Promise.allSettled(jobs.map((j) => j.promise))
      .then((results) => {
        const rawCheckins =
          results[0].status === 'fulfilled' ? results[0].value : [];
        const rawMessages =
          results[1].status === 'fulfilled' ? results[1].value : [];
        const rawSightings =
          results[2].status === 'fulfilled' ? results[2].value : [];
        const rawNotes =
          results[3].status === 'fulfilled' ? results[3].value : [];
        const rawTips =
          results[4].status === 'fulfilled' ? results[4].value : [];

        const failedSources = results
          .map((result, idx) => ({ result, key: jobs[idx].key }))
          .filter((entry) => entry.result.status === 'rejected');

        if (failedSources.length > 0) {
          console.warn(
            '[investigation] partial fetch failure:',
            failedSources.map((f) => f.key),
          );
        }

        if (failedSources.length === jobs.length) {
          const firstErr = failedSources[0].result;
          const msg =
            firstErr.status === 'rejected' && firstErr.reason instanceof Error
              ? firstErr.reason.message
              : 'All data sources failed.';
          dispatch({ type: 'ERROR', payload: msg });
          return;
        }

        console.log('[investigation] raw counts:', {
          checkins: rawCheckins.length,
          messages: rawMessages.length,
          sightings: rawSightings.length,
          notes: rawNotes.length,
          tips: rawTips.length,
        });

        const people = buildPeople({
          checkins:      rawCheckins.map(parseCheckin),
          messages:      rawMessages.map(parseMessage),
          sightings:     rawSightings.map(parseSighting),
          personalNotes: rawNotes.map(parsePersonalNote),
          tips:          rawTips.map(parseTip),
        });

        console.log('[investigation] people built:', people.map((p) => `${p.name} (score=${p.suspicionScore})`));

        if (people.length === 0) {
          dispatch({ type: 'ERROR', payload: 'No case data returned. Check your API key and form IDs.' });
          return;
        }

        dispatch({ type: 'SUCCESS', payload: people });

        // Auto-select Podo on first load
        const podo = people.find((p) => p.isMainSubject);
        if (podo) dispatch({ type: 'SELECT_PERSON', payload: podo.id });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[investigation] fetch failed:', msg);
        dispatch({ type: 'ERROR', payload: msg });
      });
  }, []);

  const selectPerson = (id: string | null) =>
    dispatch({ type: 'SELECT_PERSON', payload: id });

  const setSearch = (q: string) =>
    dispatch({ type: 'SET_SEARCH', payload: q });

  const filteredPeople = state.people.filter((p) => {
    if (!state.searchQuery) return true;
    return p.name.toLowerCase().includes(state.searchQuery.toLowerCase());
  });

  const selectedPerson = state.people.find((p) => p.id === state.selectedPersonId) ?? null;

  return { ...state, filteredPeople, selectedPerson, selectPerson, setSearch };
}
