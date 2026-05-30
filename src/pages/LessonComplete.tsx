import { Button } from '../components/ui/Button'
import { Zap, Target, Clock } from 'lucide-react'
import Lottie from "lottie-react";

// Fix for Lottie default import issues in some environments
const LottiePlayer = (Lottie as unknown as { default: typeof Lottie }).default || Lottie;

// Import animations
import goodLessonAnimation from '../assets/good_lesson.json'
import perfectLessonAnimation from '../assets/perfect_lesson.json'
import diamond from '../assets/diamond.png'

type ViewType = "learn" | "shop" | "letters" | "practice" | "profile" | "lesson" | "lesson-complete";

interface LessonCompleteProps {
  route: {
    params: {
      perfect: boolean;
      accuracy: number;
      duration: number;
    };
  };
  navigation: {
    navigate: (view: ViewType) => void;
    restartLesson: () => void;
  };
}

const LessonComplete = ({ route, navigation }: LessonCompleteProps) => {
  const { perfect, accuracy, duration } = route.params;

  // Select animation based on performance
  const animationData = perfect ? perfectLessonAnimation : goodLessonAnimation;

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-duo-dark z-100 flex flex-col items-center justify-center p-4 text-center -mt-8">
      
      {/* Animation Container */}
      <div className="w-56 h-56 -mb-6">
        <LottiePlayer animationData={animationData} loop={true} />
      </div>

      <h1 className="text-3xl font-black text-white my-6">
        {perfect ? 'Flawless Lesson!' : 'Lesson Complete!'}
      </h1>

      <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-3xl my-6 flex-wrap">
        {/* TOTAL XP Card */}
        <div className="flex-1 rounded-xl overflow-hidden border-2 border-duo-border min-w-32 shadow-[0_4px_0_0_#37464f]">
            <div className="bg-yellow-400 p-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Total XP</h2>
            </div>
            <div className="p-6 bg-duo-dark flex items-center justify-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" />
              <span className="text-2xl font-black text-white">{perfect ? 14 : 14}</span>
            </div>
          </div>

          {/* ACCURACY Card */}
          <div className="flex-1 rounded-xl overflow-hidden border-2 border-duo-border min-w-32 shadow-[0_4px_0_0_#37464f]">
            <div className="bg-green-500 p-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Accuracy</h2>
            </div>
            <div className="p-6 bg-duo-dark flex items-center justify-center gap-3">
              <Target className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-black text-white">{accuracy}%</span>
            </div>
          </div>

          {/* TIME TAKEN Card */}
          <div className="flex-1 rounded-xl overflow-hidden border-2 border-duo-border min-w-32 shadow-[0_4px_0_0_#37464f]">
            <div className="bg-[#1cb0f6] p-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Time</h2>
            </div>
            <div className="p-6 bg-duo-dark flex items-center justify-center gap-3">
              <Clock className="w-6 h-6 text-[#1cb0f6]" />
              <span className="text-2xl font-black text-white">
                {formatDuration(duration || 0)}
              </span>
            </div>
          </div>

          {/* GEMS EARNED Card */}
          <div className="flex-1 rounded-xl overflow-hidden border-2 border-duo-border min-w-32 shadow-[0_4px_0_0_#37464f]">
            <div className="bg-duo-blue p-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gems</h2>
            </div>
            <div className="p-6 bg-duo-dark flex items-center justify-center gap-3">
              <img src={diamond} alt="Diamond" className="w-7 h-7 object-contain" />
              <span className="text-2xl font-black text-white">+{perfect ? 10 : 5}</span>
            </div>
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-duo-dark p-6 border-t-2 border-duo-border">
        <div className="max-w-sm mx-auto flex gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigation.restartLesson()}
            className="w-1/2 py-4 text-sm"
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigation.navigate("learn")}
            className="w-1/2 py-4 text-sm"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonComplete;