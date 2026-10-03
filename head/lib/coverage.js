// HEAD · point coverage. Every point the Chairman makes gets a number and an answer.
// A response is not complete while any point is uncovered.

/** Each point: { id, said, answered_in } — answered_in is where it was answered, or null. */
export function coverage(points) {
  const gaps = points.filter(p => !p.answered_in);
  return {
    total: points.length,
    covered: points.length - gaps.length,
    ratio: points.length ? (points.length - gaps.length) / points.length : 0,
    complete: points.length > 0 && gaps.length === 0,
    gaps: gaps.map(p => p.id)
  };
}

/** Rough splitter so long voice messages are cut into candidate points to number and confirm. */
export function splitPoints(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])\s+|\s+(?=(?:let's|I want|I think|what about|we have to|we need to|and then)\b)/i)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 4);
}
