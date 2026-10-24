'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

/** Six single-digit boxes that behave like one field: typing advances, paste fills all. */
export function CodeInput({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  function setAt(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, 6));
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      setAt(index - 1, '');
    } else if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChange={(event) => {
            const d = event.target.value.replace(/\D/g, '').slice(-1);
            setAt(index, d);
            if (d && index < 5) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={onPaste}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid}
          className={`h-14 w-full min-w-0 rounded-xl border bg-[#0F172A]/80 text-center text-xl font-bold tabular-nums text-[#F8FAFC] outline-none transition focus:border-[#00A3FF] focus:shadow-[0_0_0_3px_rgba(0,163,255,0.15)] disabled:opacity-60 ${
            invalid ? 'border-[#ffb4ab]/60' : 'border-white/10'
          }`}
        />
      ))}
    </div>
  );
}
