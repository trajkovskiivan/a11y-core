/**
 * Announcer Module
 *
 * Provides screen reader announcements via ARIA live regions
 */

export {
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  clearAnnouncements,
  queueAnnouncement,
  createAnnouncer,
  announceStatus,
  announceError,
  announceProgress,
} from './live-announcer';
