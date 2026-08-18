import {
  DiagnosticExamStart,
  DiagnosticResult,
  CurriculumUnit,
  LessonNode,
  FSRSCard,
  ChartPitchScenario,
  LeagueOverview,
  User,
} from './types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanApiUrl.endsWith('/api/v1') ? cleanApiUrl : `${cleanApiUrl}/api/v1`;

export interface LocalModelInfo {
  name: string;
  size_mb: number;
  parameter_size: string;
  family: string;
}

export interface OllamaStatus {
  status: 'online' | 'offline';
  default_model: string;
  models: LocalModelInfo[];
  provider: string;
}

export interface ChatTurnResponse {
  status: string;
  model_used: string;
  reply: string;
  feedback?: {
    analysis?: string;
    model_used?: string;
  };
}

export interface TOEFLFullExam {
  exam_id: string;
  title: string;
  reading_section: {
    passage_title: string;
    passage_text: string;
    academic_topic: string;
    questions: Array<{
      id: string;
      question_type: string;
      question_text: string;
      options: string[];
      correct_option: string;
      explanation_es: string;
    }>;
  };
  listening_section: Array<{
    id: string;
    audio_script: string;
    speed_factor: number;
    question_text: string;
    options: string[];
    correct_option: string;
    inference_key: string;
  }>;
  speaking_task: {
    task_id: string;
    title: string;
    prompt_en: string;
    prompt_es: string;
    prep_time_seconds: number;
    response_time_seconds: number;
    key_evaluation_criteria: string[];
  };
  writing_task: {
    task_id: string;
    title: string;
    essay_type: string;
    prompt_en: string;
    prompt_es: string;
    target_word_count: number;
    rubric_points: string[];
  };
}

export interface TOEFLCertificate {
  certificate_id: string;
  candidate_name: string;
  issue_date: string;
  toefl_total_score: number;
  ielts_equivalent_band: number;
  cefr_certified_level: string;
  section_scores: {
    Reading: number;
    Listening: number;
    Speaking: number;
    Writing: number;
  };
  subskill_radar: Record<string, number>;
  detailed_feedback: Record<string, any>;
  study_recommendations: string[];
}

export class ApiClient {
  private static token: string | null = null;

  static setToken(t: string) {
    this.token = t;
  }

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Fetch error for ${endpoint}:`, err);
      throw err;
    }
  }

  // 1. Auth
  static async getDemoUser(): Promise<{ access_token: string; user: User }> {
    return this.request<{ access_token: string; user: User }>('/auth/demo-guest');
  }

  // 2. Local Ollama AI Integration
  static async getLocalAIModels(): Promise<OllamaStatus> {
    return this.request<OllamaStatus>('/ai/models');
  }

  static async sendAIChat(
    messages: Array<{ role: string; content: string }>,
    persona: string = 'tutor',
    targetCefr: string = 'B1',
    model?: string
  ): Promise<ChatTurnResponse> {
    return this.request<ChatTurnResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        persona,
        target_cefr: targetCefr,
        model,
      }),
    });
  }

  static async evaluateEssayAI(text: string, taskType: string = 'essay', model?: string): Promise<any> {
    return this.request<any>('/ai/evaluate-writing', {
      method: 'POST',
      body: JSON.stringify({
        text,
        task_type: taskType,
        model,
      }),
    });
  }

  static async evaluateVoiceText(spoken_text: string, target_sentence?: string, duration_seconds: number = 4.0): Promise<any> {
    return this.request<any>('/voice/evaluate-text', {
      method: 'POST',
      body: JSON.stringify({
        spoken_text,
        target_sentence,
        duration_seconds,
      }),
    });
  }

  // 3. TOEFL & IELTS Official Standardized Simulation
  static async getTOEFLExam(): Promise<TOEFLFullExam> {
    return this.request<TOEFLFullExam>('/certification/exam');
  }

  static async submitTOEFLCertification(submission: {
    candidate_name: string;
    reading_answers: Record<string, string>;
    listening_answers: Record<string, string>;
    speaking_transcript: string;
    speaking_duration_sec: number;
    writing_essay_text: string;
  }): Promise<TOEFLCertificate> {
    return this.request<TOEFLCertificate>('/certification/evaluate', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  // 4. Placement Test
  static async startPlacement(): Promise<DiagnosticExamStart> {
    return this.request<DiagnosticExamStart>('/placement/start');
  }

  static async submitPlacement(submission: any): Promise<DiagnosticResult> {
    return this.request<DiagnosticResult>('/placement/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  // 5. Curriculum
  static async getUnits(userId?: string): Promise<CurriculumUnit[]> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request<CurriculumUnit[]>(`/curriculum/units${query}`);
  }

  static async getNode(nodeId: string): Promise<LessonNode> {
    return this.request<LessonNode>(`/curriculum/nodes/${nodeId}`);
  }

  static async submitLesson(nodeId: string, answers: Record<string, string>, userId?: string): Promise<any> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request<any>(`/curriculum/nodes/${nodeId}/submit${query}`, {
      method: 'POST',
      body: JSON.stringify({ node_id: nodeId, user_answers: answers }),
    });
  }

  // 6. FSRS Cards
  static async getDueCards(userId?: string): Promise<FSRSCard[]> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request<FSRSCard[]>(`/fsrs/due${query}`);
  }

  static async submitFSRSReview(cardId: string, rating: number, userId?: string): Promise<any> {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request<any>(`/fsrs/review${query}`, {
      method: 'POST',
      body: JSON.stringify({ card_id: cardId, rating }),
    });
  }

  // 7. Economics Labs
  static async getChartScenarios(): Promise<ChartPitchScenario[]> {
    return this.request<ChartPitchScenario[]>('/economics/charts/scenarios');
  }

  static async evaluateChartPitch(scenarioId: string, transcript: string, durationSec: number): Promise<any> {
    return this.request<any>('/economics/charts/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        scenario_id: scenarioId,
        spoken_transcript: transcript,
        audio_duration_seconds: durationSec,
      }),
    });
  }

  static async sendFedDebateTurn(scenarioName: string, argument: string, history: any[]): Promise<any> {
    return this.request<any>('/economics/fed-debate/turn', {
      method: 'POST',
      body: JSON.stringify({
        scenario_name: scenarioName,
        user_argument: argument,
        conversation_history: history,
      }),
    });
  }

  static async reviewAcademicWriting(text: string, genre: string = 'abstract'): Promise<any> {
    return this.request<any>('/economics/writing/review', {
      method: 'POST',
      body: JSON.stringify({
        text_to_review: text,
        genre,
      }),
    });
  }

  // 8. Gamification
  static async getLeaderboard(league: string = 'Gold', userId?: string): Promise<LeagueOverview> {
    const query = `?league=${league}${userId ? `&user_id=${userId}` : ''}`;
    return this.request<LeagueOverview>(`/gamification/leaderboard${query}`);
  }

  // 9. Frontier AI Methodologies (Speak, Praktika, Loora, ELSA, Talkpal)
  static async getSpeakPatterns(): Promise<{ status: string; patterns: any[] }> {
    return this.request<{ status: string; patterns: any[] }>('/frontier/speak/patterns');
  }

  static async evaluateSpeakTurn(data: {
    pattern_id: string;
    target_sentence: string;
    spoken_text: string;
    duration_seconds: number;
    latency_ms: number;
  }): Promise<any> {
    return this.request<any>('/frontier/speak/evaluate-turn', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getAvatarPersonas(): Promise<{ status: string; personas: Record<string, any> }> {
    return this.request<{ status: string; personas: Record<string, any> }>('/frontier/avatar/personas');
  }

  static async upgradeExecutiveText(text: string, domain: string = 'executive'): Promise<any> {
    return this.request<any>('/frontier/executive/upgrade', {
      method: 'POST',
      body: JSON.stringify({ text, domain }),
    });
  }

  static async getArticulatoryGuides(): Promise<{ status: string; guides: Record<string, any> }> {
    return this.request<{ status: string; guides: Record<string, any> }>('/frontier/phoneme/articulatory-data');
  }

  static async getRoleplayScenarios(): Promise<{ status: string; scenarios: any[] }> {
    return this.request<{ status: string; scenarios: any[] }>('/frontier/roleplays/scenarios');
  }

  static async getPhotoScenarios(): Promise<{ status: string; scenarios: any[] }> {
    return this.request<{ status: string; scenarios: any[] }>('/frontier/photos/scenarios');
  }

  static async processRoleplayTurn(data: {
    scenario_id: string;
    user_speech: string;
    conversation_history: Array<{ role: string; content: string }>;
  }): Promise<any> {
    return this.request<any>('/frontier/roleplays/turn', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 6. Proactive Voice Conversation & Audio Upload
  static async proactiveVoiceConverse(data: {
    persona_key: string;
    user_transcript: string;
    conversation_history: Array<{ role: string; content: string }>;
    target_cefr?: string;
  }): Promise<any> {
    return this.request<any>('/voice/converse', {
      method: 'POST',
      body: JSON.stringify({
        persona_key: data.persona_key,
        user_transcript: data.user_transcript,
        conversation_history: data.conversation_history,
        target_cefr: data.target_cefr || 'B1',
      }),
    });
  }

  static async transcribeAudioBlob(audioBlob: Blob, language: string = 'en'): Promise<string> {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    formData.append('language', language);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/voice/transcribe-audio`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Audio transcription failed');
      const data = await res.json();
      return data.transcript || '';
    } catch (err) {
      console.warn('Audio upload transcription error:', err);
      return '';
    }
  }
}
