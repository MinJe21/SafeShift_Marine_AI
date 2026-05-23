-- 1. vessels
CREATE TABLE vessels (
    vessel_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text,
    home_port text,
    created_at timestamptz DEFAULT now()
);

-- 2. crew
CREATE TABLE crew (
    crew_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id uuid REFERENCES vessels(vessel_id),
    name text NOT NULL,
    role text NOT NULL,
    language text DEFAULT 'ko',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 3. schedules
CREATE TABLE schedules (
    schedule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id uuid REFERENCES vessels(vessel_id),
    work_date date NOT NULL,
    preset_type text NOT NULL,
    status text DEFAULT 'SCHEDULED',
    created_at timestamptz DEFAULT now()
);

-- 4. tasks
CREATE TABLE tasks (
    task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid REFERENCES schedules(schedule_id),
    title text NOT NULL,
    description text,
    assigned_crew_id uuid REFERENCES crew(crew_id),
    zone_required boolean DEFAULT true,
    status text DEFAULT 'SCHEDULED',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. zone_anchors
CREATE TABLE zone_anchors (
    zone_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id uuid REFERENCES vessels(vessel_id),
    name text NOT NULL,
    anchor_type text DEFAULT 'VIRTUAL',
    nfc_tag_id text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 6. task_events
CREATE TABLE task_events (
    event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(task_id),
    crew_id uuid REFERENCES crew(crew_id),
    vessel_id uuid REFERENCES vessels(vessel_id),
    event_type text NOT NULL,
    zone_id uuid REFERENCES zone_anchors(zone_id),
    status_from text,
    status_to text,
    device_timestamp timestamptz,
    server_timestamp timestamptz DEFAULT now(),
    logical_clock bigint NOT NULL,
    idempotency_key text UNIQUE NOT NULL,
    sync_status text DEFAULT 'SYNCED',
    created_at timestamptz DEFAULT now()
);

-- 7. near_miss_logs
CREATE TABLE near_miss_logs (
    near_miss_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(task_id),
    crew_id uuid REFERENCES crew(crew_id),
    vessel_id uuid REFERENCES vessels(vessel_id),
    raw_text text NOT NULL,
    category text,
    severity text,
    confidence numeric,
    human_review_required boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 8. safety_briefings
CREATE TABLE safety_briefings (
    briefing_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(task_id),
    content text NOT NULL,
    source_schedule jsonb,
    source_near_miss jsonb,
    source_weather jsonb,
    generated_by text DEFAULT 'gemini_agent',
    created_at timestamptz DEFAULT now()
);

-- 9. agent_runs
CREATE TABLE agent_runs (
    run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(task_id),
    objective text,
    status text DEFAULT 'RUNNING',
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- 10. tool_call_logs
CREATE TABLE tool_call_logs (
    log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id uuid REFERENCES agent_runs(run_id),
    task_id uuid REFERENCES tasks(task_id),
    tool_name text NOT NULL,
    input_json jsonb,
    output_json jsonb,
    reason text,
    latency_ms integer,
    success boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 11. alerts
CREATE TABLE alerts (
    alert_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(task_id),
    draft_message text,
    ai_severity text,
    rule_engine_result text,
    status text DEFAULT 'DRAFT_ONLY',
    created_at timestamptz DEFAULT now()
);

-- 12. generated_reports
CREATE TABLE generated_reports (
    report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid REFERENCES schedules(schedule_id),
    file_path text,
    signed_url text,
    status text DEFAULT 'PROCESSING',
    created_at timestamptz DEFAULT now()
);

-- 13. audit_logs
CREATE TABLE audit_logs (
    audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id text,
    action text NOT NULL,
    target_type text,
    target_id text,
    before_json jsonb,
    after_json jsonb,
    created_at timestamptz DEFAULT now()
);
