import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { RoleLabels, RoleDashboardPaths } from "@contracts/constants";

export default function Login() {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: (data) => {
      const dashboardPath = RoleDashboardPaths[data.user.role];
      if (dashboardPath) {
        navigate(dashboardPath);
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const roleLabel = role ? RoleLabels[role] || "Staff" : "Staff";
  const expectedRole = role || undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({
      username: username.trim(),
      password,
      expectedRole,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d00] via-[#006600] to-[#003300] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#004d00] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{roleLabel} Login</h2>
          <p className="text-gray-600 mt-1">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-1"
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#004d00] hover:bg-[#003300] text-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
