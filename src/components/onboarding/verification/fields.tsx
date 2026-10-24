'use client';

import { useId, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { cn } from '@/lib/utils';
import type { UploadPurpose } from '@/types';

const inputClass = cn(
  'w-full rounded-xl border border-white/10 bg-[#0F172A]/80 px-3.5 py-2.5 text-sm text-[#F8FAFC]',
  'placeholder:text-[#64748B] outline-none transition-[border-color,box-shadow]',
  'focus:border-[#00A3FF] focus:shadow-[0_0_0_3px_rgba(0,163,255,0.15)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, required, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)} data-field-error={error ? 'true' : undefined}>
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
        {required && <span className="text-[#00A3FF]"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-[#ffb4ab]" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[11px] leading-relaxed text-[#64748B]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'numeric' | 'tel';
  maxLength?: number;
  prefix?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

export function TextInput({ label, value, onChange, required, error, hint, prefix, className, ...rest }: TextInputProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, prefix && 'pl-8', error && 'border-[#ffb4ab]/60')}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function TextArea({ label, value, onChange, required, error, hint, maxLength, rows = 4, className, ...rest }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint ?? (maxLength ? `${value.length}/${maxLength} characters` : undefined)}
      className={className}
    >
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, 'resize-y', error && 'border-[#ffb4ab]/60')}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectInput({ label, value, onChange, options, placeholder = 'Select…', required, error, hint, disabled, className }: SelectInputProps) {
  const id = useId();
  // Keep a previously saved value selectable even if it is not in today's list.
  const list = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, 'appearance-none bg-no-repeat pr-9', error && 'border-[#ffb4ab]/60', !value && 'text-[#64748B]')}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394A3B8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.75rem center',
        }}
      >
        <option value="">{placeholder}</option>
        {list.map((option) => (
          <option key={option} value={option} className="bg-[#0F172A] text-[#F8FAFC]">
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: readonly string[];
  max: number;
  maxLength?: number;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  addLabel?: string;
}

/** Toggleable suggestion chips plus free-text entries, capped at `max`. */
export function TagInput({
  label,
  values,
  onChange,
  suggestions = [],
  max,
  maxLength = 40,
  required,
  error,
  hint,
  disabled,
  addLabel = 'Add your own',
}: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const full = values.length >= max;
  const custom = values.filter((value) => !suggestions.includes(value));

  function toggle(tag: string) {
    if (values.includes(tag)) onChange(values.filter((value) => value !== tag));
    else if (!full) onChange([...values, tag]);
  }

  function addDraft() {
    const tag = draft.trim().replace(/\s+/g, ' ');
    if (!tag || full) return;
    if (!values.some((value) => value.toLowerCase() === tag.toLowerCase())) onChange([...values, tag]);
    setDraft('');
  }

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint ?? `${values.length}/${max} selected`}
    >
      <div className="flex flex-wrap gap-2">
        {[...suggestions, ...custom].map((tag) => {
          const active = values.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              disabled={disabled || (!active && full)}
              aria-pressed={active}
              onClick={() => toggle(tag)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-[#00A3FF] bg-[#00A3FF]/15 text-[#38BDF8]'
                  : 'border-white/10 bg-[#0F172A]/60 text-[#94A3B8] hover:border-[#00A3FF]/40 hover:text-[#F8FAFC]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {active ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}
              {tag}
              {active && !suggestions.includes(tag) && <X size={12} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {!disabled && !full && (
        <div className="flex gap-2">
          <input
            id={id}
            value={draft}
            maxLength={maxLength}
            placeholder={addLabel}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addDraft();
              }
            }}
            className={cn(inputClass, 'py-2')}
          />
          <button
            type="button"
            onClick={addDraft}
            disabled={!draft.trim()}
            className="shrink-0 rounded-xl border border-white/10 bg-[#1E293B] px-3.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#00A3FF]/40 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </FieldShell>
  );
}

interface ChoiceCardsProps<T extends string> {
  label: string;
  value: T | '';
  onChange: (value: T) => void;
  options: { value: T; title: string; description: string }[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function ChoiceCards<T extends string>({ label, value, onChange, options, required, error, disabled }: ChoiceCardsProps<T>) {
  const name = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" data-field-error={error ? 'true' : undefined}>
      <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
        {required && <span className="text-[#00A3FF]"> *</span>}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
                active ? 'border-[#00A3FF] bg-[#00A3FF]/10' : 'border-white/10 bg-[#0F172A]/60 hover:border-[#00A3FF]/40',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 accent-[#00A3FF]"
              />
              <span>
                <span className="block text-sm font-semibold text-[#F8FAFC]">{option.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-[#94A3B8]">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-[#ffb4ab]" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface GalleryUploadProps {
  label: string;
  hint?: string;
  purpose: UploadPurpose;
  urls: string[];
  onChange: (urls: string[]) => void;
  max: number;
  disabled?: boolean;
}

/** A grid of uploaded photos with an "add another" slot until `max` is reached. */
export function GalleryUpload({ label, hint, purpose, urls, onChange, max, disabled }: GalleryUploadProps) {
  return (
    <div className="flex flex-col gap-3">
      {urls.length > 0 && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</span>
      )}
      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url, index) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#1E293B]">
              <Image src={url} alt={`${label} ${index + 1}`} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(urls.filter((u) => u !== url))}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1.5 top-1.5 rounded-lg bg-[#090D16]/80 p-1.5 text-[#F8FAFC] backdrop-blur hover:text-[#ffb4ab]"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && urls.length < max && (
        <FileUpload
          label={urls.length ? `Add another (${urls.length}/${max})` : label}
          hint={hint}
          purpose={purpose}
          value={null}
          onChange={(url) => url && onChange([...urls, url])}
        />
      )}
    </div>
  );
}

interface SectionCardProps {
  number: string;
  title: string;
  description?: string;
  optional?: boolean;
  children: ReactNode;
}

export function SectionCard({ number, title, description, optional, children }: SectionCardProps) {
  return (
    <section className="relative rounded-2xl border border-white/[0.08] bg-[#0F172A]/80 p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-white/[0.06] pb-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E293B] text-xs font-bold text-[#00A3FF]">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-base font-bold text-[#F8FAFC]">
            {title}
            {optional && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Optional
              </span>
            )}
          </h2>
          {description && <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{description}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
