export type PropertyLifecycleAction =
  | 'create_property'
  | 'logical_delete_property'
  | 'hard_delete_property';

export type MasterAiMinistry = 'property' | 'finance' | 'legal';

export interface PermissionAwareUser {
  id: string;
  role: string;
  permissions: string[];
}

export interface PropertyLifecycleEvent {
  eventId: string;
  action: PropertyLifecycleAction;
  propertyId: string;
  user: PermissionAwareUser;
  payload: Record<string, unknown>;
  timestamp?: string;
}

export interface MasterAiAction {
  ministry: MasterAiMinistry;
  task: string;
  reason?: string;
  type?: 'check' | 'execute';
}

export interface MasterAiPlan {
  narrative: string;
  actions: MasterAiAction[];
}

export interface ReasoningSnapshot {
  eventId: string;
  action: PropertyLifecycleAction;
  propertyId: string;
  allowedByPolicy: boolean;
  policyReason?: string;
  checkResults: Record<string, unknown>[];
  decision: 'approved' | 'rejected';
  details?: string;
  timestamp: string;
  plan?: MasterAiPlan;
}
