'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { LessonNode, ExerciseItem } from '@/lib/types';
import { ProgressBar } from '@/components/map/ProgressBar';
import { RewardSplash } from '@/components/gamification/RewardSplash';
import { AudioRecorder } from '@/components/voice/AudioRecorder';
import { PhonemeFeedback } from '@/components/voice/PhonemeFeedback';
import { useAudioEffects } from '@/hooks/useAudioEffects';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.nodeId as string;
  const { playSuccess, playError, playLevelUp, playClick, speakText } = useAudioEffects();

  const [nodeData, setNodeData] = useState<LessonNode | null>(null);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTheory, setShowTheory] = useState(true);

  // Current exercise state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [arrangedTokens, setArrangedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [spokenText, setSpokenText] = useState('');
  const [writtenText, setWrittenText] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(120 * 60); // 2 hours in seconds
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
        setNodeData(node);
        const exList = node.content_payload?.exercises || [];
        setExercises(exList);
        if (exList[0]?.tokens_to_arrange) {
          setAvailableTokens([...exList[0].tokens_to_arrange]);
        }
      } catch {
        // Fallback demo exercises
        const fallbackNode: LessonNode = {
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
            summary: "En inglés, a diferencia del español, todas las oraciones (excepto imperativos) requieren un sujeto explícito. No podemos omitir el pronombre, incluso cuando nos referimos a cosas abstractas o climas.",
            grammar_focus: "Contrastive SLA: Uso obligatorio del pronombre 'It'. Por ejemplo: 'Es importante' -> 'It is important', NUNCA 'Is important'.",
            exercises: []
          }
        };
        setNodeData(fallbackNode);
        const demoExercises: ExerciseItem[] = [
          {
            id: 'ex_1',
            type: 'reading_comprehension',
            prompt_en: 'Read the following passage and select the true statement:',
            passage_text: 'In macroeconomics, a central bank is an institution that manages the currency and monetary policy of a state or formal monetary union. When a central bank wishes to stimulate the economy, it typically lowers interest rates to encourage borrowing and investment. Conversely, to combat high inflation, it may raise interest rates. This mechanism directly affects the cost of capital for businesses and the yield on savings for households. Understanding this relationship is critical for any financial analyst.',
            options: [
              'Central banks raise interest rates to encourage borrowing and investment.',
              'Lowering interest rates is a common strategy to stimulate economic growth.',
              'The cost of capital is unaffected by central bank monetary policies.',
              'Central banks do not manage the currency of a state.'
            ],
            correct_answer: 'Lowering interest rates is a common strategy to stimulate economic growth.',
            contrastive_note_es: 'Nota que "interest rates" se traduce como "tasas de interés". Es común omitir el artículo en inglés al hablar en plural de forma general.'
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
            contrastive_note_es: 'En español el sujeto suele ser tácito ("Es importante"), pero en inglés "It" es obligatorio como pronombre sujeto explícito.'
          },
          {
            id: 'ex_3',
            type: 'sentence_builder',
            prompt_es: 'Ordena las palabras para formar: "La inflación es un riesgo grave."',
            prompt_en: 'Arrange the tokens in order:',
            tokens_to_arrange: ['Inflation', 'is', 'a', 'serious', 'risk'],
            correct_answer: 'Inflation is a serious risk',
            contrastive_note_es: 'Recuerda que en conceptos abstractos generales como "Inflación", en inglés NO se usa el artículo "The" (No es "The inflation").'
          },
          {
            id: 'ex_4',
            type: 'listening_comprehension',
            prompt_en: 'Listen to the audio and select the word that completes the sentence correctly:',
            audio_script: 'The recent quarter showed a significant decline in consumer spending due to the sudden spike in commodity prices.',
            options: [
              'commodity',
              'accommodation',
              'community',
              'comedy'
            ],
            correct_answer: 'commodity',
            contrastive_note_es: '"Commodity" se refiere a materias primas o productos básicos. Suena similar a "community", asegúrate de diferenciar la /ɒ/ y la /uː/.'
          },
          {
            id: 'ex_5',
            type: 'voice_repetition',
            prompt_en: 'Pronounce the following sentence clearly:',
            correct_answer: 'The economic forecast depends on fiscal policy.',
            contrastive_note_es: 'Asegúrate de unir las palabras (linking): "depends on" suena como /dɪˈpendzɒn/.'
          },
          {
            id: 'ex_6',
            type: 'multiple_choice',
            prompt_en: 'The economic forecast depends _______ fiscal policy.',
            options: ['of', 'on', 'in', 'from'],
            correct_answer: 'on',
            contrastive_note_es: 'En inglés el verbo es "depend ON", nunca "depend of". Es un error de régimen preposicional común en hispanohablantes.'
          },
          {
            id: 'ex_7',
            type: 'reading_comprehension',
            prompt_en: 'Analyze the short text and identify the tone:',
            passage_text: 'While the short-term gains are undeniable, the long-term structural deficit poses an existential threat to sovereign solvency if current fiscal expansion continues unabated.',
            options: [
              'Highly optimistic and encouraging',
              'Neutral and purely descriptive',
              'Cautious and cautionary',
              'Dismissive and arrogant'
            ],
            correct_answer: 'Cautious and cautionary',
            contrastive_note_es: 'Vocabulario clave: "poses a threat" (representa una amenaza). "Unabated" (sin disminuir).'
          },
          {
            id: 'ex_8',
            type: 'sentence_builder',
            prompt_en: 'Build the sentence: "Estamos interesados en expandirnos a Europa."',
            prompt_es: 'Ordena las palabras:',
            tokens_to_arrange: ['expanding', 'are', 'We', 'interested', 'in', 'to Europe'],
            correct_answer: 'We are interested in expanding to Europe',
            contrastive_note_es: 'Después de una preposición ("in"), el siguiente verbo siempre va en gerundio (-ing): "interested in expandING".'
          },
          {
            id: 'ex_9',
            type: 'open_writing',
            prompt_en: 'Write a short sentence (at least 25 characters) summarizing why lowering interest rates stimulates the economy. You must include the word "borrowing".',
            correct_answer: 'borrowing', // Keyword validation
            contrastive_note_es: 'Concéntrate en la sintaxis Sujeto + Verbo + Objeto. Ejemplo esperado: "Lower interest rates make borrowing cheaper."'
          }
        ];
        
        // Multiply payload to simulate a massive 2-hour intensive session (90 exercises)
        const massivePayload = Array(10).fill(demoExercises).flat().map((ex, i) => ({
          ...ex,
          id: `${ex.id}_loop_${i}`
        }));

        setExercises(massivePayload);
        setAvailableTokens([...(massivePayload[0].tokens_to_arrange || [])]);
      }
    }
    loadNode();
  }, [nodeId]);

  const currentExercise = exercises[currentIndex];

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
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'chart_interpretation' || currentExercise.type === 'reading_comprehension' || currentExercise.type === 'listening_comprehension') {
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
      } catch (err) {
        console.error("Voice eval error", err);
        correct = userAns.trim().toLowerCase() === currentExercise.correct_answer.trim().toLowerCase();
      }
    } else if (currentExercise.type === 'open_writing') {
      // Basic mock evaluation for writing
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
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('fsrs_pending_errors');
          const pending = stored ? JSON.parse(stored) : [];
          // Avoid duplicates
          if (!pending.find((e: any) => e.id === currentExercise.id)) {
            pending.push(currentExercise);
            localStorage.setItem('fsrs_pending_errors', JSON.stringify(pending));
          }
        } catch (e) {
          console.error("Failed to save fsrs error", e);
        }
      }
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
          xp_earned: nodeData?.xp_reward || 20,
          correct_count: exercises.length,
          total_count: exercises.length,
          status: 'mastered',
        });
      }
      
      // Unlock progression
      if (typeof window !== 'undefined') {
        localStorage.setItem(`completed_${nodeId}`, 'true');
      }

      setIsFinished(true);
      setShowReward(true);
      playLevelUp();
    }
  };

  if (!nodeData || exercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-primary-400 font-bold animate-pulse">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading Interactive Drill...</span>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl bg-white border border-gray-200-card border border-primary-500/40 shadow-2xl space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-accent-emerald to-teal-400 flex items-center justify-center text-white shadow-xl shadow-accent-emerald/40 animate-bounce-slight">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <h2 className="text-3xl font-black text-white">Lesson Completed!</h2>
          <p className="text-sm text-gray-700">
            You achieved {resultData?.score_percentage || 100}% accuracy on this drill.
          </p>

          <div className="flex justify-center gap-4 py-3">
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 block">XP Earned</span>
              <span className="text-2xl font-black text-gamify-xp">
                +{resultData?.xp_earned || nodeData.xp_reward} XP
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 block">Accuracy</span>
              <span className="text-2xl font-black text-accent-cyan">
                {resultData?.score_percentage || 100}%
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/learn')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-emerald hover:opacity-95 text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all"
          >
            Return to Skill Tree
          </button>
        </motion.div>

        <RewardSplash
          show={showReward}
          xpAmount={resultData?.xp_earned || nodeData.xp_reward}
          title="Drill Mastered!"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Lesson Header with Close, Progress Bar & Hearts */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            playClick();
            router.push('/learn');
          }}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <ProgressBar current={currentIndex + 1} total={exercises.length} />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-gray-200 border border-gray-200 text-gray-700 font-mono text-xs shrink-0 shadow-inner">
          <Clock className="w-4 h-4 text-accent-cyan" />
          <span>
            {Math.floor(sessionTimeLeft / 3600)}h {Math.floor((sessionTimeLeft % 3600) / 60)}m
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 font-black text-xs shrink-0">
          <span className="text-rose-500 text-base leading-none">❤️</span>
          <span>5</span>
        </div>
      </div>

      {showTheory ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white border border-gray-200-card border border-primary-500/30 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent-cyan uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Instrucción Pedagógica (SLA)</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {nodeData.title}
            </h2>
          </div>

          <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-200 border border-gray-200 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                {nodeData.content_payload?.summary || "En esta lección aprenderás conceptos esenciales de gramática y vocabulario."}
              </p>
              <button
                onClick={() => speakText(nodeData.content_payload?.summary || "En esta lección aprenderás conceptos esenciales de gramática y vocabulario.")}
                className="p-2.5 rounded-xl bg-primary-600/20 text-primary-400 hover:bg-primary-600/40 transition-colors shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {nodeData.content_payload?.grammar_focus && (
              <div className="pt-4 border-t border-gray-200">
                <span className="text-xs font-bold text-accent-cyan block mb-2">Enfoque SLA (Contraste L1/L2):</span>
                <p className="text-xs text-gray-500 italic">
                  💡 {nodeData.content_payload.grammar_focus}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              playClick();
              setShowTheory(false);
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Comenzar Práctica</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Drill Question Card */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200-card border border-surface-raised shadow-2xl space-y-6">
        <div>
          {currentExercise.prompt_es && (
            <p className="text-xs font-semibold text-accent-cyan mb-1 italic">
              💡 {currentExercise.prompt_es}
            </p>
          )}
          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
            {currentExercise.prompt_en}
          </h2>
        </div>

        {/* 1. Multiple Choice Options (Includes Reading and Listening) */}
        {(currentExercise.type === 'multiple_choice' ||
          currentExercise.type === 'chart_interpretation' ||
          currentExercise.type === 'reading_comprehension' ||
          currentExercise.type === 'listening_comprehension') &&
          currentExercise.options && (
            <div className="space-y-6">
              {currentExercise.type === 'reading_comprehension' && currentExercise.passage_text && (
                <div className="p-5 bg-white border border-gray-200 rounded-2xl border border-gray-200 max-h-64 overflow-y-auto shadow-inner">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentExercise.passage_text}
                  </p>
                </div>
              )}
              {currentExercise.type === 'listening_comprehension' && currentExercise.audio_script && (
                <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl border border-gray-200 gap-4 shadow-inner">
                  <button
                    onClick={() => speakText(currentExercise.audio_script!)}
                    className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Volume2 className="w-10 h-10" />
                  </button>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Play Audio Passage</p>
                </div>
              )}
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
                    className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-600/25 border-primary-500 text-white shadow-lg shadow-primary-600/20'
                        : 'bg-white shadow-sm border border-gray-200 border-gray-200 hover:border-gray-300 text-gray-800'
                    }`}
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(opt);
                      }}
                      className="p-1 rounded-lg hover:bg-white border border-gray-200 text-gray-500 hover:text-white"
                      title="Hear audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Sentence Builder Tokens */}
        {currentExercise.type === 'sentence_builder' && (
          <div className="space-y-6">
            {/* Target arrangement line */}
            <div className="min-h-[60px] p-3 rounded-2xl bg-white border border-gray-200 border-2 border-dashed border-gray-200 flex flex-wrap items-center gap-2">
              {arrangedTokens.map((t, i) => (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => handleTokenClick(t, true)}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Available tokens pool */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {availableTokens.map((t, i) => (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => handleTokenClick(t, false)}
                  className="px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-200 border border-gray-300 hover:border-slate-400 text-gray-800 font-bold text-xs sm:text-sm shadow"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Voice Repetition */}
        {currentExercise.type === 'voice_repetition' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center gap-3">
              <button
                onClick={() => speakText(currentExercise.correct_answer)}
                className="p-2 rounded-xl bg-primary-600 text-white"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <span className="text-base font-extrabold text-white">
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

        {/* 4. Open Writing */}
        {currentExercise.type === 'open_writing' && (
          <div className="space-y-4">
            <textarea
              disabled={isAnswerChecked}
              value={writtenText}
              onChange={(e) => setWrittenText(e.target.value)}
              placeholder="Type your detailed response here..."
              className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl border border-gray-200 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors resize-none text-sm shadow-inner"
            />
            <p className="text-xs text-gray-400 text-right font-mono">
              {writtenText.length} / 25 min chars
            </p>
          </div>
        )}
      </div>

      {/* Answer Feedback Banner (Bottom Sheet) */}
      <AnimatePresence>
        {isAnswerChecked && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`p-6 rounded-3xl border shadow-2xl space-y-3 ${
              isCorrect
                ? 'bg-accent-emerald/15 border-accent-emerald/40 text-emerald-100'
                : 'bg-accent-rose/15 border-accent-rose/40 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isCorrect ? (
                  <Check className="w-6 h-6 text-accent-emerald stroke-[3]" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-accent-rose" />
                )}
                <span className="text-lg font-black">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-700">
                {isCorrect ? '+XP Earned' : `Correct: "${currentExercise.correct_answer}"`}
              </span>
            </div>

            {/* Spanish L1 Linguistic Contrast Note */}
            {currentExercise.contrastive_note_es && (
              <div className="p-3.5 rounded-2xl bg-white border border-gray-200 border border-gray-200 text-xs text-gray-800 space-y-1">
                <span className="font-bold text-accent-cyan flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Explicación de Lingüística de Contraste:</span>
                </span>
                <p className="leading-relaxed">{currentExercise.contrastive_note_es}</p>
              </div>
            )}

            {/* Phonetic Deep Feedback for Voice Exercises */}
            {currentExercise.type === 'voice_repetition' && (
              <div className="pt-2">
                <PhonemeFeedback
                  accuracy={voiceEvalResult?.overall_accuracy ?? (isCorrect ? 92 : 45)}
                  wpm={voiceEvalResult?.fluency_wpm ?? (isCorrect ? 130 : 60)}
                  phonemes={voiceEvalResult?.phoneme_breakdown ?? [
                    { phoneme: 'target', ipa: '/ˈtɑːrɡɪt/', score: isCorrect ? 0.95 : 0.4 },
                    { phoneme: 'words', ipa: '/wɜːrdz/', score: isCorrect ? 0.88 : 0.3 }
                  ]}
                  alerts={voiceEvalResult?.l1_interference_alerts ?? (!isCorrect ? ['Se detectó un ritmo de sílaba español (staccato). Intenta usar ritmo acentual (stress-timed).'] : [])}
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-lg active:scale-95 transition-all ${
                  isCorrect
                    ? 'bg-accent-emerald hover:bg-emerald-400 shadow-accent-emerald/30'
                    : 'bg-accent-rose hover:bg-rose-400 shadow-accent-rose/30'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check Answer Button (Before Checking) */}
      {!isAnswerChecked && currentExercise.type !== 'voice_repetition' && (
        <div className="flex justify-end">
          <button
            onClick={() => handleCheckAnswer()}
            disabled={
              isAnswerChecked || 
              (currentExercise.type === 'multiple_choice' && !selectedOption) ||
              (currentExercise.type === 'sentence_builder' && arrangedTokens.length === 0) ||
              (currentExercise.type === 'open_writing' && writtenText.trim().length === 0) ||
              (currentExercise.type !== 'multiple_choice' && currentExercise.type !== 'sentence_builder' && currentExercise.type !== 'open_writing' && !selectedOption && arrangedTokens.length === 0)
            }
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 text-white font-extrabold text-sm shadow-lg shadow-primary-600/30 active:scale-95 disabled:opacity-40 transition-all"
          >
            Check Answer
          </button>
        </div>
      )}
      
      </>
      )}
    </div>
  );
}
