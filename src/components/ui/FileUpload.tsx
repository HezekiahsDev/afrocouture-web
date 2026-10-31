'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { FileText, LoaderCircle, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { uploadFile } from '@/lib/catalog';
import { apiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { UploadPurpose } from '@/types';

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface FileUploadProps {
  label: string;
  hint?: string;
  purpose: UploadPurpose;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Documents also accept PDF; images are photos only. */
  kind?: 'image' | 'document';
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);

/** Uploads straight to the API (Cloudinary) and reports back the hosted URL. */
export function FileUpload({
  label,
  hint,
  purpose,
  value,
  onChange,
  kind = 'image',
  required,
  disabled,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const accepted = kind === 'document' ? [...IMAGE_TYPES, 'application/pdf'] : IMAGE_TYPES;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    if (!accepted.includes(file.type)) {
      setError(kind === 'document' ? 'Choose a JPG, PNG, WebP or PDF file.' : 'Choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That file is larger than 10 MB. Choose a smaller one.');
      return;
    }
    setProgress(0);
    try {
      const asset = await uploadFile(file, purpose, setProgress);
      onChange(asset.url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const uploading = progress !== null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
        {label}
        {required && <span className="text-[#B8734E]"> *</span>}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accepted.join(',')}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {value && !uploading ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#171717]/12 bg-[#FFFFFF]/80 p-2.5">
          {isPdf(value) ? (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF] text-[#B8734E]">
              <FileText size={24} aria-hidden="true" />
            </span>
          ) : (
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FFFFFF]">
              <Image src={value} alt="" fill sizes="56px" className="object-cover" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#171717]">Uploaded</span>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs text-[#8F5637] hover:underline"
            >
              View file
            </a>
          </span>
          {!disabled && (
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg p-2 text-[#6B655C] hover:bg-[#171717]/5 hover:text-[#171717]"
                aria-label={`Replace ${label}`}
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg p-2 text-[#6B655C] hover:bg-[#171717]/5 hover:text-[#9B2C24]"
                aria-label={`Remove ${label}`}
              >
                <Trash2 size={16} />
              </button>
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!disabled && !uploading) void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#171717]/15 bg-[#FFFFFF]/60 px-4 py-6 text-center transition-colors',
            'hover:border-[#B8734E]/50 hover:bg-[#B8734E]/5 disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-[#9B2C24]/50',
          )}
        >
          {uploading ? (
            <>
              <LoaderCircle size={22} className="animate-spin text-[#B8734E]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#171717]">Uploading… {progress}%</span>
              <span className="h-1 w-40 overflow-hidden rounded-full bg-[#171717]/10">
                <span className="block h-full bg-[#B8734E] transition-all" style={{ width: `${progress}%` }} />
              </span>
            </>
          ) : (
            <>
              <UploadCloud size={22} className="text-[#B8734E]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#171717]">Click to upload or drag a file here</span>
              <span className="text-[11px] text-[#6B655C]">
                {kind === 'document' ? 'JPG, PNG, WebP or PDF' : 'JPG, PNG or WebP'} · up to 10 MB
              </span>
            </>
          )}
        </button>
      )}

      {error ? (
        <p className="text-xs text-[#9B2C24]" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-[11px] text-[#6B655C]">{hint}</p>
      )}
    </div>
  );
}

export default FileUpload;
