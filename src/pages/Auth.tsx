import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your account has been created. You can now sign in.",
      });
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
  };

  const checkUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'moderator']);
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data && data.length > 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select Admin or User login",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      // Check if user is admin
      const isAdmin = await checkUserRole(data.user.id);
      
      // Validate selected role against actual role
      if (selectedRole === "admin" && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedRole === "user" && isAdmin) {
        toast({
          title: "Note",
          description: "You have admin privileges. Use Admin Login to access admin features.",
        });
      }
      
      toast({
        title: "Success!",
        description: isAdmin ? "Logged in as Admin" : "Logged in successfully",
      });
      
      // Redirect based on role
      if (isAdmin && selectedRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary mb-2">
            <Film className="h-8 w-8" />
            <span>Movie Emotion Tracker</span>
          </div>
          <p className="text-muted-foreground">Track and share your cinematic journey</p>
        </div>

        <Card className="border-border bg-card/95 backdrop-blur shadow-card">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Card 
                    className={`border-2 cursor-pointer transition-all ${
                      selectedRole === "admin" 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-secondary/50 hover:bg-secondary/70"
                    }`}
                    onClick={() => setSelectedRole("admin")}
                  >
                    <CardContent className="p-4 text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">Admin Login</p>
                      <p className="text-xs text-muted-foreground mt-1">Access admin dashboard</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`border-2 cursor-pointer transition-all ${
                      selectedRole === "user" 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-secondary/50 hover:bg-secondary/70"
                    }`}
                    onClick={() => setSelectedRole("user")}
                  >
                    <CardContent className="p-4 text-center">
                      <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-semibold">User Login</p>
                      <p className="text-xs text-muted-foreground mt-1">Access your account</p>
                    </CardContent>
                  </Card>
                </div>
                {selectedRole ? (
                  <p className="text-xs text-primary text-center mb-4 font-medium">
                    Logging in as {selectedRole === "admin" ? "Admin" : "User"}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Select admin or user login above
                  </p>
                )}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name (optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
