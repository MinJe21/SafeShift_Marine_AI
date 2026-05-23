-- Enable RLS on all tables
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE near_miss_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- For MVP local demo, we allow anon/authenticated broad read access,
-- and all insert/update since we don't have full auth setup yet.
-- To allow mock mode execution without auth:
CREATE POLICY "Allow anon read all" ON vessels FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON crew FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON schedules FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON zone_anchors FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON task_events FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON near_miss_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON safety_briefings FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON agent_runs FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON tool_call_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON generated_reports FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON audit_logs FOR SELECT USING (true);

-- Allow all inserts/updates/deletes for anon to support offline demo
-- Production would restrict this to authenticated and service_role
CREATE POLICY "Allow anon all" ON vessels FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON crew FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON schedules FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON zone_anchors FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON task_events FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON near_miss_logs FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON safety_briefings FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON agent_runs FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON tool_call_logs FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow anon all" ON generated_reports FOR ALL USING (true);
-- Audit logs should not be updated or deleted
CREATE POLICY "Allow anon insert" ON audit_logs FOR INSERT WITH CHECK (true);
