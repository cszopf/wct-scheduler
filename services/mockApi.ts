
import { TimeSlot, Booking, Persona, AppointmentType } from '../types';
import { APPOINTMENT_TYPES } from '../constants';

// Simulated latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Generates available time slots for a specific appointment type and date.
 * Strictly adheres to business hours (8:30 AM - 6:30 PM ET) and includes 
 * buffer/duration logic.
 */
export const fetchAvailability = async (typeId: string, dateStr: string): Promise<TimeSlot[]> => {
  await delay(600);
  const type = APPOINTMENT_TYPES.find(t => t.id === typeId);
  if (!type) return [];

  const date = new Date(dateStr + 'T00:00:00');
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = dayKeys[date.getDay()];
  
  const hours = (type.businessHours as any)[dayKey];
  if (!hours) return []; // Closed on this day

  const [startH, startM] = hours.start.split(':').map(Number);
  const [endH, endM] = hours.end.split(':').map(Number);

  const slots: TimeSlot[] = [];
  const current = new Date(date);
  current.setHours(startH, startM, 0, 0);

  const businessEnd = new Date(date);
  businessEnd.setHours(endH, endM, 0, 0);

  // Slot granularity is 15 minutes
  while (current.getTime() < businessEnd.getTime()) {
    const slotStart = new Date(current);
    
    // Duration + After Buffer must fit before business hours end
    const totalNeededMinutes = type.durationMinutes + type.bufferAfterMinutes;
    const slotEnd = new Date(slotStart.getTime() + totalNeededMinutes * 60000);

    if (slotEnd.getTime() <= businessEnd.getTime()) {
      // Simulation: randomly mark some slots as "busy" (30% chance)
      const isBusy = Math.random() < 0.3;
      
      if (!isBusy) {
        slots.push({
          start: slotStart.toISOString(),
          end: new Date(slotStart.getTime() + type.durationMinutes * 60000).toISOString(),
          label: slotStart.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'America/New_York'
          })
        });
      }
    }

    current.setMinutes(current.getMinutes() + 15);
  }

  return slots;
};

export const createBooking = async (data: any): Promise<string> => {
  await delay(1200);
  console.log('Booking submitted to server:', data);
  return Math.random().toString(36).substring(7).toUpperCase();
};

/**
 * Simple "unit test" simulation to verify logic requirements
 */
export const runAvailabilityTests = async () => {
  console.log("--- RUNNING AVAILABILITY LOGIC TESTS ---");
  
  // Test 1: Monday (Should have slots starting 8:30 AM)
  const mondaySlots = await fetchAvailability('buyer-closing', '2025-05-19');
  const startsAt830 = mondaySlots.some(s => s.label === "8:30 AM");
  console.assert(startsAt830, "Monday should start at 8:30 AM");

  // Test 2: Saturday (Should be empty)
  const saturdaySlots = await fetchAvailability('buyer-closing', '2025-05-17');
  console.assert(saturdaySlots.length === 0, "Saturday should have zero slots");

  // Test 3: Duration/Buffer constraints
  // Buyer Closing is 60m + 15m buffer = 75m total.
  // Business ends at 6:30 PM (18:30). 
  // Last slot must start at or before 17:15 (5:15 PM).
  const latestStart = mondaySlots.reduce((prev, curr) => 
    new Date(curr.start).getTime() > new Date(prev.start).getTime() ? curr : prev
  );
  const latestDate = new Date(latestStart.start);
  const latestHour = latestDate.getHours();
  const latestMin = latestDate.getMinutes();
  console.assert(latestHour < 17 || (latestHour === 17 && latestMin <= 15), `Latest slot (${latestStart.label}) exceeds allowable business end time with duration/buffer`);

  console.log("--- TESTS COMPLETE ---");
};

// Auto-run tests in dev
if (typeof window !== 'undefined') {
  runAvailabilityTests();
}
