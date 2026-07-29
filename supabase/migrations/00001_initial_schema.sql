-- ============================================================
-- The Observation Files - Complete Database Schema
-- PostgreSQL / Supabase Migration
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE case_difficulty AS ENUM (
  'beginner', 'intermediate', 'advanced', 'expert'
);

CREATE TYPE case_status AS ENUM (
  'locked', 'available', 'in_progress', 'completed', 'failed'
);

CREATE TYPE investigation_phase AS ENUM (
  'briefing', 'scene_examination', 'evidence_collection',
  'witness_interviews', 'analysis', 'interrogation',
  'theory_construction', 'confrontation', 'resolution', 'complete'
);

CREATE TYPE evidence_type AS ENUM (
  'physical', 'digital', 'testimony', 'document', 'photograph',
  'audio', 'video', 'report', 'receipt', 'object',
  'fingerprint', 'footprint', 'dna', 'tool', 'weapon',
  'drug', 'fiber', 'digital_file', 'email', 'phone_record',
  'bank_statement', 'social_media', 'cctv', 'letter', 'note',
  'photo', 'map', 'diagram', 'autopsy_report', 'lab_report'
);

CREATE TYPE evidence_category AS ENUM (
  'physical', 'digital', 'testimony', 'document', 'forensic',
  'circumstantial', 'direct', 'corroborating', 'exculpatory',
  'inculpatory', 'weapon', 'motive', 'opportunity', 'alibi',
  'timeline'
);

CREATE TYPE npc_role AS ENUM (
  'witness', 'suspect', 'victim', 'informant', 'expert',
  'bystander', 'detective', 'police', 'forensic_expert',
  'medical_examiner', 'lawyer', 'journalist', 'family_member',
  'accomplice', 'mastermind', 'red_herring'
);

CREATE TYPE npc_emotional_state AS ENUM (
  'neutral', 'angry', 'sad', 'scared', 'nervous', 'confident',
  'evasive', 'cooperative', 'hostile', 'grieving', 'calm',
  'agitated', 'suspicious', 'lying'
);

CREATE TYPE relationship_status AS ENUM (
  'neutral', 'friendly', 'hostile', 'cooperative', 'deceptive'
);

CREATE TYPE truth_value AS ENUM ('true', 'false', 'partial', 'unknown');

CREATE TYPE observation_category AS ENUM (
  'visual', 'auditory', 'tactile', 'analytical', 'deductive',
  'contextual', 'behavioral'
);

CREATE TYPE observation_visibility AS ENUM (
  'visible', 'hidden', 'conditional', 'timed'
);

CREATE TYPE contradiction_type AS ENUM (
  'direct_contradiction', 'timeline_conflict', 'evidence_conflict',
  'logical_inconsistency', 'alibi_conflict', 'witness_discrepancy',
  'motive_conflict', 'identity_conflict'
);

CREATE TYPE contradiction_severity AS ENUM (
  'minor', 'moderate', 'major', 'critical'
);

CREATE TYPE theory_node_type AS ENUM (
  'suspect', 'evidence', 'observation', 'motive', 'timeline',
  'location', 'relationship', 'theory', 'question', 'conclusion', 'custom'
);

CREATE TYPE theory_connection_type AS ENUM (
  'supports', 'contradicts', 'relates_to', 'leads_to',
  'proves', 'disproves', 'implies', 'questions', 'explains', 'custom'
);

CREATE TYPE achievement_category AS ENUM (
  'case_completion', 'evidence', 'observation', 'interrogation',
  'timeline', 'theory', 'speed', 'perfection', 'exploration',
  'challenge', 'social', 'hidden', 'mastery'
);

CREATE TYPE achievement_rarity AS ENUM (
  'common', 'uncommon', 'rare', 'epic', 'legendary'
);

CREATE TYPE hint_level AS ENUM ('1', '2', '3', '4', '5');

CREATE TYPE hint_category AS ENUM (
  'observation', 'evidence', 'timeline', 'interrogation',
  'deduction', 'theory', 'navigation', 'objective'
);

CREATE TYPE save_slot_type AS ENUM ('auto', 'manual', 'checkpoint');

CREATE TYPE star_rating AS ENUM ('1', '2', '3', '4', '5');

CREATE TYPE score_rank AS ENUM ('S', 'A', 'B', 'C', 'D', 'F');

CREATE TYPE analytics_event_type AS ENUM (
  'screen_view', 'case_started', 'case_completed', 'case_abandoned',
  'evidence_discovered', 'observation_made', 'deduction_made',
  'interrogation_started', 'interrogation_completed',
  'contradiction_found', 'hint_used', 'timeline_event_placed',
  'theory_node_created', 'theory_connection_created',
  'achievement_unlocked', 'save_created', 'save_loaded',
  'error_occurred', 'performance_metric', 'feature_used', 'custom'
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_playtime_seconds INTEGER NOT NULL DEFAULT 0,
  cases_completed INTEGER NOT NULL DEFAULT 0,
  cases_started INTEGER NOT NULL DEFAULT 0,
  achievements_unlocked INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_total_score ON profiles(total_score DESC);

-- ============================================================
-- CASES
-- ============================================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty case_difficulty NOT NULL DEFAULT 'beginner',
  genre TEXT,
  time_period TEXT,
  location TEXT,
  summary TEXT,
  cover_image_url TEXT,
  estimated_time_minutes INTEGER,
  min_players INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL DEFAULT 1,
  author TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  unlock_condition JSONB,
  difficulty_config JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_difficulty ON cases(difficulty);
CREATE INDEX idx_cases_tags ON cases USING GIN(tags);
CREATE INDEX idx_cases_published ON cases(is_published) WHERE is_published = true;

CREATE TABLE case_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  unlock_condition JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(case_id, sort_order)
);

CREATE INDEX idx_case_chapters_case ON case_chapters(case_id, sort_order);

CREATE TABLE case_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES case_chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  objective_type TEXT NOT NULL DEFAULT 'primary', -- primary, secondary, hidden
  completion_condition JSONB,
  sort_order INTEGER NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_objectives_case ON case_objectives(case_id);

CREATE TABLE case_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  initial_view JSONB,
  unlock_condition JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_locations_case ON case_locations(case_id);

CREATE TABLE case_location_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_a_id UUID NOT NULL REFERENCES case_locations(id) ON DELETE CASCADE,
  location_b_id UUID NOT NULL REFERENCES case_locations(id) ON DELETE CASCADE,
  connection_label TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  unlock_condition JSONB,
  UNIQUE(location_a_id, location_b_id)
);

CREATE TABLE case_solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  correct_suspect_id UUID,
  correct_motive TEXT,
  explanation TEXT NOT NULL,
  required_evidence_ids UUID[] NOT NULL DEFAULT '{}',
  required_observation_ids UUID[] NOT NULL DEFAULT '{}',
  minimum_score INTEGER NOT NULL DEFAULT 0,
  alternative_solutions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EVIDENCE
-- ============================================================

CREATE TABLE evidence_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_type evidence_type NOT NULL,
  category evidence_category NOT NULL,
  location_id UUID REFERENCES case_locations(id) ON DELETE SET NULL,
  is_key_evidence BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  confidence_base NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence_base >= 0 AND confidence_base <= 1),
  unlock_condition JSONB,
  analysis_hint TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_case ON evidence_definitions(case_id);
CREATE INDEX idx_evidence_type ON evidence_definitions(evidence_type);
CREATE INDEX idx_evidence_category ON evidence_definitions(category);

CREATE TABLE evidence_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- image, audio, video, document
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  format TEXT,
  transcription TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_media_evidence ON evidence_media(evidence_id);

CREATE TABLE evidence_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID NOT NULL UNIQUE REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  dimensions JSONB, -- { width, height, unit }
  weight_grams NUMERIC,
  material TEXT,
  condition TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  time_of_collection TIMESTAMPTZ,
  collected_by TEXT,
  chain_of_custody JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_tag_mappings (
  evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES evidence_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (evidence_id, tag_id)
);

CREATE TABLE evidence_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  target_evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- supports, contradicts, relates_to, proves, disproves, duplicates, mentions
  description TEXT,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_evidence_id, target_evidence_id, relationship_type)
);

CREATE INDEX idx_evidence_rel_source ON evidence_relationships(source_evidence_id);
CREATE INDEX idx_evidence_rel_target ON evidence_relationships(target_evidence_id);

-- ============================================================
-- NPCs
-- ============================================================

CREATE TABLE npc_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role npc_role NOT NULL,
  description TEXT,
  portrait_url TEXT,
  default_location_id UUID REFERENCES case_locations(id) ON DELETE SET NULL,
  personality_traits TEXT[] NOT NULL DEFAULT '{}',
  background TEXT,
  motive TEXT,
  alibi TEXT,
  secrets TEXT[] NOT NULL DEFAULT '{}',
  schedule JSONB,
  is_suspect BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_npc_case ON npc_definitions(case_id);
CREATE INDEX idx_npc_role ON npc_definitions(role);

CREATE TABLE npc_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npc_a_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  npc_b_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  relationship_type relationship_status NOT NULL DEFAULT 'neutral',
  trust_level INTEGER NOT NULL DEFAULT 50 CHECK (trust_level >= 0 AND trust_level <= 100),
  description TEXT,
  UNIQUE(npc_a_id, npc_b_id)
);

CREATE INDEX idx_npc_rel_npc_a ON npc_relationships(npc_a_id);
CREATE INDEX idx_npc_rel_npc_b ON npc_relationships(npc_b_id);

CREATE TABLE npc_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npc_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  in_story_timestamp TIMESTAMPTZ,
  truth_value truth_value NOT NULL DEFAULT 'unknown',
  source_dialogue_node_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_npc_statements_npc ON npc_statements(npc_id);
CREATE INDEX idx_npc_statements_case ON npc_statements(case_id);

-- ============================================================
-- OBSERVATIONS
-- ============================================================

CREATE TABLE observation_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES case_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_interactable BOOLEAN NOT NULL DEFAULT true,
  interact_prompt TEXT,
  unlock_condition JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obs_objects_case ON observation_objects(case_id);
CREATE INDEX idx_obs_objects_location ON observation_objects(location_id);

CREATE TABLE observation_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  object_id UUID NOT NULL REFERENCES observation_objects(id) ON DELETE CASCADE,
  category observation_category NOT NULL DEFAULT 'visual',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  visibility observation_visibility NOT NULL DEFAULT 'visible',
  confidence_gain NUMERIC(3,2) NOT NULL DEFAULT 0.1 CHECK (confidence_gain >= 0 AND confidence_gain <= 1),
  is_critical BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obs_def_case ON observation_definitions(case_id);
CREATE INDEX idx_obs_def_object ON observation_definitions(object_id);
CREATE INDEX idx_obs_def_tags ON observation_definitions USING GIN(tags);

CREATE TABLE observation_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  observation_id UUID NOT NULL REFERENCES observation_definitions(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- evidence_discovered, observation_made, etc.
  target_id UUID,
  condition_value JSONB,
  operator TEXT NOT NULL DEFAULT 'equals', -- equals, not_equals, greater_than, less_than, contains, exists
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obs_cond_observation ON observation_conditions(observation_id);

CREATE TABLE observation_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  observation_id UUID NOT NULL REFERENCES observation_definitions(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES observation_definitions(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'requires', -- requires, enhances, contradicts, supersedes
  description TEXT,
  UNIQUE(observation_id, depends_on_id)
);

CREATE TABLE observation_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  observation_id UUID NOT NULL REFERENCES observation_definitions(id) ON DELETE CASCADE,
  deduction_id TEXT NOT NULL, -- references a deduction in the case's deduction graph
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(observation_id, deduction_id)
);

-- ============================================================
-- DIALOGUE & INTERROGATION
-- ============================================================

CREATE TABLE dialogue_trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  npc_id UUID REFERENCES npc_definitions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  root_node_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dialogue_tree_case ON dialogue_trees(case_id);

CREATE TABLE dialogue_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID NOT NULL REFERENCES dialogue_trees(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL DEFAULT 'npc', -- player, npc, system
  text TEXT NOT NULL,
  emotion TEXT, -- npc emotion
  next_node_id UUID REFERENCES dialogue_nodes(id) ON DELETE SET NULL,
  is_question BOOLEAN NOT NULL DEFAULT false,
  is_statement BOOLEAN NOT NULL DEFAULT false,
  statement_reference_id UUID REFERENCES npc_statements(id) ON DELETE SET NULL,
  on_enter_actions JSONB NOT NULL DEFAULT '[]',
  on_exit_actions JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dialogue_node_tree ON dialogue_nodes(tree_id);

CREATE TABLE dialogue_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES dialogue_nodes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  next_node_id UUID NOT NULL REFERENCES dialogue_nodes(id) ON DELETE CASCADE,
  choice_type TEXT NOT NULL DEFAULT 'question', -- question, statement, present_evidence, accuse, pressure, sympathize, leave
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_reason TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dialogue_choice_node ON dialogue_choices(node_id);

CREATE TABLE dialogue_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL, -- node, choice
  target_id UUID NOT NULL,
  condition_type TEXT NOT NULL, -- evidence_in_inventory, evidence_presented, etc.
  condition_target TEXT,
  operator TEXT NOT NULL DEFAULT '==',
  condition_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dialogue_cond_target ON dialogue_conditions(target_id);

CREATE TABLE interrogation_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  npc_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  dialogue_tree_id UUID NOT NULL REFERENCES dialogue_trees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  available_evidence_slots INTEGER NOT NULL DEFAULT 3,
  max_questions INTEGER,
  time_limit_seconds INTEGER,
  unlock_condition JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interrogation_case ON interrogation_definitions(case_id);
CREATE INDEX idx_interrogation_npc ON interrogation_definitions(npc_id);

-- ============================================================
-- TIMELINE
-- ============================================================

CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_time TIMESTAMPTZ,
  estimated_time TIMESTAMPTZ,
  is_time_confirmed BOOLEAN NOT NULL DEFAULT false,
  uncertainty_minutes INTEGER,
  duration_minutes INTEGER,
  location_id UUID REFERENCES case_locations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'event', -- event, alibi, discovery, testimony, crime, arrest, death, meeting, phone_call, transaction
  certainty TEXT NOT NULL DEFAULT 'uncertain', -- confirmed, likely, uncertain, disputed
  is_discovered BOOLEAN NOT NULL DEFAULT false,
  player_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_case ON timeline_events(case_id);
CREATE INDEX idx_timeline_time ON timeline_events(event_time) WHERE event_time IS NOT NULL;

CREATE TABLE timeline_event_participants (
  timeline_event_id UUID NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  npc_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (timeline_event_id, npc_id)
);

CREATE TABLE timeline_event_evidence (
  timeline_event_id UUID NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (timeline_event_id, evidence_id)
);

CREATE TABLE timeline_event_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  depends_on_event_id UUID NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'precedes', -- requires, contradicts, supports, precedes, follows
  UNIQUE(event_id, depends_on_event_id)
);

-- ============================================================
-- STATEMENTS & CONTRADICTIONS
-- ============================================================

CREATE TABLE statement_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statement_id UUID NOT NULL REFERENCES npc_statements(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL, -- evidence, observation, timeline_event, statement, location, npc
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'mentions', -- mentions, confirms, denies, alibis, witnessed, implies, disputes
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  UNIQUE(statement_id, reference_type, target_id)
);

CREATE INDEX idx_stmt_ref_statement ON statement_references(statement_id);

CREATE TABLE contradictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  statement_a_id UUID NOT NULL REFERENCES npc_statements(id) ON DELETE CASCADE,
  statement_b_id UUID NOT NULL REFERENCES npc_statements(id) ON DELETE CASCADE,
  contradiction_type contradiction_type NOT NULL,
  description TEXT NOT NULL,
  severity contradiction_severity NOT NULL DEFAULT 'moderate',
  is_auto_detected BOOLEAN NOT NULL DEFAULT true,
  requires_evidence_ids UUID[] NOT NULL DEFAULT '{}',
  score_value INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contradictions_case ON contradictions(case_id);
CREATE INDEX idx_contradictions_stmt_a ON contradictions(statement_a_id);
CREATE INDEX idx_contradictions_stmt_b ON contradictions(statement_b_id);

CREATE TABLE contradiction_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contradiction_id UUID NOT NULL UNIQUE REFERENCES contradictions(id) ON DELETE CASCADE,
  resolution_type TEXT NOT NULL, -- statement_false, statement_true, evidence_explains, timeline_corrected, misunderstanding, accomplice_explains
  resolving_evidence_id UUID REFERENCES evidence_definitions(id) ON DELETE SET NULL,
  resolving_statement_id UUID REFERENCES npc_statements(id) ON DELETE SET NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- THEORY BOARD
-- ============================================================

CREATE TABLE theory_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  viewport_x NUMERIC NOT NULL DEFAULT 0,
  viewport_y NUMERIC NOT NULL DEFAULT 0,
  zoom NUMERIC NOT NULL DEFAULT 1.0,
  grid_visible BOOLEAN NOT NULL DEFAULT true,
  snap_to_grid BOOLEAN NOT NULL DEFAULT false,
  grid_size INTEGER NOT NULL DEFAULT 20,
  auto_layout BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, case_id)
);

CREATE INDEX idx_theory_board_user ON theory_boards(user_id);
CREATE INDEX idx_theory_board_case ON theory_boards(case_id);

CREATE TABLE theory_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES theory_boards(id) ON DELETE CASCADE,
  node_type theory_node_type NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  x_position NUMERIC NOT NULL DEFAULT 0,
  y_position NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  is_discovered BOOLEAN NOT NULL DEFAULT true,
  is_correct BOOLEAN, -- null = not validated
  size TEXT NOT NULL DEFAULT 'medium', -- small, medium, large
  color TEXT,
  player_notes TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  evidence_refs UUID[] NOT NULL DEFAULT '{}',
  observation_refs UUID[] NOT NULL DEFAULT '{}',
  statement_refs UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_theory_node_board ON theory_nodes(board_id);

CREATE TABLE theory_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES theory_boards(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES theory_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES theory_nodes(id) ON DELETE CASCADE,
  label TEXT,
  connection_type theory_connection_type NOT NULL DEFAULT 'relates_to',
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  is_correct BOOLEAN,
  is_bidirectional BOOLEAN NOT NULL DEFAULT false,
  player_notes TEXT,
  color TEXT,
  style TEXT NOT NULL DEFAULT 'solid', -- solid, dashed, dotted
  thickness TEXT NOT NULL DEFAULT 'normal', -- thin, normal, thick
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_theory_conn_board ON theory_connections(board_id);
CREATE INDEX idx_theory_conn_source ON theory_connections(source_node_id);
CREATE INDEX idx_theory_conn_target ON theory_connections(target_node_id);

-- ============================================================
-- HINTS
-- ============================================================

CREATE TABLE hint_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  level hint_level NOT NULL DEFAULT '1',
  category hint_category NOT NULL,
  text TEXT NOT NULL,
  target_id UUID,
  penalty_points INTEGER NOT NULL DEFAULT 10,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  cooldown_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hint_case ON hint_definitions(case_id);

CREATE TABLE hint_prerequisites (
  hint_id UUID NOT NULL REFERENCES hint_definitions(id) ON DELETE CASCADE,
  prerequisite_hint_id UUID NOT NULL REFERENCES hint_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (hint_id, prerequisite_hint_id)
);

CREATE TABLE hint_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hint_id UUID NOT NULL REFERENCES hint_definitions(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- progress_percentage, time_elapsed, evidence_found, etc.
  threshold NUMERIC NOT NULL,
  target_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category achievement_category NOT NULL,
  rarity achievement_rarity NOT NULL DEFAULT 'common',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  icon TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  cosmetic_reward TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ach_def_category ON achievement_definitions(category);
CREATE INDEX idx_ach_def_rarity ON achievement_definitions(rarity);

CREATE TABLE achievement_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- cases_completed, evidence_found_total, etc.
  threshold NUMERIC NOT NULL,
  target_id UUID,
  params JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ach_cond_achievement ON achievement_conditions(achievement_id);

-- ============================================================
-- PLAYER PROGRESS
-- ============================================================

CREATE TABLE player_case_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status case_status NOT NULL DEFAULT 'in_progress',
  completed_objectives UUID[] NOT NULL DEFAULT '{}',
  active_objectives UUID[] NOT NULL DEFAULT '{}',
  hidden_discoveries JSONB NOT NULL DEFAULT '[]',
  current_chapter INTEGER NOT NULL DEFAULT 1,
  current_location_id UUID REFERENCES case_locations(id) ON DELETE SET NULL,
  current_phase investigation_phase NOT NULL DEFAULT 'briefing',
  action_history JSONB NOT NULL DEFAULT '[]',
  global_flags JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  time_played_seconds INTEGER NOT NULL DEFAULT 0,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, case_id)
);

CREATE INDEX idx_player_case_user ON player_case_progress(user_id);
CREATE INDEX idx_player_case_case ON player_case_progress(case_id);
CREATE INDEX idx_player_case_status ON player_case_progress(status);

CREATE TABLE player_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_definitions(id) ON DELETE CASCADE,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  analysis_notes TEXT,
  confidence_level NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  is_in_inventory BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, case_id, evidence_id)
);

CREATE INDEX idx_player_ev_user_case ON player_evidence(user_id, case_id);
CREATE INDEX idx_player_ev_evidence ON player_evidence(evidence_id);

CREATE TABLE player_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES observation_definitions(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  player_notes TEXT,
  confidence_level NUMERIC(3,2) NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, case_id, observation_id)
);

CREATE INDEX idx_player_obs_user_case ON player_observations(user_id, case_id);

CREATE TABLE player_interrogations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  interrogation_id UUID NOT NULL REFERENCES interrogation_definitions(id) ON DELETE CASCADE,
  npc_id UUID NOT NULL REFERENCES npc_definitions(id) ON DELETE CASCADE,
  npc_emotional_state npc_emotional_state NOT NULL DEFAULT 'neutral',
  trust_level INTEGER NOT NULL DEFAULT 50 CHECK (trust_level >= 0 AND trust_level <= 100),
  pressure_level INTEGER NOT NULL DEFAULT 0 CHECK (pressure_level >= 0 AND pressure_level <= 100),
  questions_unlocked UUID[] NOT NULL DEFAULT '{}',
  questions_asked UUID[] NOT NULL DEFAULT '{}',
  contradictions_found UUID[] NOT NULL DEFAULT '{}',
  evidence_presented UUID[] NOT NULL DEFAULT '{}',
  visited_nodes UUID[] NOT NULL DEFAULT '{}',
  choice_history JSONB NOT NULL DEFAULT '[]',
  is_complete BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, case_id, interrogation_id)
);

CREATE INDEX idx_player_int_user_case ON player_interrogations(user_id, case_id);

CREATE TABLE player_hints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  hint_id UUID NOT NULL REFERENCES hint_definitions(id) ON DELETE CASCADE,
  revealed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revealed_level hint_level NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, case_id, hint_id)
);

CREATE INDEX idx_player_hint_user_case ON player_hints(user_id, case_id);

CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  progress NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 1),
  current_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_player_ach_user ON player_achievements(user_id);
CREATE INDEX idx_player_ach_achievement ON player_achievements(achievement_id);
CREATE INDEX idx_player_ach_unlocked ON player_achievements(user_id, is_unlocked);

-- ============================================================
-- SCORES
-- ============================================================

CREATE TABLE score_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  observation_score INTEGER NOT NULL DEFAULT 0,
  evidence_score INTEGER NOT NULL DEFAULT 0,
  logic_score INTEGER NOT NULL DEFAULT 0,
  timeline_accuracy INTEGER NOT NULL DEFAULT 0,
  contradictions_found_score INTEGER NOT NULL DEFAULT 0,
  interrogation_score INTEGER NOT NULL DEFAULT 0,
  theory_board_accuracy INTEGER NOT NULL DEFAULT 0,
  hints_penalty INTEGER NOT NULL DEFAULT 0,
  wrong_accusations_penalty INTEGER NOT NULL DEFAULT 0,
  time_bonus INTEGER NOT NULL DEFAULT 0,
  optional_bonus INTEGER NOT NULL DEFAULT 0,
  hidden_discovery_bonus INTEGER NOT NULL DEFAULT 0,
  star_rating star_rating NOT NULL,
  rank score_rank NOT NULL,
  is_passing BOOLEAN NOT NULL DEFAULT false,
  hints_used INTEGER NOT NULL DEFAULT 0,
  wrong_accusations INTEGER NOT NULL DEFAULT 0,
  completion_time_minutes NUMERIC NOT NULL,
  percentile NUMERIC,
  is_new_high_score BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_score_user ON score_results(user_id);
CREATE INDEX idx_score_case ON score_results(case_id);
CREATE INDEX idx_score_user_case ON score_results(user_id, case_id);
CREATE INDEX idx_score_rank ON score_results(rank);

-- ============================================================
-- SAVES
-- ============================================================

CREATE TABLE save_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  slot_type save_slot_type NOT NULL DEFAULT 'manual',
  slot_number INTEGER NOT NULL,
  label TEXT,
  play_time_seconds INTEGER NOT NULL DEFAULT 0,
  progress_percentage NUMERIC NOT NULL DEFAULT 0,
  case_title TEXT NOT NULL,
  case_difficulty TEXT,
  current_location TEXT,
  current_chapter INTEGER,
  screenshot_url TEXT,
  game_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_save_user ON save_slots(user_id);
CREATE INDEX idx_save_user_case ON save_slots(user_id, case_id);
CREATE INDEX idx_save_slot_type ON save_slots(slot_type);

CREATE TABLE save_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  save_slot_id UUID NOT NULL UNIQUE REFERENCES save_slots(id) ON DELETE CASCADE,
  investigation_state JSONB NOT NULL,
  evidence_state JSONB NOT NULL,
  observation_state JSONB NOT NULL,
  timeline_state JSONB NOT NULL,
  theory_board_state JSONB,
  dialogue_state JSONB,
  npc_states JSONB,
  score_state JSONB,
  hint_state JSONB,
  achievement_progress JSONB,
  game_flags JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ANALYTICS
-- ============================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type analytics_event_type NOT NULL,
  session_id TEXT NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  app_version TEXT,
  platform TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  network_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_user_type ON analytics_events(user_id, event_type);

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metric TEXT NOT NULL, -- page_load, api_response, render_time, interaction_delay
  value_ms NUMERIC NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_perf_metric ON performance_metrics(metric);
CREATE INDEX idx_perf_created ON performance_metrics(created_at DESC);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theory_boards_updated_at
  BEFORE UPDATE ON theory_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theory_nodes_updated_at
  BEFORE UPDATE ON theory_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theory_connections_updated_at
  BEFORE UPDATE ON theory_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_save_slots_updated_at
  BEFORE UPDATE ON save_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_case_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_interrogations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_connections ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Cases: readable by all authenticated users, insert/update for admins only
CREATE POLICY "Cases are viewable by authenticated users"
  ON cases FOR SELECT TO authenticated USING (true);

-- Player progress: users CRUD their own
CREATE POLICY "Users manage their own case progress"
  ON player_case_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own evidence progress"
  ON player_evidence FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own observations"
  ON player_observations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own interrogations"
  ON player_interrogations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own hints"
  ON player_hints FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own achievements"
  ON player_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own scores"
  ON score_results FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own saves"
  ON save_slots FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own save data"
  ON save_data FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM save_slots WHERE save_slots.id = save_data.save_slot_id AND save_slots.user_id = auth.uid()));

CREATE POLICY "Users manage their own theory boards"
  ON theory_boards FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own theory nodes"
  ON theory_nodes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM theory_boards WHERE theory_boards.id = theory_nodes.board_id AND theory_boards.user_id = auth.uid()));

CREATE POLICY "Users manage their own theory connections"
  ON theory_connections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM theory_boards WHERE theory_boards.id = theory_connections.board_id AND theory_boards.user_id = auth.uid()));

