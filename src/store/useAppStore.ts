import { create } from 'zustand';
import { supabase, invokeAiFunction } from '@/lib/supabase';

export type TaskStatus = 'SCHEDULED' | 'ASSIGNED' | 'SAFETY_CONFIRMED' | 'ZONE_CHECKED_IN' | 'POST_TASK_CHECK' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string;
  zone: string;
  assigneeId: string | null;
  status: TaskStatus;
  issueType: 'NONE' | 'DELAYED' | 'RISK';
  issueMemo: string | null;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Alert {
  id: string;
  taskId: string;
  crewName: string;
  type: 'DELAYED' | 'RISK';
  message: string;
  timestamp: string;
}

export type PresetType = 'default' | 'heavy_weather' | 'port_arrival';

interface AppState {
  tasks: Task[];
  crew: CrewMember[];
  alerts: Alert[];
  currentUser: CrewMember | null;
  isCaptain: boolean;
  currentPreset: PresetType;
  
  fetchInitialData: () => Promise<void>;
  loginAsCaptain: () => void;
  loginAsCrew: (crewId: string) => void;
  logout: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  reportTaskIssue: (taskId: string, type: 'DELAYED' | 'RISK', memo?: string) => Promise<void>;
  clearAlert: (alertId: string) => void;
  generateReports: () => Promise<void>;
  setPreset: (preset: PresetType) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [],
  crew: [],
  alerts: [],
  currentUser: null,
  isCaptain: false,
  currentPreset: 'default',

  fetchInitialData: async () => {
    try {
      const { data: crewData } = await supabase.from('crew').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
      const { data: alertsData } = await supabase.from('alerts').select('*');

      if (crewData) {
        set({ crew: crewData.map((c: any) => ({ id: c.crew_id, name: c.name, role: c.role })) });
      }

      if (tasksData) {
        // Mocking zones since task table doesn't have it directly
        const zones = ['갑판 좌현', '양망기 주변', '기관실 입구', '어창', '조타실'];
        set({
          tasks: tasksData.map((t: any, i: number) => ({
            id: t.task_id,
            title: t.title,
            description: t.description || '',
            zone: zones[i % zones.length],
            assigneeId: t.assigned_crew_id,
            status: t.status as TaskStatus,
            issueType: 'NONE',
            issueMemo: null
          }))
        });
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
    }
  },

  loginAsCaptain: () => set({ isCaptain: true, currentUser: null }),
  loginAsCrew: (crewId) => set((state) => ({ 
    isCaptain: false, 
    currentUser: state.crew.find(c => c.id === crewId) || null 
  })),
  logout: () => set({ isCaptain: false, currentUser: null }),
  
  updateTaskStatus: async (taskId, status) => {
    // 1. Update local state immediately for UX
    set((state) => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));

    // 2. Update Supabase
    await supabase.from('tasks').update({ status }).eq('task_id', taskId);
    
    // 3. Log event
    const state = get();
    await supabase.from('task_events').insert({
      task_id: taskId,
      crew_id: state.currentUser?.id,
      event_type: 'STATUS_CHANGE',
      status_to: status,
      logical_clock: Date.now(),
      idempotency_key: `${taskId}_${status}_${Date.now()}`
    });

    // If status is ZONE_CHECKED_IN, we can invoke briefing agent
    if (status === 'ZONE_CHECKED_IN') {
      try {
        await invokeAiFunction('run-briefing-agent', { task_id: taskId });
      } catch (e) {
        console.error("Agent failed", e);
      }
    }
  },

  reportTaskIssue: async (taskId, type, memo) => {
    // 1. Local state update
    set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      const crewMember = state.crew.find(c => c.id === task?.assigneeId);
      
      const newAlert: Alert = {
        id: Math.random().toString(36).substr(2, 9),
        taskId,
        crewName: crewMember?.name || 'Unknown',
        type,
        message: memo || `작업 ${type === 'DELAYED' ? '지연이' : '위험이'} 보고되었습니다.`,
        timestamp: new Date().toISOString()
      };

      return {
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, issueType: type, issueMemo: memo || null } : t),
        alerts: [newAlert, ...state.alerts]
      };
    });

    // 2. Supabase / AI Integration
    if (type === 'RISK' && memo) {
      try {
        const state = get();
        await invokeAiFunction('classify-near-miss', {
          task_id: taskId,
          crew_id: state.currentUser?.id,
          raw_text: memo
        });
      } catch (e) {
        console.error("Failed to classify near miss", e);
      }
    }
  },

  clearAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  })),

  generateReports: async () => {
    try {
      // Assuming schedule_id is needed, just taking a random one for demo
      await invokeAiFunction('generate-report', { schedule_id: '33333333-1111-1111-1111-111111111111' });
    } catch (e) {
      console.error("Failed to generate report", e);
    }
  },

  setPreset: (preset) => set({ currentPreset: preset })
}));
