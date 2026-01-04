import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back",
        description: "Successfully logged in to the admin dashboard.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Enter your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for the reset email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop"
          alt="Community Support"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
      </div>

      {/* Left Side – Login */}
      <div className="relative z-10 flex items-center justify-center px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Glass Card */}
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 lg:p-10">
            
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <img
                src="/logo.png"
                alt="Chanuka Deaf Women Group"
                className="h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Chanuka Deaf Women Group
              </h1>
              <p className="text-slate-200 mt-2">
                Secure Admin Access Portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-100 font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="admin@example.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/20 border-white/30 text-white placeholder:text-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-100 font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-amber-300 hover:text-amber-400 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/20 border-white/30 text-white pr-10 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Footer + Support Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-8 text-center space-y-3"
            >
              {/* Support contacts */}
              <div className="text-sm text-slate-100 space-y-1">
                <p className="font-semibold text-amber-300">Need Help?</p>
                <p>Gender Desk Officer - Kondele Police Station: <span className="text-amber-200 font-medium">Rachael 0700729559</span></p>
                <p>JOOTRH GBVRC - Anastasia: <span className="text-amber-200 font-medium">0722359942</span></p>
              </div>

              {/* System notice */}
              <p className="text-xs text-slate-300">Protected system. Unauthorized access prohibited.</p>
              <p className="text-xs text-slate-300 opacity-80">Powered & Built by: NexxaCraft</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side – Text */}
      <div className="relative z-10 hidden lg:flex flex-col justify-end p-16 text-white">
        <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
          Empowering Community Voices
        </h2>
        <p className="text-lg text-slate-200 max-w-xl">
          Securely manage reports, users, and sensitive data with confidence
          and accountability.
        </p>
      </div>
    </div>
  );
}
