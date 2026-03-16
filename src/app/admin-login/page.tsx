"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Key, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const clerk = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const DUMMY_EMAIL = "admin@rental.com";
  const DUMMY_PASS = "admin1234";

  const handleAutofill = () => {
    setEmail(DUMMY_EMAIL);
    setPassword(DUMMY_PASS);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerk.client) return;

    setLoading(true);
    try {
      // Use the lower level client API which is more stable across hook changes
      const signInAttempt = await clerk.client.signIn.create({
        identifier: email,
        password: password,
      });

      if (signInAttempt.status === "complete") {
        await clerk.setActive({ session: signInAttempt.createdSessionId });
        toast.success("Welcome back, Admin!");
        router.push("/admin");
      } else {
        console.error("Sign in status:", signInAttempt.status);
        toast.error("Further steps required: " + signInAttempt.status);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const msg = err.errors?.[0]?.message || "Invalid credentials or setup";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Sign in to manage listings and conversations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@rental.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo Setup</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                <ShieldAlert className="h-3 w-3 inline mr-1 text-primary" />
                Use these demo credentials
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-1.5 bg-background rounded border font-mono truncate">{DUMMY_EMAIL}</div>
                <div className="p-1.5 bg-background rounded border font-mono">{DUMMY_PASS}</div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-8"
                onClick={handleAutofill}
              >
                Autofill Admin Credentials
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
