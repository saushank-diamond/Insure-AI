/**
 * Generated by orval v6.26.0 🍺
 * Do not edit manually.
 * insureai
 * OpenAPI spec version: 0.1.0
 */
import type { ProfileSnapshotDeletedAt } from './profileSnapshotDeletedAt';

export interface ProfileSnapshot {
  branch_id: string;
  created_at?: string;
  data?: string;
  deleted_at?: ProfileSnapshotDeletedAt;
  id: string;
  lead_id: string;
  object?: string;
  organization_id: string;
  updated_at?: string;
  version?: number;
}