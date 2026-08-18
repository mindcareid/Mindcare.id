// lib/events/serializers.ts

type EventDetail = {
  quota: number | null;
};

export function serializeEventDetail<T extends EventDetail>(
  event: T,
  soldCount: number,
  totalCompanyEvents: number,
  remaining: number | null,
  soldOut: boolean,
  
) {
  return {
    ...event,

    soldCount,
    remaining,
    soldOut,
    totalCompanyEvents,
  };
}