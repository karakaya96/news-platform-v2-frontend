import React from 'react';

interface IconProps {
  className?: string;
}

const TechnologyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='2' y='3' width='20' height='14' rx='2' />
    <line x1='8' y1='21' x2='16' y2='21' />
    <line x1='12' y1='17' x2='12' y2='21' />
  </svg>
);

const WorldNewsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <path d='M2 12h20' />
    <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
  </svg>
);

const EconomyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='12' y1='1' x2='12' y2='23' />
    <polyline points='17 5 12 1 7 5' />
    <polyline points='19 12 12 23 5 12' />
  </svg>
);

const SportsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 2a10 10 0 0 1 10 10' />
    <path d='M12 2a10 10 0 0 0-4 1.5' />
    <path d='M2 12h20' />
    <path d='M12 22a10 10 0 0 1-5.5-3' />
    <path d='M17.5 21a10 10 0 0 1-5.5-21' />
  </svg>
);

const ScienceIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M10 2v7.31L5 15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-5.69V2' />
    <line x1='8' y1='2' x2='16' y2='2' />
    <line x1='12' y1='9' x2='12' y2='11' />
  </svg>
);

const HealthIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
    <circle cx='12' cy='12' r='9' opacity='0.2' />
    <path d='M12 8v4M12 16h.01' />
  </svg>
);

const EntertainmentIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18' />
    <line x1='7' y1='2' x2='7' y2='22' />
    <line x1='17' y1='2' x2='17' y2='22' />
    <line x1='2' y1='12' x2='22' y2='12' />
    <polygon points='7 2 7 12 14.5 7 7 2' />
  </svg>
);

const PoliticsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 21h18' />
    <path d='M5 21V7l8-4 8 4v14' />
    <path d='M17 21v-8H7v8' />
    <rect x='9' y='10' width='6' height='4' />
    <line x1='12' y1='14' x2='12' y2='16' />
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
