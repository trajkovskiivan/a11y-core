/**
 * Accessible EmptyState component.
 *
 * Renders a clear, structured message when a list, table, search result,
 * or section has no content to show. Answers: what is empty, why, and
 * what the user can do next.
 *
 * Static empty state (no live region — page content):
 * @example
 * <EmptyState
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<Button>Create project</Button>}
 * />
 *
 * Dynamic empty state (appears after search / filter interaction):
 * @example
 * <EmptyState
 *   live
 *   title="No results"
 *   description='No items match "wireless mouse". Try changing filters.'
 *   action={<Button>Clear filters</Button>}
 * />
 *
 * With decorative icon:
 * @example
 * <EmptyState
 *   title="No saved articles"
 *   description="Articles you save will appear here."
 *   icon={<BookmarkIcon aria-hidden="true" />}
 *   action={<Button>Browse articles</Button>}
 *   secondaryAction={<Button variant="ghost">Learn more</Button>}
 * />
 */

import React, { forwardRef } from 'react';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('EmptyState');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmptyStateProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The heading that names this empty state.
   * Should answer "what is empty?" — e.g. "No projects yet".
   */
  title: string;

  /**
   * Supporting text that explains why the area is empty and
   * optionally hints at what the user can do.
   */
  description?: string;

  /**
   * Decorative illustration or icon. Always hidden from assistive technology.
   * Do not encode meaning exclusively in the icon — use `title`/`description`.
   */
  icon?: React.ReactNode;

  /**
   * Primary action (usually a Button or Link). e.g. "Create project".
   */
  action?: React.ReactNode;

  /**
   * Secondary / supplemental action. e.g. "Learn more" or "Clear filters".
   */
  secondaryAction?: React.ReactNode;

  /**
   * Heading level for the title element.
   * Pick a level that fits the surrounding document outline.
   * @default 2
   */
  headingLevel?: EmptyStateHeadingLevel;

  /**
   * Set to `true` when the empty state appears dynamically in response to
   * a user action (search, filter, delete). This adds `role="status"` and
   * `aria-live="polite"` so screen readers announce the change.
   *
   * Leave `false` (default) for brand-new account / no-data-yet screens
   * that are part of the page on initial load.
   * @default false
   */
  live?: boolean;

  /** Strip default inline styles so you can apply your own via CSS. */
  unstyled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  function EmptyState(
    {
      title,
      description,
      icon,
      action,
      secondaryAction,
      headingLevel = 2,
      live = false,
      unstyled = false,
      className = '',
      ...props
    },
    ref
  ) {
    if (process.env.NODE_ENV !== 'production') {
      warn.checks.requiredProp(title, 'title');
    }

    const Tag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const liveProps = live
      ? ({ role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } as const)
      : {};

    const containerStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 'var(--compa11y-empty-state-gap, 0.75rem)',
          padding: 'var(--compa11y-empty-state-padding, 3rem 1.5rem)',
        };

    const iconStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--compa11y-empty-state-icon-color, #9ca3af)',
          fontSize: 'var(--compa11y-empty-state-icon-size, 3rem)',
        };

    const titleStyle: React.CSSProperties = unstyled
      ? {}
      : {
          margin: 0,
          fontSize: 'var(--compa11y-empty-state-title-size, 1.125rem)',
          fontWeight: 'var(--compa11y-empty-state-title-weight, 600)' as React.CSSProperties['fontWeight'],
          color: 'var(--compa11y-empty-state-title-color, inherit)',
          lineHeight: 1.3,
        };

    const descriptionStyle: React.CSSProperties = unstyled
      ? {}
      : {
          margin: 0,
          fontSize: 'var(--compa11y-empty-state-description-size, 0.9375rem)',
          color: 'var(--compa11y-empty-state-description-color, #6b7280)',
          maxWidth: 'var(--compa11y-empty-state-description-max-width, 36ch)',
          lineHeight: 1.5,
        };

    const actionsStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          flexWrap: 'wrap' as React.CSSProperties['flexWrap'],
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--compa11y-empty-state-actions-gap, 0.5rem)',
          marginTop: 'var(--compa11y-empty-state-actions-margin, 0.25rem)',
        };

    const hasActions = Boolean(action || secondaryAction);

    return (
      <section
        ref={ref}
        data-compa11y-empty-state=""
        data-live={live || undefined}
        className={['compa11y-empty-state', className].filter(Boolean).join(' ')}
        style={containerStyle}
        {...liveProps}
        {...props}
      >
        {icon && (
          <div
            data-compa11y-empty-state-icon=""
            aria-hidden="true"
            style={iconStyle}
          >
            {icon}
          </div>
        )}

        <Tag
          data-compa11y-empty-state-title=""
          style={titleStyle}
        >
          {title}
        </Tag>

        {description && (
          <p
            data-compa11y-empty-state-description=""
            style={descriptionStyle}
          >
            {description}
          </p>
        )}

        {hasActions && (
          <div
            data-compa11y-empty-state-actions=""
            style={actionsStyle}
          >
            {action}
            {secondaryAction}
          </div>
        )}
      </section>
    );
  }
);
