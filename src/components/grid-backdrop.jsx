import { cn } from '@/utils/cn'

/*
 * Faint grid + accent bloom backdrop. Purely decorative — pointer-events none,
 * aria-hidden. Layer behind sections with `absolute inset-0` or as a fixed
 * global backdrop.
 */

const GridBackdrop = ({ className, tone = 'default' }) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {tone === 'default' && (
        <div
          className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-40 blur-[140px]"
          style={{ background: 'var(--color-accent)' }}
        />
      )}
      {tone === 'muted' && (
        <div
          className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full opacity-25 blur-[160px]"
          style={{ background: 'var(--color-accent)' }}
        />
      )}
    </div>
  )
}

export default GridBackdrop
