"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from "@sparc/ui";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage(): JSX.Element | null {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register } = useAuth();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await register(email, username, password);
      toast.success("Welcome to SPARC!", {
        description: "Your account has been created successfully.",
      });
    } catch {
      toast.error("Registration failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1" className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join the adventure and forge your legend</CardDescription>
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
            label="Username"
            type="text"
            placeholder="legendary_hero"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            helperText="This will be your display name"
            disabled={isSubmitting}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            helperText="Minimum 8 characters"
            disabled={isSubmitting}
          />
          
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />
          
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input 
              type="checkbox" 
              className="mt-1 rounded border-surface-divider" 
              required
            />
            <span>
              I agree to the{" "}
              <a href="#" className="text-bronze hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-bronze hover:underline">Privacy Policy</a>
            </span>
          </label>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            loading={isSubmitting}
          >
            Create Account
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-bronze hover:underline" prefetch={false}>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
