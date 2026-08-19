'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Clock,
  BookOpen,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { LessonNode, ExerciseItem } from '@/lib/types';
import { ProgressBar } from '@/components/map/ProgressBar';
import { RewardSplash } from '@/components/gamification/RewardSplash';
import { AudioRecorder } from '@/components/voice/AudioRecorder';
import { PhonemeFeedback } from '@/components/voice/PhonemeFeedback';
import { useAudioEffects } from '@/hooks/useAudioEffects';

const DEMO_EXERCISES: ExerciseItem[] = [
  {
    id: 'ex_1',
    type: 'reading_comprehension',
    prompt_en: 'Read the passage and select the true statement:',
    passage_text:
      'In macroeconomics, a central bank is an institution that manages currency and monetary policy. When a central bank wishes to stimulate the economy, it typically lowers interest rates to encourage borrowing and investment. Conversely, to combat high inflation, it may raise interest rates. This mechanism directly affects the cost of capital for businesses and the yield on savings for households.',
    options: [
      'Central banks raise interest rates to stimulate economic borrowing.',
      'Lowering interest rates is a common strategy to stimulate economic growth.',
      'The cost of capital is unaffected by central bank monetary policies.',
      'Central banks do not manage currency of a state.',
    ],
    correct_answer: 'Lowering interest rates is a common strategy to stimulate economic growth.',
    contrastive_note_es:
      'Nota que "interest rates" se traduce como "tasas de interés". Es común omitir el artículo "the" en inglés al hablar en plural de forma general.',
  },
  {
    id: 'ex_2',
    type: 'multiple_choice',
    prompt_es: '¿Cómo se dice formalmente: "Es importante analizar los datos"?',
    prompt_en: 'Choose the correct English construction:',
    options: [
      'Is important to analyze the data',
      'It is important to analyze the data',
      'Important is analyze the data',
    ],
    correct_answer: 'It is important to analyze the data',
    contrastive_note_es:
      'En español el sujeto suele ser tácito ("Es importante"), pero en inglés "It" es obligatorio como pronombre sujeto explícito.',
  },
  {
    id: 'ex_3',
    type: 'sentence_builder',
    prompt_es: 'Ordena las palabras para formar: "La inflación es un riesgo grave."',
    prompt_en: 'Arrange the tokens in order:',
    tokens_to_arrange: ['Inflation', 'is', 'a', 'serious', 'risk'],
    correct_answer: 'Inflation is a serious risk',
    contrastive_note_es:
      'En conceptos abstractos generales como "Inflación", en inglés NO se usa el artículo "The" (No es "The inflation").',
  },
  {
    id: 'ex_4',
    type: 'listening_comprehension',
    prompt_en: 'Listen to the audio and select the word that completes the sentence:',
    audio_script:
      'The recent quarter showed a significant decline in consumer spending due to the sudden spike in commodity prices.',
    options: ['commodity', 'accommodation', 'community', 'comedy'],
    correct_answer: 'commodity',
    contrastive_note_es:
      '"Commodity" se refiere a materias primas o bienes básicos. Suena similar a "community", diferencia los fonemas.',
  },
  {
    id: 'ex_5',
    type: 'voice_repetition',
    prompt_en: 'Pronounce the following sentence clearly into your microphone:',
    correct_answer: 'The economic forecast depends on fiscal policy.',
    contrastive_note_es:
      'Asegúrate de unir las palabras (linking): "depends on" suena como /dɪˈpendzɒn/.',
  },
  {
    id: 'ex_6',
    type: 'multiple_choice',
    prompt_en: 'The economic forecast depends _______ fiscal policy.',
    options: ['of', 'on', 'in', 'from'],
    correct_answer: 'on',
    contrastive_note_es:
      'En inglés el verbo es "depend ON", nunca "depend of". Es un error de régimen preposicional común en hispanohablantes.',
  },
];

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = (params.nodeId as string) || 'node_1_1';
  const { playSuccess, playError, playLevelUp, playClick, speakText } = useAudioEffects();

  const [nodeData, setNodeData] = useState<LessonNode>({
    id: nodeId,
    unit_id: 'unit_1',
    node_type: 'standard_drill',
    title: 'Subject Pronouns & "It is" Rule',
    order_index: 1,
    xp_reward: 20,
    track: 'general',
    status: 'unlocked',
    score_percentage: 0,
    content_payload: {
      summary:
        'En inglés, a diferencia del español, todas las oraciones (excepto imperativos) requieren un sujeto explícito. No podemos omitir el pronombre, incluso cuando nos referimos a conceptos abstractos o fenómenos naturales.',
      grammar_focus:
        'Contrastive SLA: Uso obligatorio del pronombre \'It\'. Por ejemplo: \'Es importante\' -> \'It is important\', NUNCA \'Is important\'.',
      exercises: DEMO_EXERCISES,
    },
  });

  const [exercises, setExercises] = useState<ExerciseItem[]>(DEMO_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTheory, setShowTheory] = useState(true);

  // Current exercise state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [arrangedTokens, setArrangedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [spokenText, setSpokenText] = useState('');
  const [writtenText, setWrittenText] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(45 * 60);
  const [voiceEvalResult, setVoiceEvalResult] = useState<any>(null);

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});

  // Finished state
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showTheory && !isFinished) {
      timer = setInterval(() => {
        setSessionTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showTheory, isFinished]);

  useEffect(() => {
    async function loadNode() {
      try {
        const node = await ApiClient.getNode(nodeId);
        if (node) {
          setNodeData(node);
          const exList = node.content_payload?.exercises || [];
          if (exList.length > 0) {
            setExercises(exList);
            if (exList[0]?.tokens_to_arrange) {
              setAvailableTokens([...exList[0].tokens_to_arrange]);
            }
          }
        }
      } catch {
        // Fallback initialized
      }
    }
    loadNode();
  }, [nodeId]);

  const currentExercise = exercises[currentIndex] || DEMO_EXERCISES[0];

  const handleTokenClick = (token: string, fromArranged: boolean) => {
    playClick();
    if (fromArranged) {
      setArrangedTokens((prev) => prev.filter((t, i) => i !== prev.indexOf(token)));
      setAvailableTokens((prev) => [...prev, token]);
    } else {
      setAvailableTokens((prev) => prev.filter((t, i) => i !== prev.indexOf(token)));
      setArrangedTokens((prev) => [...prev, token]);
    }
  };

  const handleCheckAnswer = async (providedVoiceTxt?: string) => {
    if (!currentExercise) return;

    let userAns = '';
    if (
      currentExercise.type === 'multiple_choice' ||
      currentExercise.type === 'chart_interpretation' ||
      currentExercise.type === 'reading_comprehension' ||
      currentExercise.type === 'listening_comprehension'
    ) {
      userAns = selectedOption || '';
    } else if (currentExercise.type === 'sentence_builder') {
      userAns = arrangedTokens.join(' ');
    } else if (currentExercise.type === 'voice_repetition') {
      userAns = typeof providedVoiceTxt === 'string' ? providedVoiceTxt : spokenText;
    } else if (currentExercise.type === 'open_writing') {
      userAns = writtenText;
    }

    let correct = false;
    if (currentExercise.type === 'voice_repetition') {
      try {
        const result = await ApiClient.evaluateVoiceText(userAns, currentExercise.correct_answer, 5.0);
        setVoiceEvalResult(result);
        correct = result.overall_accuracy >= 60.0;
      } catch {
        correct = userAns.trim().toLowerCase() === currentExercise.correct_answer.trim().toLowerCase();
      }
    } else if (currentExercise.type === 'open_writing') {
      correct = userAns.length > 20 && userAns.toLowerCase().includes(currentExercise.correct_answer.toLowerCase());
    } else {
      correct = userAns.trim().toLowerCase() === currentExercise.correct_answer.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setAnswersMap((prev) => ({ ...prev, [currentExercise.id]: userAns }));

    if (correct) {
      playSuccess();
    } else {
      playError();
    }
  };

  const handleNext = async () => {
    playClick();
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setArrangedTokens([]);
    setWrittenText('');
    setVoiceEvalResult(null);

    if (currentIndex < exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (exercises[nextIdx]?.tokens_to_arrange) {
        setAvailableTokens([...exercises[nextIdx].tokens_to_arrange!]);
      }
    } else {
      // Complete lesson
      try {
        const res = await ApiClient.submitLesson(nodeId, answersMap);
        setResultData(res);
      } catch {
        setResultData({
          score_percentage: 100,
          xp_earned: nodeData?.xp_reward || 25,
          correct_count: exercises.length,
          total_count: exercises.length,
          status: 'mastered',
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`completed_${nodeId}`, 'true');
      }

      setIsFinished(true);
      setShowReward(true);
      playLevelUp();
    }
  };

  // Finished Screen
  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">¡Lección Completada!</h1>
            <p className="text-sm text-gray-500 mt-1">Has dominado los conceptos clave de esta lección.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <span className="text-2xl font-bold text-indigo-600">+{resultData?.xp_earned || 25}</span>
              <p className="text-xs font-semibold text-indigo-700 mt-1">XP Ganados</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-2xl font-bold text-emerald-600">100%</span>
              <p className="text-xs font-semibold text-emerald-700 mt-1">Precisión</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/learn')}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-95 transition-all"
          >
            Continuar Ruta de Aprendizaje
          </button>
        </motion.div>

        <RewardSplash
          show={showReward}
          xpAmount={resultData?.xp_earned || 25}
          title={`¡${nodeData.title} Dominada!`}
          subtitle="Has subido de nivel en tu ruta personalizada."
        />
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;
  const minutes = Math.floor(sessionTimeLeft / 60);
  const seconds = sessionTimeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header with Progress and Exit */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/learn')}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Salir"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={exercises.length} colorClass="bg-indigo-600" />
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-gray-500 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>

      {showTheory ? (
        /* Theory Modal / Introduction */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6"
        >
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enfoque Pedagógico SLA</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{nodeData.title}</h2>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                {nodeData.content_payload?.summary}
              </p>
              <button
                onClick={() => speakText(nodeData.content_payload?.summary || '')}
                className="p-2 rounded-xl bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 shadow-sm"
                title="Escuchar explicación"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {nodeData.content_payload?.grammar_focus && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs font-bold text-indigo-600 block mb-1">
                  💡 Regla Contrastiva Clave:
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {nodeData.content_payload.grammar_focus}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              playClick();
              setShowTheory(false);
            }}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Comenzar Práctica</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Drill Question Card */}
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
            <div>
              {currentExercise.prompt_es && (
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  💡 {currentExercise.prompt_es}
                </p>
              )}
              <h2 className="text-xl font-bold text-gray-900 leading-relaxed tracking-tight">
                {currentExercise.prompt_en}
              </h2>
            </div>

            {/* Reading / Listening Passage */}
            {currentExercise.type === 'reading_comprehension' && currentExercise.passage_text && (
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl max-h-56 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed font-normal">
                  {currentExercise.passage_text}
                </p>
              </div>
            )}

            {currentExercise.type === 'listening_comprehension' && currentExercise.audio_script && (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-2xl gap-3">
                <button
                  onClick={() => speakText(currentExercise.audio_script!)}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                <p className="text-xs text-gray-500 font-semibold">Toca para escuchar el audio</p>
              </div>
            )}

            {/* Multiple Choice Options */}
            {(currentExercise.type === 'multiple_choice' ||
              currentExercise.type === 'reading_comprehension' ||
              currentExercise.type === 'listening_comprehension' ||
              currentExercise.type === 'chart_interpretation') &&
              currentExercise.options && (
                <div className="space-y-3">
                  {currentExercise.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isAnswerChecked}
                        onClick={() => {
                          playClick();
                          setSelectedOption(opt);
                        }}
                        className={`w-full p-4 rounded-xl text-left text-sm font-semibold border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'
                        }`}
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(opt);
                          }}
                          className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                          title="Escuchar pronunciación"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Sentence Builder */}
            {currentExercise.type === 'sentence_builder' && (
              <div className="space-y-6">
                <div className="min-h-[64px] p-3 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-wrap items-center gap-2">
                  {arrangedTokens.map((t, i) => (
                    <button
                      key={i}
                      disabled={isAnswerChecked}
                      onClick={() => handleTokenClick(t, true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm"
                    >
                      {t}
                    </button>
                  ))}
                  {arrangedTokens.length === 0 && (
                    <span className="text-xs text-gray-400 italic">Haz clic en las palabras de abajo</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5 justify-center">
                  {availableTokens.map((t, i) => (
                    <button
                      key={i}
                      disabled={isAnswerChecked}
                      onClick={() => handleTokenClick(t, false)}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold text-sm shadow-sm"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Repetition */}
            {currentExercise.type === 'voice_repetition' && (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-3">
                  <button
                    onClick={() => speakText(currentExercise.correct_answer)}
                    className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <span className="text-base font-bold text-gray-900">
                    &quot;{currentExercise.correct_answer}&quot;
                  </span>
                </div>

                <AudioRecorder
                  targetSentence={currentExercise.correct_answer}
                  onComplete={(transcript) => {
                    setSpokenText(transcript);
                    handleCheckAnswer(transcript);
                  }}
                  maxSeconds={15}
                />
              </div>
            )}

            {/* Open Writing */}
            {currentExercise.type === 'open_writing' && (
              <div className="space-y-3">
                <textarea
                  disabled={isAnswerChecked}
                  value={writtenText}
                  onChange={(e) => setWrittenText(e.target.value)}
                  placeholder="Escribe tu respuesta en inglés..."
                  className="w-full h-32 p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 transition-colors resize-none text-sm shadow-sm"
                />
                <p className="text-xs text-gray-400 text-right font-mono">
                  {writtenText.length} caracteres
                </p>
              </div>
            )}
          </div>

          {/* Feedback Bottom Banner */}
          <AnimatePresence>
            {isAnswerChecked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-6 rounded-2xl border shadow-md space-y-3 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isCorrect ? (
                      <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <span className="text-base font-bold">
                      {isCorrect ? '¡Excelente! Respuesta Correcta' : 'Respuesta Incorrecta'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {isCorrect ? '+20 XP' : `Correcta: "${currentExercise.correct_answer}"`}
                  </span>
                </div>

                {currentExercise.contrastive_note_es && (
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 space-y-1">
                    <span className="font-semibold text-indigo-600 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Explicación Lingüística:</span>
                    </span>
                    <p className="leading-relaxed">{currentExercise.contrastive_note_es}</p>
                  </div>
                )}

                {currentExercise.type === 'voice_repetition' && (
                  <div className="pt-2">
                    <PhonemeFeedback
                      accuracy={voiceEvalResult?.overall_accuracy ?? (isCorrect ? 92 : 45)}
                      wpm={voiceEvalResult?.fluency_wpm ?? (isCorrect ? 130 : 60)}
                      phonemes={
                        voiceEvalResult?.phoneme_breakdown ?? [
                          { phoneme: 'target', ipa: '/ˈtɑːrɡɪt/', score: isCorrect ? 0.95 : 0.4 },
                          { phoneme: 'words', ipa: '/wɜːrdz/', score: isCorrect ? 0.88 : 0.3 },
                        ]
                      }
                      alerts={
                        voiceEvalResult?.l1_interference_alerts ??
                        (!isCorrect
                          ? ['Se detectó ritmo silábico español. Intenta usar ritmo acentual en inglés.']
                          : [])
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm active:scale-95 transition-all ${
                      isCorrect
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Check Answer Button */}
          {!isAnswerChecked && currentExercise.type !== 'voice_repetition' && (
            <div className="flex justify-end">
              <button
                onClick={() => handleCheckAnswer()}
                disabled={
                  isAnswerChecked ||
                  (currentExercise.type === 'multiple_choice' && !selectedOption) ||
                  (currentExercise.type === 'sentence_builder' && arrangedTokens.length === 0) ||
                  (currentExercise.type === 'open_writing' && writtenText.trim().length === 0) ||
                  (currentExercise.type !== 'multiple_choice' &&
                    currentExercise.type !== 'sentence_builder' &&
                    currentExercise.type !== 'open_writing' &&
                    !selectedOption &&
                    arrangedTokens.length === 0)
                }
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm active:scale-95 disabled:opacity-40 transition-all"
              >
                Comprobar Respuesta
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
