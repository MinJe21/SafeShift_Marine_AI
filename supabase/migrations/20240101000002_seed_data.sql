-- Seed Data for SafeShift Marine AI

DO $$
DECLARE
    v_vessel_id uuid := '11111111-1111-1111-1111-111111111111';
    v_crew_capt_id uuid := '22222222-1111-1111-1111-111111111111';
    v_crew_deck_id uuid := '22222222-2222-1111-1111-111111111111';
    v_crew_eng_id uuid := '22222222-3333-1111-1111-111111111111';
    v_schedule_id uuid := '33333333-1111-1111-1111-111111111111';
    v_task1_id uuid := '44444444-1111-1111-1111-111111111111';
    v_task2_id uuid := '44444444-2222-1111-1111-111111111111';
    v_task3_id uuid := '44444444-3333-1111-1111-111111111111';
    v_task4_id uuid := '44444444-4444-1111-1111-111111111111';
    v_task5_id uuid := '44444444-5555-1111-1111-111111111111';
BEGIN
    INSERT INTO vessels (vessel_id, name, type, home_port)
    VALUES (v_vessel_id, 'ThreeBack-1', 'coastal_fishing_boat', '여수항')
    ON CONFLICT (vessel_id) DO NOTHING;

    INSERT INTO crew (crew_id, vessel_id, name, role)
    VALUES 
        (v_crew_capt_id, v_vessel_id, '김선장', 'captain'),
        (v_crew_deck_id, v_vessel_id, '민제', 'deck_worker'),
        (v_crew_eng_id, v_vessel_id, '병주', 'engineer')
    ON CONFLICT (crew_id) DO NOTHING;

    INSERT INTO schedules (schedule_id, vessel_id, work_date, preset_type, status)
    VALUES (v_schedule_id, v_vessel_id, CURRENT_DATE, '양망 작업', 'SCHEDULED')
    ON CONFLICT (schedule_id) DO NOTHING;

    INSERT INTO tasks (task_id, schedule_id, title, description, assigned_crew_id, status)
    VALUES
        (v_task1_id, v_schedule_id, '갑판 좌현 미끄럼 점검', '갑판 청소 및 미끄럼 확인', v_crew_deck_id, 'SCHEDULED'),
        (v_task2_id, v_schedule_id, '양망기 주변 안전 확인', '양망기 롤러 및 로프 확인', v_crew_deck_id, 'SCHEDULED'),
        (v_task3_id, v_schedule_id, '기관실 오일 누유 점검', '엔진 주변 및 바닥 누유 확인', v_crew_eng_id, 'SCHEDULED'),
        (v_task4_id, v_schedule_id, '어창 입구 정리', '어창 덮개 및 주변 정리', v_crew_deck_id, 'SCHEDULED'),
        (v_task5_id, v_schedule_id, '작업 완료 보고', '전체 작업 완료 보고서 작성', v_crew_capt_id, 'SCHEDULED')
    ON CONFLICT (task_id) DO NOTHING;

    INSERT INTO zone_anchors (vessel_id, name, anchor_type)
    VALUES 
        (v_vessel_id, '갑판 좌현', 'VIRTUAL'),
        (v_vessel_id, '갑판 우현', 'VIRTUAL'),
        (v_vessel_id, '기관실 입구', 'VIRTUAL'),
        (v_vessel_id, '어창', 'VIRTUAL'),
        (v_vessel_id, '조타실', 'VIRTUAL'),
        (v_vessel_id, '양망기 주변', 'VIRTUAL')
    ON CONFLICT DO NOTHING;

    INSERT INTO near_miss_logs (task_id, crew_id, vessel_id, raw_text, category, severity, confidence, human_review_required)
    VALUES 
        (v_task1_id, v_crew_deck_id, v_vessel_id, '갑판 좌현 미끄럼 발생', 'SLIP_FALL', 'MEDIUM', 0.85, false),
        (v_task2_id, v_crew_deck_id, v_vessel_id, '로프 마모 발견', 'EQUIPMENT_FAILURE', 'HIGH', 0.90, false),
        (v_task3_id, v_crew_eng_id, v_vessel_id, '기관실 바닥 오일 흔적 발견', 'SLIP_FALL', 'MEDIUM', 0.75, false)
    ON CONFLICT DO NOTHING;
END $$;
