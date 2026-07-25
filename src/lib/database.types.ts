/**
 * Supabase generated-type entry point.
 *
 * The repository script `npm run db:types` replaces this interface with the
 * exact schema after a local or linked Supabase project is available. Runtime
 * clients intentionally do not depend on this bootstrap shape, so builds also
 * work before the first project is provisioned.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, {
      Row: Record<string, Json | undefined>;
      Insert: Record<string, Json | undefined>;
      Update: Record<string, Json | undefined>;
      Relationships: [];
    }>;
    Views: Record<string, never>;
    Functions: Record<string, {
      Args: Record<string, Json | undefined>;
      Returns: Json;
    }>;
    Enums: {
      staff_role: 'owner' | 'manager' | 'dispatcher' | 'crew';
      request_status: 'new' | 'reviewing' | 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      quote_status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
    };
    CompositeTypes: Record<string, never>;
  };
}
