"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Building2, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-lg overflow-hidden flex items-center justify-center p-1.5">
            <img src="/logo.png" alt="PROTIME Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-white text-2xl font-bold tracking-tight">PROTIME</span>
            <p className="text-indigo-300 text-xs font-medium tracking-wide">Office Management</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              PROTIME<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Workspace
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Your central hub for tracking projects, attendance, and tasks.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-600 text-sm">PROTIME Internal System</p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm overflow-hidden flex items-center justify-center p-1">
              <img src="/logo.png" alt="PROTIME" className="w-full h-full object-contain" />
            </div>
            <span className="text-slate-800 text-xl font-bold tracking-tight">PROTIME</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500">Sign in to your workspace to continue.</p>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-medium animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {state.error}
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@protime.in"
                  className="pl-10 bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 bg-white border-slate-300 text-slate-900 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all duration-200 hover:shadow-md hover:shadow-indigo-200 group"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to Workspace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
