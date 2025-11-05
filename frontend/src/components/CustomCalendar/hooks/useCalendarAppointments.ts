/**
 * 🏴‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 * 🔗 PHASE 4: GRAPHQL INTEGRATION - Real-time Calendar Data
 */

import { useQuery } from '@apollo/client';
import { useMemo, useEffect } from 'react';
import { GET_APPOINTMENTS_FOR_WEEK } from '../../../graphql/queries/appointments';
import { useAppointmentUpdates } from '../../../graphql/subscriptions';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export interface CalendarAppointment {
  id: string;
  patientId: string;
  dentistId: string;
  scheduledDate: string;
  durationMinutes: number;
  appointmentType: string;
  priority?: string;
  title: string;
  description?: string;
  notes?: string;
  status: string;
  roomNumber?: string;
  estimatedCost?: number;
  insuranceCoverage?: number;
  preparationInstructions?: string;
  followUpRequired?: boolean;
  confirmationSent?: boolean;
  reminderSent?: boolean;

  // Computed fields
  patientName?: string;
  patientPhone?: string;
  dentistName?: string;
  endTime?: string;

  // Relations
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  dentist?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
  };
}

export function useCalendarAppointments(currentDate: Date, dentistId?: string) {
  // Calculate week start and end dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const { data, loading, error, refetch } = useQuery(GET_APPOINTMENTS_FOR_WEEK, {
    variables: {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      dentistId: dentistId || null
    },
    fetchPolicy: 'cache-and-network', // Get fresh data but use cache while loading
    pollInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  // 🔥 REAL-TIME SUBSCRIPTIONS: Auto-refresh when appointments change
  useAppointmentUpdates(undefined, dentistId); // Listen for appointment updates

  // 🔥 REFETCH WHEN DATE CHANGES
  useEffect(() => {
    refetch();
  }, [currentDate, dentistId, refetch]);

  const appointments = useMemo(() => {
    if (!data?.appointments?.appointments) return [];

    return data.appointments.appointments.map((apt: any) => ({
      ...apt,
      // Ensure scheduledDate is a Date object for calendar calculations
      scheduledDate: new Date(apt.scheduledDate),
    })) as CalendarAppointment[];
  }, [data]);

  return {
    appointments,
    loading,
    error,
    refetch,
    weekStart,
    weekEnd
  };
}

export default useCalendarAppointments;