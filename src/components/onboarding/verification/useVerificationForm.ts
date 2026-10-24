'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { apiErrorMessage } from '@/lib/api';

export type FieldErrors<S> = Partial<Record<keyof S, string>>;

interface Options<P, S> {
  load: () => Promise<P | null>;
  save: (payload: Partial<P>) => Promise<P>;
  submit: () => Promise<P>;
  toState: (profile: P | null) => S;
  toPayload: (state: S) => Partial<P>;
  /** Format checks for what has been entered (required-ness is checked on submit). */
  validate: (state: S) => FieldErrors<S>;
}

/** The labels the API lists when a submission is incomplete. */
function missingFrom(err: unknown): string[] {
  if (!axios.isAxiosError(err)) return [];
  const missing = (err.response?.data as { error?: { missing?: unknown } } | undefined)?.error?.missing;
  return Array.isArray(missing) ? missing.filter((m): m is string => typeof m === 'string') : [];
}

function scrollToFirstError() {
  requestAnimationFrame(() => {
    document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/** Load → edit → save draft → submit lifecycle shared by the verification pages. */
export function useVerificationForm<P, S extends object>(options: Options<P, S>) {
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });

  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState<P | null>(null);
  const [state, setState] = useState<S>(() => options.toState(null));
  const [baseline, setBaseline] = useState('');
  const [errors, setErrors] = useState<FieldErrors<S>>({});
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [missing, setMissing] = useState<string[]>([]);

  const accept = useCallback((next: P | null) => {
    const nextState = opts.current.toState(next);
    setProfile(next);
    setState(nextState);
    setBaseline(JSON.stringify(nextState));
  }, []);

  const reload = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');
    try {
      accept(await opts.current.load());
      setLoadState('ready');
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'We could not load your details.'));
      setLoadState('error');
    }
  }, [accept]);

  useEffect(() => {
    // Fetching on mount is the point of this hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const dirty = loadState === 'ready' && JSON.stringify(state) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = useCallback(<K extends keyof S>(field: K, value: S[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setNotice('');
  }, []);

  const persist = useCallback(async (): Promise<P | null> => {
    const found = opts.current.validate(state);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setActionError('Fix the highlighted fields first.');
      scrollToFirstError();
      return null;
    }
    const saved = await opts.current.save(opts.current.toPayload(state));
    accept(saved);
    return saved;
  }, [state, accept]);

  const saveDraft = useCallback(async () => {
    setBusy('save');
    setActionError('');
    setNotice('');
    setMissing([]);
    try {
      if (await persist()) setNotice('Saved.');
    } catch (err) {
      setActionError(apiErrorMessage(err, 'We could not save your details.'));
    } finally {
      setBusy(null);
    }
  }, [persist]);

  const submitForReview = useCallback(async () => {
    setBusy('submit');
    setActionError('');
    setNotice('');
    setMissing([]);
    try {
      if (!(await persist())) return;
      accept(await opts.current.submit());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const list = missingFrom(err);
      setMissing(list);
      setActionError(list.length ? 'A few required details are still missing:' : apiErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }, [persist, accept]);

  return {
    loadState,
    loadError,
    reload,
    profile,
    state,
    set,
    errors,
    dirty,
    busy,
    notice,
    actionError,
    missing,
    saveDraft,
    submitForReview,
  };
}
