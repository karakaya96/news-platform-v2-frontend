import React from 'react';

interface IconProps {
  className?: string;
}

const TechnologyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='2' y='3' width='20' height='14' rx='2' />
    <line x1='8' y1='21' x2='16' y2='21' />
    <line x1='12' y1='17' x2='12' y2='21' />
    <path d='M6 8h.01' />
    <path d='M6 11c1.5 1 3 1 4.5 0' />
    <path d='M6 8c-1.5-1-1.5-3 0-4' />
  </svg>
);

const WorldNewsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <path d='M2 12h20' />
    <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
    <path d='M12 2v20' />
  </svg>
);

const EconomyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='4' y1='20' x2='20' y2='20' />
    <rect x='6' y='12' width='4' height='8' rx='0.5' />
    <rect x='11' y='8' width='4' height='12' rx='0.5' />
    <rect x='16' y='4' width='4' height='16' rx='0.5' />
  </svg>
);

const SportsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 2L2 7l10 5 10-5-10-5z' />
    <path d='M2 17l10 5 10-5' />
    <path d='M2 12l10 5 10-5' />
  </svg>
);

const ScienceIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='3' />
    <ellipse cx='12' cy='12' rx='10' ry='4' />
    <ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(60 12 12)' />
    <ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(120 12 12)' />
  </svg>
);

const HealthIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none'>
    <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' fill='currentColor' />
  </svg>
);

const EntertainmentIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polygon points='5 3 19 12 5 21 5 3' fill='currentColor' />
  </svg>
);

const PoliticsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 21h18' />
    <path d='M5 21V7l8-4v18' />
    <path d='M19 21V7l-8-4' />
    <path d='M9 9h6' />
    <path d='M9 13h6' />
    <path d='M9 17h6' />
  </svg>
);

export const CATEGORY_ICONS: Record<string, React.FC<IconProps>> = {
  technology: TechnologyIcon,
  'world-news': WorldNewsIcon,
  economy: EconomyIcon,
  sports: SportsIcon,
  science: ScienceIcon,
  health: HealthIcon,
  entertainment: EntertainmentIcon,
  politics: PoliticsIcon,
};

export function getCategoryIcon(slug: string): React.FC<IconProps> {
  return CATEGORY_ICONS[slug] || TechnologyIcon;
}
