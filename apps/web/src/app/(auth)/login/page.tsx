"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from "@sparc/ui";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage(): JSX.Element | null {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  
  const { login } = useAuth();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!", {
        description: "You have been signed in successfully.",
      });
    } catch {
      toast.error("Sign in failed", {
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1" className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue your adventure</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="hero@sparc.rpg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isSubmitting}
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="rounded border-surface-divider" />
              Remember me
            </label>
            <a href="#" className="text-bronze hover:underline">
              Forgot password?
            </a>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            loading={isSubmitting}
          >
            Sign In
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-bronze hover:underline" prefetch={false}>
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
