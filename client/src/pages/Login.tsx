import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users2, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center px-6 lg:px-20 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 text-primary mb-4">
              <Users2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900">
              Chanuka Deaf Women Group
            </h1>
            <p className="text-muted-foreground text-lg">
              Sign in to manage users and GBV reports.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium btn-primary"
              disabled={loading}
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
          </form>

          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>Protected system. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Decoration */}
      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-slate-900/90 z-10" />
        {/* Abstract shapes or a nice Unsplash image */}
        {/* helping hands community support */}
        <img 
          src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop"
          alt="Community Support"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-20 flex flex-col justify-end h-full p-16 text-white">
          <h2 className="text-4xl font-display font-bold mb-4">Empowering the Voice of the Community</h2>
          <p className="text-lg text-slate-300 max-w-xl">
            Securely manage reporting, track cases, and ensure timely interventions for those in need.
          </p>
        </div>
      </div>
    </div>
  );
}
