export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface User {
  id: string;
  email: string;
  full_name: string;
  current_cefr_level: CEFRLevel;
  xp_points: number;
  current_streak: number;
  streak_freeze_count: number;
  last_activity_date: string;
  created_at: string;
}

export interface ExerciseItem {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'sentence_builder' | 'voice_repetition' | 'chart_interpretation' | 'reading_comprehension' | 'listening_comprehension' | 'open_writing';
  prompt_en: string;
  prompt_es?: string;
  passage_text?: string;
  audio_script?: string;
  target_sentence?: string;
  options?: string[];
  correct_answer: string;
  contrastive_note_es?: string;
  tokens_to_arrange?: string[];
}

export interface PhonemeScore {
  phoneme: string;
  ipa: string;
  score: number;
  is_contrastive_risk?: boolean;
  tip_es?: string;
}

export interface VoiceEvaluationResult {
  transcript: string;
  target_sentence?: string;
  overall_accuracy: number;
  fluency_wpm: number;
  phoneme_breakdown: PhonemeScore[];
  l1_interference_alerts: string[];
  xp_earned: number;
}

export interface LessonNode {
  id: string;
  unit_id: string;
  node_type: 'standard_drill' | 'voice_roleplay' | 'chart_pitch' | 'boss_challenge';
  title: string;
  order_index: number;
  xp_reward: number;
  track: 'general' | 'economics';
  status: 'locked' | 'unlocked' | 'completed' | 'mastered';
  score_percentage: number;
  content_payload?: {
    summary: string;
    grammar_focus?: string;
    exercises: ExerciseItem[];
  };
}

export interface CurriculumUnit {
  id: string;
  cefr_level: CEFRLevel;
  unit_number: number;
  title: string;
  description?: string;
  icon_name: string;
  nodes: LessonNode[];
}

export interface VocabularyItem {
  id: string;
  lemma: string;
  part_of_speech?: string;
  cefr_level: CEFRLevel;
  category: string;
  definition_en: string;
  definition_es: string;
  collocations: string[];
  example_sentence: string;
  audio_url?: string;
}

export interface FSRSCard {
  id: string;
  vocab_id: string;
  vocabulary: VocabularyItem;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  state: number;
  due_date: string;
}

export interface ClozeQuestion {
  id: string;
  cefr_level: CEFRLevel;
  category: string;
  sentence_with_blank: string;
  options: string[];
  correct_option: string;
  contrastive_tip_es: string;
}

export interface ListeningQuestion {
  id: string;
  cefr_level: CEFRLevel;
  audio_text: string;
  audio_speed: number;
  question_text: string;
  options: string[];
  correct_option: string;
  inference_key: string;
}

export interface EconomicsQuestion {
  id: string;
  term: string;
  part_of_speech: string;
  definition_prompt: string;
  options: string[];
  correct_option: string;
  subfield: string;
  example_usage: string;
}

export interface SpokenPrompt {
  prompt_id: string;
  scenario_title: string;
  instructions_en: string;
  instructions_es: string;
  target_keywords: string[];
  expected_duration_seconds: number;
}

export interface DiagnosticExamStart {
  session_id: string;
  cloze_questions: ClozeQuestion[];
  listening_questions: ListeningQuestion[];
  economics_questions: EconomicsQuestion[];
  spoken_prompt: SpokenPrompt;
}

export interface DayPlanItem {
  day: number;
  focus_topic: string;
  target_skill: string;
  minutes_recommended: number;
  suggested_nodes: string[];
}

export interface DiagnosticResult {
  id?: string;
  overall_cefr: CEFRLevel;
  grammar_score: number;
  listening_score: number;
  speaking_score: number;
  economics_vocab_score: number;
  radar_metrics: Record<string, number>;
  spoken_evaluation?: {
    lexical_diversity_ttr: number;
    cefr_vocabulary_level: string;
    grammatical_complexity_score: number;
    wpm_speaking_rate: number;
    contrastive_errors_detected: string[];
    phonetic_clarity_score: number;
    feedback_es: string;
  };
  contrastive_weaknesses: Array<{
    question: string;
    category: string;
    your_answer: string;
    correct_answer: string;
    explanation_es: string;
  }>;
  study_plan_days: number;
  study_roadmap: DayPlanItem[];
}

export interface ChartDataPoint {
  period: string;
  value: number;
  secondary_value?: number;
  annotation?: string;
}

export interface ChartPitchScenario {
  id: string;
  title: string;
  indicator_type: string;
  context_en: string;
  context_es: string;
  data_points: ChartDataPoint[];
  key_movements: string[];
  suggested_vocabulary: Array<{
    word: string;
    definition: string;
    collocations: string;
  }>;
  target_pitch_seconds: number;
}

export interface LeaderboardUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  xp_points: number;
  current_streak: number;
  cefr_level: string;
  rank: number;
  league_name: string;
}

export interface LeagueOverview {
  current_league: string;
  days_left_in_cycle: number;
  leaderboard: LeaderboardUser[];
  user_position: number;
  top_promotion_cutoff: number;
  demotion_cutoff: number;
}

// ==========================================
// FRONTIER METHODOLOGIES INTERFACES
// ==========================================

export interface SpeakVariation {
  prompt_es: string;
  target_en: string;
  focus_word: string;
}

export interface SpeakPatternModule {
  pattern_id: string;
  pattern_name: string;
  target_rule: string;
  cefr_level: string;
  core_template: string;
  variations: SpeakVariation[];
}

export interface SpeakTurnEvaluation {
  status: string;
  target_sentence: string;
  spoken_text: string;
  accuracy: number;
  fluency_wpm: number;
  motor_automaticity_score: number;
  latency_ms: number;
  phoneme_breakdown: PhonemeScore[];
  is_mastered: boolean;
}

export interface AvatarPersona {
  name: string;
  accent: string;
  role: string;
  avatar_style: string;
  personality: string;
  voice_id: string;
  speed: number;
}

export interface LooraGrammarCorrection {
  error: string;
  fix: string;
  tag: string;
  explanation: string;
}

export interface LooraC1Upgrade {
  original: string;
  upgraded: string;
  nuance_explanation: string;
}

export interface LooraUpgradeResponse {
  original_text: string;
  cefr_detected: string;
  grammar_corrections: LooraGrammarCorrection[];
  c1_c2_upgrades: LooraC1Upgrade[];
  executive_radar: {
    lexical_density: number;
    cohesion: number;
    formality: number;
    precision: number;
  };
  suggested_follow_up: string;
}

export interface MinimalPairItem {
  word_a: string;
  word_b: string;
  contrast: string;
}

export interface ArticulatoryGuide {
  title: string;
  spanish_interference: string;
  tongue_position: string;
  lip_shape: string;
  vocal_cords: string;
  minimal_pairs: MinimalPairItem[];
}

export interface RoleplayScenario {
  id: string;
  title: string;
  category: string;
  ai_character: string;
  objective: string;
  initial_prompt: string;
  evaluation_criteria: string[];
}

export interface PhotoScenario {
  id: string;
  title: string;
  image_url: string;
  prompt_en: string;
  key_vocabulary: string[];
}
