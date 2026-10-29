"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2, UserPlus, Mail, Lock, User, AlertCircle,
  UserCog, GraduationCap, School, KeyRound, BookOpen, Eye, EyeOff
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type UserRole } from "@/app/constants"
import { cn } from "@/lib/utils"
import {
  SCHOOL_LIST, CLASS_OPTIONS, SECTION_OPTIONS,
  getTierFromClass, getTierLabel, getTierEmoji,
} from "@/lib/school-codes"
import { SurakshaLogo } from "@/components/brand/suraksha-logo"

const roleOptions = [
  {
    value: "Teacher" as UserRole,
    label: "Teacher",
    icon: <User className="size-5 text-blue-500" />,
    description: "Run drills & manage training",
    activeColor: "ring-2 ring-blue-400 border-blue-300 bg-blue-50",
  },
  {
    value: "Student" as UserRole,
    label: "Student",
    icon: <GraduationCap className="size-5 text-emerald-500" />,
    description: "Learn safety & earn XP",
    activeColor: "ring-2 ring-emerald-400 border-emerald-300 bg-emerald-50",
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole | "">("")
  const [schoolId, setSchoolId] = useState("")
  const [classNum, setClassNum] = useState("")
  const [section, setSection] = useState("")
  const [schoolCode, setSchoolCode] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!email || !email.includes('@')) { setIsAdmin(false); return }
      try {
        const res = await fetch('/api/check-admin-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await res.json()
        setIsAdmin(!!data.isAdmin)
      } catch { setIsAdmin(false) }
    }
    const t = setTimeout(checkAdmin, 500)
    return () => clearTimeout(t)
  }, [email])

  const selectedClass = classNum ? parseInt(classNum) : null
  const tier = selectedClass ? getTierFromClass(selectedClass) : null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) { setError("Passwords do not match."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (!role && !isAdmin) { setError("Please select a role."); return }
    if (!schoolId && !isAdmin) { setError("Please select your school."); return }
    if (!classNum && !isAdmin) { setError("Please select your class."); return }
    if (!section && !isAdmin) { setError("Please select your section."); return }
    if (!schoolCode && !isAdmin) { setError("Please enter your school verification code."); return }
    if (!isAdmin && role === "Student" && parentPhone.length !== 10) {
      setError("Mobile number must be exactly 10 digits."); return
    }

    setLoading(true)
    try {
      const selectedSchool = SCHOOL_LIST.find(s => s.id === schoolId)
      const finalRole = isAdmin ? "Administrator" as UserRole : role as UserRole
      await signup({
        email, password, displayName: name, role: finalRole,
        schoolId: isAdmin ? "admin-system" : schoolId,
        schoolName: isAdmin ? "System Admin" : (selectedSchool?.name || ""),
        classNum: isAdmin ? 0 : parseInt(classNum),
        section: isAdmin ? "N/A" : section,
        schoolCode: isAdmin ? "" : schoolCode,
        parentPhone: isAdmin ? "" : parentPhone,
      })
      router.push("/")
    } catch (err: any) {
      const code = err?.code || ""
      if (code === "auth/email-already-in-use") setError("An account with this email already exists.")
      else if (code === "auth/weak-password") setError("Password too weak. Use at least 6 characters.")
      else if (code === "auth/invalid-email") setError("Invalid email address.")
      else if (err?.message) setError(err.message)
      else setError("Signup failed. Please try again.")
    } finally { setLoading(false) }
  }

  const inputCls = "w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-6">
        <SurakshaLogo className="size-9" />
        <div>
          <h1 className="font-headline text-base font-bold tracking-wide text-gray-900">Suraksha</h1>
          <p className="text-[10px] text-gray-400 leading-tight">Disaster Preparedness</p>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-headline font-bold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-500 mt-0.5">Join your school&apos;s safety program</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
            <input id="name" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-2 mt-1.5 bg-purple-50 border border-purple-200 rounded-xl">
              <UserCog className="size-3.5 text-purple-500" />
              <p className="text-[11px] text-purple-600 font-medium">Admin detected — Administrator role assigned</p>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
              <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={cn(inputCls, "pr-10")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Confirm</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
              <input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Role */}
        {!isAdmin && (
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                  className={cn("p-2.5 rounded-xl border-2 text-left transition-all duration-200", role === opt.value ? opt.activeColor : "border-gray-200 hover:border-gray-300")}>
                  <div className="flex items-center gap-2 mb-0.5">{opt.icon}<span className="font-semibold text-sm text-gray-800">{opt.label}</span></div>
                  <p className="text-[10px] text-gray-400">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* School */}
        {!isAdmin && (
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 block"><School className="size-3" /> School</label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-800"><SelectValue placeholder="Choose your school" /></SelectTrigger>
              <SelectContent>{SCHOOL_LIST.map(s => (<SelectItem key={s.id} value={s.id}><span>{s.name}</span><span className="text-[10px] text-gray-400 ml-1">{s.region}</span></SelectItem>))}</SelectContent>
            </Select>
          </div>
        )}

        {/* Class & Section */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 block"><BookOpen className="size-3" /> Class</label>
              <Select value={classNum} onValueChange={setClassNum}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-800"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>{CLASS_OPTIONS.map(c => (<SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Section</label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-800"><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>{SECTION_OPTIONS.map(s => (<SelectItem key={s} value={s}>Section {s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tier badge */}
        {!isAdmin && tier && (
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium",
            tier === "primary" ? "bg-green-50 border-green-200 text-green-600" : "bg-blue-50 border-blue-200 text-blue-600")}>
            <span>{getTierEmoji(tier)}</span><span>{getTierLabel(tier)} Tier</span>
            <span className="text-gray-400 font-normal ml-auto text-[10px]">{tier === "primary" ? "Visual & story-based" : "Technical & protocol-based"}</span>
          </div>
        )}

        {/* Parent Phone */}
        {!isAdmin && role === "Student" && (
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">📱 Parent Mobile (SMS)</label>
            <input id="parentPhone" type="tel" placeholder="9876543210" value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required maxLength={10} pattern="[0-9]{10}"
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 font-mono placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all" />
          </div>
        )}

        {/* School Code */}
        {!isAdmin && (
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1 block"><KeyRound className="size-3" /> School Code</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
              <input id="schoolCode" type="text" placeholder="Enter code from school" value={schoolCode} onChange={e => setSchoolCode(e.target.value)} required className={cn(inputCls, "uppercase tracking-wider font-mono")} />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 pl-1">Ask your school admin for this code</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-400/25 transition-all duration-200 hover:shadow-orange-400/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Create Account
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
