
import { AppointmentType, Persona, LocationType } from './types';

export const BUSINESS_HOURS_DEFAULT = {
  'monday': { start: '09:00', end: '17:00' },
  'tuesday': { start: '09:00', end: '17:00' },
  'wednesday': { start: '09:00', end: '17:00' },
  'thursday': { start: '09:00', end: '17:00' },
  'friday': { start: '09:00', end: '17:00' },
  'saturday': null,
  'sunday': null,
};

export const APPOINTMENT_TYPES: AppointmentType[] = [
  {
    id: 'buyer-closing',
    title: 'Buyer Closing',
    description: 'Finalize your home purchase with our expert team.',
    durationMinutes: 60,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    personaEligibility: ['Buyer'],
    locationType: LocationType.IN_OFFICE,
    businessHours: BUSINESS_HOURS_DEFAULT,
    leadTimeMinutes: 1440, // 24 hours
    sameDayCutoffHour: 12,
  },
  {
    id: 'seller-closing',
    title: 'Seller Closing',
    description: 'Official signing and transfer for the sale of your property.',
    durationMinutes: 45,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    personaEligibility: ['Seller'],
    locationType: LocationType.IN_OFFICE,
    businessHours: BUSINESS_HOURS_DEFAULT,
    leadTimeMinutes: 1440,
    sameDayCutoffHour: 12,
  },
  {
    id: 'agent-intro',
    title: 'Agent Strategy Session',
    description: 'Learn how WCT can streamline your business.',
    durationMinutes: 30,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    personaEligibility: ['Real Estate Agent'],
    locationType: LocationType.REMOTE,
    businessHours: BUSINESS_HOURS_DEFAULT,
    leadTimeMinutes: 60,
    sameDayCutoffHour: 14,
  },
  {
    id: 'lender-order',
    title: 'Lender Order Review',
    description: 'Review title requirements and documentation.',
    durationMinutes: 30,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    personaEligibility: ['Lender'],
    locationType: LocationType.REMOTE,
    businessHours: BUSINESS_HOURS_DEFAULT,
    leadTimeMinutes: 60,
    sameDayCutoffHour: 15,
  }
];
