'use client';

import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatDateValue(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const locale = useLocale();
  const isTr = locale === 'tr';
  const months = isTr ? MONTHS_TR : MONTHS_EN;
  const days = isTr ? DAYS_TR : DAYS_EN;

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return { year: y, month: m - 1, day: d };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });

  const selectedDate = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }, [value]);

  const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
  const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month);

  const handleSelect = useCallback((day: number) => {
    const formatted = formatDateValue(viewDate.year, viewDate.month, day);
    onChange?.(formatted);
    setOpen(false);
  }, [viewDate.year, viewDate.month, onChange]);

  const handlePrev = useCallback(() => {
    setViewDate(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11, day: 1 };
      return { ...prev, month: prev.month - 1, day: 1 };
    });
  }, []);

  const handleNext = useCallback(() => {
    setViewDate(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0, day: 1 };
      return { ...prev, month: prev.month + 1, day: 1 };
    });
  }, []);

  const displayText = selectedDate
    ? `${selectedDate.day} ${months[selectedDate.month]} ${selectedDate.year}`
    : placeholder || (isTr ? 'Tarih seçin...' : 'Select date...');

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm',
          'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
          'hover:border-slate-300 dark:hover:border-slate-600',
          !selectedDate && 'text-slate-400 dark:text-slate-500'
        )}
      >
        <span>{displayText}</span>
        <ChevronRight className={cn('h-4 w-4 transition-transform', open && 'rotate-90')} />
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-[280px] rounded-xl border bg-white p-3 shadow-lg',
          'dark:border-slate-700 dark:bg-slate-800'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium dark:text-slate-100">
              {months[viewDate.month]} {viewDate.year}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {days.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate?.year === viewDate.year
                && selectedDate?.month === viewDate.month
                && selectedDate?.day === day;
              const isToday = new Date().getFullYear() === viewDate.year
                && new Date().getMonth() === viewDate.month
                && new Date().getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'h-8 w-full rounded-lg text-xs font-medium transition-colors',
                    'hover:bg-slate-100 dark:hover:bg-slate-700',
                    isSelected && 'bg-indigo-600 text-white hover:bg-indigo-700',
                    isToday && !isSelected && 'ring-1 ring-indigo-500 dark:ring-indigo-400',
                    !isSelected && 'dark:text-slate-300'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {selectedDate && (
            <button
              type="button"
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
              className="mt-2 w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {isTr ? 'Temizle' : 'Clear'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
