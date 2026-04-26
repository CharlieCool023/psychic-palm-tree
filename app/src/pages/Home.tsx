import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Users, ChevronRight, ChevronLeft, Building2, GraduationCap, Swords } from "lucide-react";

type Step = "splash" | "step1" | "step2" | "step3";

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("splash");

  useEffect(() => {
    const timer = setTimeout(() => setStep("step1"), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d00] via-[#006600] to-[#003300] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/20 flex items-center justify-center"
            >
              <Shield className="w-16 h-16 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">NYSC</h1>
            <p className="text-white/80 text-lg">Camp Evaluation System</p>
            <motion.div
              className="mt-8 w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden"
            >
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2 }}
              />
            </motion.div>
          </motion.div>
        )}

        {step === "step1" && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#004d00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
              <p className="text-gray-600 mt-1">Select your role to continue</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/register")}
                className="w-full h-14 text-lg bg-[#004d00] hover:bg-[#003300] justify-between"
              >
                <span className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  Yes, I am a Corps Member
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setStep("step2")}
                variant="outline"
                className="w-full h-14 text-lg justify-between border-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" />
                  No, I am Staff
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "step2" && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Staff Login</h2>
              <p className="text-gray-600 mt-1">Select your position</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login/platoon-instructor")}
                variant="outline"
                className="w-full h-12 justify-between border-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" />
                  Platoon Instructor
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => navigate("/login/man-o-war")}
                variant="outline"
                className="w-full h-12 justify-between border-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <Swords className="w-5 h-5" />
                  Man O'War Instructor
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => navigate("/login/soldier")}
                variant="outline"
                className="w-full h-12 justify-between border-gray-300 hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Soldier
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setStep("step3")}
                variant="ghost"
                className="w-full h-12 justify-center text-gray-500"
              >
                None of the above
              </Button>
            </div>

            <Button
              onClick={() => setStep("step1")}
              variant="ghost"
              className="w-full mt-4 text-gray-500"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>
        )}

        {step === "step3" && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Command Access</h2>
              <p className="text-gray-600 mt-1">Are you the Camp Commandant?</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login/commandant")}
                className="w-full h-14 text-lg bg-[#004d00] hover:bg-[#003300] justify-between"
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  Yes, I am the Camp Commandant
                </span>
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setStep("step1")}
                variant="outline"
                className="w-full h-12 justify-center border-gray-300"
              >
                No, Return to Home
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => navigate("/login/super-admin")}
                variant="ghost"
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                Super Admin Access
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
