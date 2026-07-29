export const EvidenceType = {
  PHYSICAL: "physical",
  DIGITAL: "digital",
  TESTIMONY: "testimony",
  DOCUMENT: "document",
  PHOTOGRAPH: "photograph",
  AUDIO: "audio",
  VIDEO: "video",
  REPORT: "report",
  RECEIPT: "receipt",
  OBJECT: "object",
  FINGERPRINT: "fingerprint",
  FOOTPRINT: "footprint",
  DNA: "dna",
  TOOL: "tool",
  WEAPON: "weapon",
  DRUG: "drug",
  FIBER: "fiber",
  DIGITAL_FILE: "digital_file",
  EMAIL: "email",
  PHONE_RECORD: "phone_record",
  BANK_STATEMENT: "bank_statement",
  SOCIAL_MEDIA: "social_media",
  CCTV: "cctv",
  LETTER: "letter",
  NOTE: "note",
  PHOTO: "photo",
  MAP: "map",
  DIAGRAM: "diagram",
  AUTOPSY_REPORT: "autopsy_report",
  LAB_REPORT: "lab_report",
} as const;

export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const EvidenceCategory = {
  WEAPON: "weapon",
  MOTIVE: "motive",
  OPPORTUNITY: "opportunity",
  ALIBI: "alibi",
  TIMELINE: "timeline",
  FORENSIC: "forensic",
  PHYSICAL: "physical",
  DIGITAL: "digital",
  TESTIMONY: "testimony",
  DOCUMENT: "document",
  CIRCUMSTANTIAL: "circumstantial",
  DIRECT: "direct",
  CORROBORATING: "corroborating",
  EXCULPATORY: "exculpatory",
  INCULPATORY: "inculpatory",
} as const;

export type EvidenceCategory = (typeof EvidenceCategory)[keyof typeof EvidenceCategory];

export const RelationshipType = {
  SUPPORTS: "supports",
  CONTRADICTS: "contradicts",
  RELATES_TO: "relates_to",
  PROVES: "proves",
  DISPROVES: "disproves",
  DUPLICATES: "duplicates",
  MENTIONS: "mentions",
  LEADS_TO: "leads_to",
  IMPLIES: "implies",
  QUESTIONS: "questions",
  EXPLAINS: "explains",
} as const;

export type RelationshipType = (typeof RelationshipType)[keyof typeof RelationshipType];

export const NodeType = {
  SUSPECT: "suspect",
  EVIDENCE: "evidence",
  OBSERVATION: "observation",
  MOTIVE: "motive",
  TIMELINE: "timeline",
  LOCATION: "location",
  RELATIONSHIP: "relationship",
  THEORY: "theory",
  QUESTION: "question",
  CONCLUSION: "conclusion",
  CUSTOM: "custom",
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export const TheoryConnectionType = {
  SUPPORTS: "supports",
  CONTRADICTS: "contradicts",
  RELATES_TO: "relates_to",
  LEADS_TO: "leads_to",
  PROVES: "proves",
  DISPROVES: "disproves",
  IMPLIES: "implies",
  QUESTIONS: "questions",
  EXPLAINS: "explains",
  CUSTOM: "custom",
} as const;

export type TheoryConnectionType = (typeof TheoryConnectionType)[keyof typeof TheoryConnectionType];

export const TimelineEventType = {
  EVENT: "event",
  ALIBI: "alibi",
  DISCOVERY: "discovery",
  TESTIMONY: "testimony",
  CRIME: "crime",
  ARREST: "arrest",
  DEATH: "death",
  MEETING: "meeting",
  PHONE_CALL: "phone_call",
  TRANSACTION: "transaction",
} as const;

export type TimelineEventType = (typeof TimelineEventType)[keyof typeof TimelineEventType];

export const TaskStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
  BLOCKED: "blocked",
  SKIPPED: "skipped",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const ProgressState = {
  LOCKED: "locked",
  UNLOCKED: "unlocked",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  MASTERED: "mastered",
} as const;

export type ProgressState = (typeof ProgressState)[keyof typeof ProgressState];

export const CaseDifficulty = {
  BEGINNER: "beginner",
  EASY: "easy",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
  MASTER: "master",
} as const;

export type CaseDifficulty = (typeof CaseDifficulty)[keyof typeof CaseDifficulty];

export const CaseStatus = {
  LOCKED: "locked",
  AVAILABLE: "available",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const InvestigationState = {
  IDLE: "idle",
  EXPLORING: "exploring",
  OBSERVING: "observing",
  COLLECTING: "collecting",
  INTERROGATING: "interrogating",
  REASONING: "reasoning",
  PAUSED: "paused",
  CONCLUDED: "concluded",
} as const;

export type InvestigationState = (typeof InvestigationState)[keyof typeof InvestigationState];

export const UnlockType = {
  PREVIOUS_CASE: "previous_case",
  SCORE_THRESHOLD: "score_threshold",
  ACHIEVEMENT: "achievement",
  DATE: "date",
  CUSTOM: "custom",
  EVIDENCE_COLLECTED: "evidence_collected",
  OBSERVATION_MADE: "observation_made",
  NPC_INTERROGATED: "npc_interrogated",
  CHAPTER_COMPLETED: "chapter_completed",
} as const;

export type UnlockType = (typeof UnlockType)[keyof typeof UnlockType];

export const HintLevel = {
  SUBTLE: "subtle",
  MODERATE: "moderate",
  DIRECT: "direct",
  REVEAL: "reveal",
} as const;

export type HintLevel = (typeof HintLevel)[keyof typeof HintLevel];

export const HintCategory = {
  LOCATION: "location",
  EVIDENCE: "evidence",
  OBSERVATION: "observation",
  INTERROGATION: "interrogation",
  TIMELINE: "timeline",
  THEORY: "theory",
  OBJECTIVE: "objective",
  NAVIGATION: "navigation",
  SYSTEM: "system",
} as const;

export type HintCategory = (typeof HintCategory)[keyof typeof HintCategory];

export const AchievementType = {
  CASE_COMPLETION: "case_completion",
  EVIDENCE: "evidence",
  OBSERVATION: "observation",
  INTERROGATION: "interrogation",
  TIMELINE: "timeline",
  THEORY: "theory",
  SPEED: "speed",
  PERFECTION: "perfection",
  EXPLORATION: "exploration",
  CHALLENGE: "challenge",
  SOCIAL: "social",
  HIDDEN: "hidden",
  MASTERY: "mastery",
} as const;

export type AchievementType = (typeof AchievementType)[keyof typeof AchievementType];

export const AchievementRarity = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
} as const;

export type AchievementRarity = (typeof AchievementRarity)[keyof typeof AchievementRarity];

export const ScoreCategory = {
  EVIDENCE: "evidence",
  OBSERVATION: "observation",
  INTERROGATION: "interrogation",
  TIMELINE: "timeline",
  THEORY: "theory",
  SPEED: "speed",
  ACCURACY: "accuracy",
  COMPLETENESS: "completeness",
  HINT_PENALTY: "hint_penalty",
  PERFECTION: "perfection",
} as const;

export type ScoreCategory = (typeof ScoreCategory)[keyof typeof ScoreCategory];

export const NotificationType = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  ACHIEVEMENT: "achievement",
  PROGRESS: "progress",
  HINT: "hint",
  SYSTEM: "system",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NPCRole = {
  WITNESS: "witness",
  SUSPECT: "suspect",
  VICTIM: "victim",
  INFORMANT: "informant",
  EXPERT: "expert",
  BYSTANDER: "bystander",
  DETECTIVE: "detective",
  POLICE: "police",
  FORENSIC_EXPERT: "forensic_expert",
  MEDICAL_EXAMINER: "medical_examiner",
  LAWYER: "lawyer",
  JOURNALIST: "journalist",
  FAMILY_MEMBER: "family_member",
  ACCOMPLICE: "accomplice",
  MASTERMIND: "mastermind",
  RED_HERRING: "red_herring",
} as const;

export type NPCRole = (typeof NPCRole)[keyof typeof NPCRole];

export const RelationshipStatus = {
  NEUTRAL: "neutral",
  FRIENDLY: "friendly",
  HOSTILE: "hostile",
  COOPERATIVE: "cooperative",
  DECEPTIVE: "deceptive",
} as const;

export type RelationshipStatus = (typeof RelationshipStatus)[keyof typeof RelationshipStatus];

export const EmotionalState = {
  NEUTRAL: "neutral",
  ANGRY: "angry",
  SAD: "sad",
  SCARED: "scared",
  NERVOUS: "nervous",
  CONFIDENT: "confident",
  EVASIVE: "evasive",
  COOPERATIVE: "cooperative",
  HOSTILE: "hostile",
  GRIEVING: "grieving",
  CALM: "calm",
  AGITATED: "agitated",
  SUSPICIOUS: "suspicious",
  LYING: "lying",
} as const;

export type EmotionalState = (typeof EmotionalState)[keyof typeof EmotionalState];

export const ObservationCategory = {
  VISUAL: "visual",
  AUDITORY: "auditory",
  TACTILE: "tactile",
  ANALYTICAL: "analytical",
  DEDUCTIVE: "deductive",
  CONTEXTUAL: "contextual",
  BEHAVIORAL: "behavioral",
} as const;

export type ObservationCategory = (typeof ObservationCategory)[keyof typeof ObservationCategory];

export const ObservationVisibility = {
  VISIBLE: "visible",
  HIDDEN: "hidden",
  CONDITIONAL: "conditional",
  TIMED: "timed",
} as const;

export type ObservationVisibility = (typeof ObservationVisibility)[keyof typeof ObservationVisibility];

export const ContradictionType = {
  FACTUAL: "factual",
  TEMPORAL: "temporal",
  SPATIAL: "spatial",
  LOGICAL: "logical",
  TESTIMONY: "testimony",
  EVIDENCE: "evidence",
  ALIBI: "alibi",
  MOTIVE: "motive",
} as const;

export type ContradictionType = (typeof ContradictionType)[keyof typeof ContradictionType];

export const InvestigationPhase = {
  BRIEFING: "briefing",
  EXPLORATION: "exploration",
  EVIDENCE_COLLECTION: "evidence_collection",
  INTERROGATION: "interrogation",
  ANALYSIS: "analysis",
  THEORY_BUILDING: "theory_building",
  DEDUCTION: "deduction",
  RESOLUTION: "resolution",
  CONCLUSION: "conclusion",
  REVIEW: "review",
} as const;

export type InvestigationPhase = (typeof InvestigationPhase)[keyof typeof InvestigationPhase];

export const AnalyticsEventType = {
  CASE_STARTED: "case_started",
  CASE_COMPLETED: "case_completed",
  CASE_FAILED: "case_failed",
  EVIDENCE_COLLECTED: "evidence_collected",
  EVIDENCE_ANALYZED: "evidence_analyzed",
  OBSERVATION_MADE: "observation_made",
  INTERROGATION_STARTED: "interrogation_started",
  INTERROGATION_COMPLETED: "interrogation_completed",
  CONTRADICTION_FOUND: "contradiction_found",
  TIMELINE_UPDATED: "timeline_updated",
  THEORY_NODE_CREATED: "theory_node_created",
  THEORY_CONNECTION_MADE: "theory_connection_made",
  HINT_USED: "hint_used",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  OBJECTIVE_COMPLETED: "objective_completed",
  LOCATION_VISITED: "location_visited",
  PROGRESS_SAVED: "progress_saved",
  SCREEN_VIEW: "screen_view",
  PERFORMANCE_METRIC: "performance_metric",
  ERROR_OCCURRED: "error_occurred",
  USER_ACTION: "user_action",
} as const;

export type AnalyticsEventType = (typeof AnalyticsEventType)[keyof typeof AnalyticsEventType];

export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const FilterOperator = {
  EQUALS: "equals",
  NOT_EQUALS: "not_equals",
  GREATER_THAN: "greater_than",
  LESS_THAN: "less_than",
  CONTAINS: "contains",
  EXISTS: "exists",
  IN: "in",
  BETWEEN: "between",
  STARTS_WITH: "starts_with",
  ENDS_WITH: "ends_with",
} as const;

export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator];

export const ConditionType = {
  EVIDENCE_DISCOVERED: "evidence_discovered",
  OBSERVATION_MADE: "observation_made",
  NPC_INTERROGATED: "npc_interrogated",
  TIME_REACHED: "time_reached",
  LOCATION_VISITED: "location_visited",
  SCORE_THRESHOLD: "score_threshold",
  DEDUCTION_MADE: "deduction_made",
  STATEMENT_VERIFIED: "statement_verified",
  CUSTOM: "custom",
} as const;

export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType];

export const DependencyType = {
  REQUIRES: "requires",
  ENHANCES: "enhances",
  CONTRADICTS: "contradicts",
  SUPERSEDES: "supersedes",
  PRECEDES: "precedes",
  FOLLOWS: "follows",
} as const;

export type DependencyType = (typeof DependencyType)[keyof typeof DependencyType];
