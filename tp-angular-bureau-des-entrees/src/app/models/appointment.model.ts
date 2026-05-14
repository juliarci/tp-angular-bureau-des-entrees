export interface AppointmentParticipantActor {
  type?: 'Patient' | 'Practitioner' | 'Location';
  display?: string;
  reference?: string;
  identifier?: {
    system?: string;
    value?: string;
  };
}
 
export interface AppointmentParticipant {
  actor?: AppointmentParticipantActor;
  status?: 'accepted' | 'declined' | 'tentative' | 'needs-action';
}
 
export interface AppointmentType {
  coding?: {
    system?: string;
    code?: string;
    display?: string;
  }[];
}
 
export interface Appointment {
  id: string | number;
  status?: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow';
  description?: string;
  start?: string; // ISO 8601
  end?: string;   // ISO 8601
  appointmentType?: AppointmentType;
  participant?: AppointmentParticipant[];
}
 
// Helpers pour extraire les participants par type
export function getParticipantByType(
  participants: AppointmentParticipant[] | undefined,
  type: 'Patient' | 'Practitioner' | 'Location'
): AppointmentParticipantActor | undefined {
  return participants?.find(p => p.actor?.type === type)?.actor;
}

