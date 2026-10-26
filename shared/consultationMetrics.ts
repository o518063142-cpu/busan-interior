export function isTestConsultation(item: { isTest?: unknown; excludeFromMetrics?: unknown; name?: unknown }) {
  return item.isTest === true || item.excludeFromMetrics === true ||
    (typeof item.name === "string" && /^\[TEST\]/i.test(item.name.trim()));
}

export function productionMetricRecords<T extends { isTest?: unknown; excludeFromMetrics?: unknown; name?: unknown; sessionId?: unknown }, E extends { isTest?: unknown; sessionId?: unknown }>(consultations: T[], events: E[]) {
  const testSessions = new Set(consultations.filter(isTestConsultation)
    .map(item => item.sessionId).filter((id): id is string => typeof id === "string" && id.length > 0));
  return {
    consultations: consultations.filter(item => !isTestConsultation(item)),
    events: events.filter(event => event.isTest !== true && !testSessions.has(event.sessionId as string)),
  };
}
