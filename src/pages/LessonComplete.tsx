import { Button } from '../components/ui/Button'
import { Target, Clock, Zap } from 'lucide-react'
import Lottie from "lottie-react";
import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts';
import { cn } from '../lib/utils';

// Fix for Lottie default import issues in some environments
const LottiePlayer = (Lottie as unknown as { default: typeof Lottie }).default || Lottie;

// Import animations
import goodLessonAnimation from '../assets/good_lesson.json'
import perfectLessonAnimation from '../assets/perfect_lesson.json'
import otterAnimation from '../assets/otter.json'
import diamond from '../assets/diamond.png'

type ViewType = "learn" | "shop" | "letters" | "practice" | "profile" | "lesson" | "lesson-complete";

interface LessonCompleteProps {
  route: {
    params: {
      perfect: boolean;
      accuracy: number;
      duration: number;
      lessonType?: 'review' | 'mistakes';
      xpEarned?: number;
      gemsEarned?: number;
    };
  };
  navigation: {
    navigate: (view: ViewType) => void;
    restartLesson: () => void;
  };
}

const LessonComplete = ({ route, navigation }: LessonCompleteProps) => {
  const { theme } = useTheme();
  const { perfect, accuracy, duration, lessonType, xpEarned, gemsEarned } = route.params;
  const [gems, setGems] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const targetGems = gemsEarned || (perfect ? 30 : 15);
    const targetXp = xpEarned || (perfect ? 20 : 10);

    const gemControls = animate(0, targetGems, {
      duration: 1,
      onUpdate: (value: number) => setGems(Math.round(value)),
    });

    const xpControls = animate(0, targetXp, {
      duration: 1,
      onUpdate: (value: number) => setXp(Math.round(value)),
    });

    return () => {
      gemControls.stop();
      xpControls.stop();
    };
  }, [perfect, gemsEarned, xpEarned]);

  // Select animation and messages based on lesson type
  let animationData: any = perfect ? perfectLessonAnimation : goodLessonAnimation;
  let title = perfect ? 'Flawless Lesson!' : 'Lesson Complete!';
  let subtitle = '';

  if (lessonType === 'review') {
    animationData = otterAnimation;
    title = 'Great Practice Session!';
    subtitle = 'You\'re improving every day!';
  } else if (lessonType === 'mistakes') {
    animationData = otterAnimation;
    title = 'Mistakes Cleared!';
    subtitle = 'You\'ve mastered those challenges!';
  }

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "fixed inset-0 z-100 flex flex-col items-center justify-center p-4 text-center",
      theme === 'light' ? "bg-white" : "bg-duo-dark"
    )}>
      
      {/* Animation Container */}
      <div className="w-40 h-40 md:w-56 md:h-56 -mb-4 md:-mb-6">
        <LottiePlayer animationData={animationData} loop={true} />
      </div>

      <h1 className={cn(
        "text-2xl md:text-3xl font-black my-4 md:my-6",
        theme === 'light' ? "text-[#4B4B4B]" : "text-white"
      )}>
        {title}
      </h1>

      {subtitle && (
        <p className="text-base md:text-lg text-duo-gray font-bold mb-4 md:mb-6">
          {subtitle}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 w-full max-w-md sm:max-w-3xl my-6 md:my-8">
        {/* ACCURACY Card */}
        <div className={cn(
          "rounded-xl overflow-hidden border-2 flex flex-col min-h-24 md:min-h-36",
          theme === 'light' ? "bg-white border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5]" : "bg-duo-dark border-duo-border shadow-[0_4px_0_0_#37464f]"
        )}>
            <div className="bg-green-500 py-2 md:py-3 px-2">
              <h2 className="text-[11px] md:text-sm font-bold text-white uppercase tracking-wider">Accuracy</h2>
            </div>
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              <span className={cn(
                "text-xl md:text-2xl font-black",
                theme === 'light' ? "text-[#4B4B4B]" : "text-white"
              )}>{accuracy}%</span>
            </div>
          </div>

          {/* TIME TAKEN Card */}
          <div className={cn(
            "rounded-xl overflow-hidden border-2 flex flex-col min-h-24 md:min-h-36",
            theme === 'light' ? "bg-white border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5]" : "bg-duo-dark border-duo-border shadow-[0_4px_0_0_#37464f]"
          )}>
            <div className="bg-[#1cb0f6] py-2 md:py-3 px-2">
              <h2 className="text-[11px] md:text-sm font-bold text-white uppercase tracking-wider">Time</h2>
            </div>
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#1cb0f6]" />
              <span className={cn(
                "text-xl md:text-2xl font-black",
                theme === 'light' ? "text-[#4B4B4B]" : "text-white"
              )}>
                {formatDuration(duration || 0)}
              </span>
            </div>
          </div>

          {/* GEMS EARNED Card */}
          <div className={cn(
            "rounded-xl overflow-hidden border-2 flex flex-col min-h-24 md:min-h-36",
            theme === 'light' ? "bg-white border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5]" : "bg-duo-dark border-duo-border shadow-[0_4px_0_0_#37464f]"
          )}>
            <div className="bg-duo-blue py-2 md:py-3 px-2">
              <h2 className="text-[11px] md:text-sm font-bold text-white uppercase tracking-wider">Gems</h2>
            </div>
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3">
              <img src={diamond} alt="Diamond" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
              <motion.span className={cn(
                "text-xl md:text-2xl font-black",
                theme === 'light' ? "text-[#4B4B4B]" : "text-white"
              )}>+{gems}</motion.span>
            </div>
          </div>

          {/* XP EARNED Card */}
          <div className={cn(
            "rounded-xl overflow-hidden border-2 flex flex-col min-h-24 md:min-h-36",
            theme === 'light' ? "bg-white border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5]" : "bg-duo-dark border-duo-border shadow-[0_4px_0_0_#37464f]"
          )}>
            <div className="bg-[#ffc800] py-2 md:py-3 px-2">
              <h2 className="text-[11px] md:text-sm font-bold text-white uppercase tracking-wider">XP</h2>
            </div>
            <div className="flex-1 p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3">
              <Zap className="w-6 h-6 md:w-7 md:h-7 text-[#ffc800] fill-[#ffc800]" />
              <motion.span className={cn(
                "text-xl md:text-2xl font-black",
                theme === 'light' ? "text-[#4B4B4B]" : "text-white"
              )}>+{xp}</motion.span>
            </div>
          </div>
      </div>

      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-6 border-t-2",
        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
      )}>
        <div className="max-w-sm mx-auto flex gap-4">
          {!lessonType && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigation.restartLesson()}
              className="w-1/2 py-4 text-sm"
            >
              Try Again
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigation.navigate("learn")}
            className={!lessonType ? "w-1/2 py-4 text-sm" : "w-full py-4 text-sm"}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonComplete;