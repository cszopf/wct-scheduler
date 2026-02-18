
import { TimeSlot, Booking, Persona, AppointmentType } from '../types';
import { APPOINTMENT_TYPES } from '../constants';

// Simulated latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchAvailability = async (typeId: string, date: string): Promise<TimeSlot[]> => {
  await delay(800);
  const type = APPOINTMENT_TYPES.find(t => t.id === typeId);
  if (!type) return [];

  // Logic: 9am to 5pm, 15m increments, filter random busy blocks
  const slots: TimeSlot[] = [];
  const [year, month, day] = date.split('-').map(Number);
  
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      // Basic business logic simulation
      if (h === 12 && m < 45) continue; // "Lunch break"
      
      const start = new Date(year, month - 1, day, h, m);
      const end = new Date(start.getTime() + type.durationMinutes * 60000);
      
      const label = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        label
      });
    }
  }
  return slots;
};

export const createBooking = async (data: any): Promise<string> => {
  await delay(1500);
  console.log('Booking submitted to server:', data);
  return Math.random().toString(36).substring(7).toUpperCase();
};
