-- Keep the internal conveyor candidate view under caller permissions and source-table RLS.
-- Internal access is server-side only; do not expose the service_role key to clients.
ALTER VIEW public.thylora_conveyor_candidates
  SET (security_invoker = true);

REVOKE ALL ON TABLE public.thylora_conveyor_candidates
  FROM anon, authenticated;

GRANT SELECT ON TABLE public.thylora_conveyor_candidates
  TO service_role;
