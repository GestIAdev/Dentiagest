// 🔥 APOLLO NUCLEAR ADVANCED CACHING STRATEGIES
// Date: September 22, 2025
// Mission: Advanced Apollo Client Caching for Instant Navigation
// Target: Perfect Memory - Instant patient navigation without refetching

import { InMemoryCache, TypePolicy, gql } from '@apollo/client/core';

// ============================================================================
// PATIENT CACHE POLICIES
// ============================================================================

const patientTypePolicy: TypePolicy = {
  keyFields: ['id'],
  fields: {
    fullName: {
      read(existing, { readField }) {
        const firstName = readField('firstName') as string;
        const lastName = readField('lastName') as string;
        return firstName && lastName ? `${firstName} ${lastName}`.trim() : existing;
      }
    },

    age: {
      read(existing, { readField }) {
        const dateOfBirth = readField('dateOfBirth') as string;
        if (!dateOfBirth) return null;

        const birth = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        return age;
      }
    },

    hasInsurance: {
      read(existing, { readField }) {
        const insuranceProvider = readField('insuranceProvider') as string;
        const insuranceStatus = readField('insuranceStatus') as string;
        return !!(insuranceProvider && insuranceStatus === 'active');
      }
    }
  }
};

// ============================================================================
// APPOINTMENT CACHE POLICIES
// ============================================================================

const appointmentTypePolicy: TypePolicy = {
  keyFields: ['id'],
  fields: {
    status: {
      merge(existing, incoming) {
        return incoming;
      }
    },

    endTime: {
      read(existing, { readField }) {
        const scheduledDate = readField('scheduledDate') as string;
        const durationMinutes = readField('durationMinutes') as number;

        if (!scheduledDate || !durationMinutes) return null;

        const start = new Date(scheduledDate);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        return end.toISOString();
      }
    }
  }
};

// ============================================================================
// QUERY POLICIES FOR INSTANT NAVIGATION
// ============================================================================

const queryTypePolicy: TypePolicy = {
  fields: {
    patients: {
      keyArgs: ['clinicId', 'search', 'status', 'limit', 'offset'],
      merge(existing, incoming, { args }) {
        if (!args) return incoming;

        const merged = existing ? { ...existing } : { patients: [], totalCount: 0 };

        if (args.offset === 0) {
          merged.patients = incoming.patients || [];
        } else {
          merged.patients = [...(merged.patients || []), ...(incoming.patients || [])];
        }

        merged.totalCount = incoming.totalCount || merged.totalCount;

        return merged;
      }
    },

    appointments: {
      keyArgs: ['clinicId', 'dentistId', 'startDate', 'endDate', 'status'],
      merge(existing, incoming) {
        return incoming;
      }
    }
  }
};

// ============================================================================
// MUTATION POLICIES FOR OPTIMISTIC UPDATES
// ============================================================================

const mutationTypePolicy: TypePolicy = {
  fields: {
    createPatient: {
      merge(existing, incoming, { cache }) {
        if (incoming) {
          try {
            const patientsQuery: any = cache.readQuery({
              query: gql`
                query GetPatients {
                  patients {
                    patients {
                      id
                      firstName
                      lastName
                      email
                      phone
                      isActive
                    }
                    totalCount
                  }
                }
              `
            });

            if (patientsQuery?.patients) {
              cache.writeQuery({
                query: gql`
                  query GetPatients {
                    patients {
                      patients {
                        id
                        firstName
                        lastName
                        email
                        phone
                        isActive
                      }
                      totalCount
                    }
                  }
                `,
                data: {
                  patients: {
                    ...patientsQuery.patients,
                    patients: [...patientsQuery.patients.patients, incoming],
                    totalCount: patientsQuery.patients.totalCount + 1
                  }
                }
              });
            }
          } catch (error) {
            // Ignore cache update errors
          }
        }

        return incoming;
      }
    },

    createAppointment: {
      merge(existing, incoming, { cache }) {
        if (incoming) {
          try {
            const appointmentsQuery: any = cache.readQuery({
              query: gql`
                query GetAppointments {
                  appointments {
                    appointments {
                      id
                      patientId
                      dentistId
                      scheduledDate
                      status
                      patientName
                      dentistName
                    }
                    totalCount
                  }
                }
              `
            });

            if (appointmentsQuery?.appointments) {
              cache.writeQuery({
                query: gql`
                  query GetAppointments {
                    appointments {
                      appointments {
                        id
                        patientId
                        dentistId
                        scheduledDate
                        status
                        patientName
                        dentistName
                      }
                      totalCount
                    }
                  }
                `,
                data: {
                  appointments: {
                    ...appointmentsQuery.appointments,
                    appointments: [...appointmentsQuery.appointments.appointments, incoming],
                    totalCount: appointmentsQuery.appointments.totalCount + 1
                  }
                }
              });
            }
          } catch (error) {
            // Ignore cache update errors
          }
        }

        return incoming;
      }
    }
  }
};

// ============================================================================
// ADVANCED CACHE CONFIGURATION
// ============================================================================

export const createAdvancedCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: queryTypePolicy,
      Mutation: mutationTypePolicy,
      Patient: patientTypePolicy,
      Appointment: appointmentTypePolicy,
    },

    resultCaching: true,

    dataIdFromObject: (object) => {
      switch (object.__typename) {
        case 'Patient':
          return `Patient:${object.id}`;
        case 'Appointment':
          return `Appointment:${object.id}`;
        case 'Clinic':
          return `Clinic:${object.id}`;
        case 'Dentist':
          return `Dentist:${object.id}`;
        default:
          return object.id ? `${object.__typename}:${object.id}` : undefined;
      }
    }
  });
};

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export const cacheUtils = {
  clearPatientCache: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'patients' });
    cache.evict({ fieldName: 'patient' });
    cache.gc();
  },

  clearAppointmentCache: (cache: InMemoryCache) => {
    cache.evict({ fieldName: 'appointments' });
    cache.evict({ fieldName: 'appointment' });
    cache.gc();
  },

  clearAllCache: (cache: InMemoryCache) => {
    cache.reset();
  }
};

// ============================================================================
// CACHE POLICIES FOR SPECIFIC SCENARIOS
// ============================================================================

export const cachePolicies = {
  instantPatientNavigation: {
    maxPatientsInMemory: 20,
    prefetchRelatedData: true,
    cacheSearchResults: true
  },

  appointmentCalendar: {
    cacheWindowDays: 30,
    groupByDate: true,
    cachePatterns: true
  },

  realTimeUpdates: {
    allowSubscriptionUpdates: true,
    mergeSubscriptionData: true,
    conflictResolution: 'remote-wins'
  }
};
