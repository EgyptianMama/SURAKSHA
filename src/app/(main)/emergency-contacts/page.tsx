"use client"

import { Button } from "@/components/ui/button"
import { Phone, Copy, Siren, Heart, Flame, Users, Building, CheckCircle, Eye, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { getSchoolContacts, SCHOOL_CONTACTS_DATA, type SchoolContact } from "@/lib/school-contacts-data"

type Contact = {
  name: string
  number: string
  description: string
  icon: React.ReactNode
  iconBg: string
  tagColor: string
}

const nationalHelplines: Contact[] = [
  {
    name: "Police Helpline",
    number: "100",
    description: "For any crime, security or law & order emergency",
    icon: <ShieldCheck className="size-6 text-blue-600" />,
    iconBg: "bg-blue-50 border border-blue-100",
    tagColor: "bg-blue-50 text-blue-700",
  },
  {
    name: "Fire Brigade",
    number: "101",
    description: "Fire outbreak & hazardous emergency response",
    icon: <Flame className="size-6 text-rose-600" />,
    iconBg: "bg-rose-50 border border-rose-100",
    tagColor: "bg-rose-50 text-rose-700",
  },
  {
    name: "Ambulance & Medical",
    number: "108",
    description: "Emergency medical assistance & ambulance transit",
    icon: <Heart className="size-6 text-emerald-600" />,
    iconBg: "bg-emerald-50 border border-emerald-100",
    tagColor: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "NDMA Helpline",
    number: "1078",
    description: "National Disaster Management Authority Control",
    icon: <Siren className="size-6 text-orange-600" />,
    iconBg: "bg-orange-50 border border-orange-100",
    tagColor: "bg-orange-50 text-orange-700",
  },
  {
    name: "Women Helpline",
    number: "1091",
    description: "24/7 assistance for women in distress or danger",
    icon: <Users className="size-6 text-purple-600" />,
    iconBg: "bg-purple-50 border border-purple-100",
    tagColor: "bg-purple-50 text-purple-700",
  },
  {
    name: "Child Helpline",
    number: "1098",
    description: "Emergency care, protection & rescue for children",
    icon: <Users className="size-6 text-pink-600" />,
    iconBg: "bg-pink-50 border border-pink-100",
    tagColor: "bg-pink-50 text-pink-700",
  },
  {
    name: "State Disaster (SDMA)",
    number: "1070",
    description: "State level disaster management control room",
    icon: <Building className="size-6 text-amber-600" />,
    iconBg: "bg-amber-50 border border-amber-100",
    tagColor: "bg-amber-50 text-amber-700",
  },
  {
    name: "Unified Emergency",
    number: "112",
    description: "Single pan-India emergency number for all services",
    icon: <Phone className="size-6 text-cyan-600" />,
    iconBg: "bg-cyan-50 border border-cyan-100",
    tagColor: "bg-cyan-50 text-cyan-700 font-bold",
  },
]

function ContactCard({ contact, isSchoolContact = false }: { contact: Contact; isSchoolContact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(!isSchoolContact)

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.number)
    setRevealed(true)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskedNumber = contact.number.replace(/\d(?=\d{4})/g, "•")

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/90 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {/* Squircle Icon */}
        <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", contact.iconBg)}>
          {contact.icon}
        </div>

        {/* Text details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-sm text-slate-800 truncate">{contact.name}</h3>
          </div>
          <p className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight mt-0.5 font-mono">
            {revealed ? contact.number : maskedNumber}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{contact.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {isSchoolContact && !revealed && (
          <Button
            onClick={() => setRevealed(true)}
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-9 rounded-2xl text-slate-600 hover:bg-slate-100"
          >
            <Eye className="size-3.5" /> Show
          </Button>
        )}
        <Button
          onClick={handleCopy}
          size="sm"
          className={cn(
            "h-9 rounded-2xl font-bold text-xs px-4 gap-1.5 transition-all shadow-sm",
            copied
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          {copied ? <CheckCircle className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  )
}

function formatSchoolContact(sc: SchoolContact): Contact {
  if (sc.role === "nurse") {
    return {
      name: sc.name,
      number: sc.number,
      description: sc.description,
      icon: <Heart className="size-6 text-emerald-600" />,
      iconBg: "bg-emerald-50 border border-emerald-100",
      tagColor: "bg-emerald-50 text-emerald-700",
    }
  }
  if (sc.role === "security") {
    return {
      name: sc.name,
      number: sc.number,
      description: sc.description,
      icon: <ShieldCheck className="size-6 text-blue-600" />,
      iconBg: "bg-blue-50 border border-blue-100",
      tagColor: "bg-blue-50 text-blue-700",
    }
  }
  return {
    name: sc.name,
    number: sc.number,
    description: sc.description,
    icon: <Building className="size-6 text-orange-600" />,
    iconBg: "bg-orange-50 border border-orange-100",
    tagColor: "bg-orange-50 text-orange-700",
  }
}

export default function EmergencyContactsPage() {
  const { profile } = useAuth()
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("kv-bengaluru")

  useEffect(() => {
    if (profile?.schoolId && SCHOOL_CONTACTS_DATA[profile.schoolId]) {
      setSelectedSchoolId(profile.schoolId)
    }
  }, [profile?.schoolId])

  const schoolInfo = getSchoolContacts(selectedSchoolId)
  const formattedSchoolContacts = schoolInfo.contacts.map(formatSchoolContact)

  return (
    <div className="space-y-6">
      {/* ── TOP 112 DIRECTIVE ALERT ── */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_8px_30px_rgba(244,63,94,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 font-extrabold text-lg">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Universal Helpline
              </span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              In any immediate emergency, dial 112
            </h2>
            <p className="text-xs text-white/85 mt-0.5 max-w-xl leading-relaxed">
              India&apos;s unified single emergency number connects you directly to Police, Fire, and Ambulance from any phone (even without a SIM or lock screen).
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            navigator.clipboard.writeText("112")
            alert("112 copied to clipboard!")
          }}
          className="rounded-full bg-white text-rose-600 hover:bg-slate-50 font-bold text-xs px-6 h-10 shrink-0 shadow-md"
        >
          <Copy className="size-3.5 mr-1.5" /> Copy 112
        </Button>
      </div>

      {/* ── NATIONAL HELPLINES ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-lg text-slate-900">National Emergency Helplines</h2>
            <p className="text-xs text-slate-500">Official government emergency response contact numbers active 24/7 across India.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            8 National Services
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {nationalHelplines.map((contact) => (
            <ContactCard key={contact.number} contact={contact} />
          ))}
        </div>
      </div>

      {/* ── SCHOOL SPECIFIC CONTACTS ── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div>
            <h2 className="font-headline font-bold text-base text-slate-900">Campus Emergency Contacts</h2>
            <p className="text-xs text-slate-500">School principal, medical staff, and campus security dispatch.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold shrink-0">Institution:</span>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="kv-bengaluru">Kendriya Vidyalaya, Bengaluru</option>
              <option value="dps-rkpuram">Delhi Public School, R.K. Puram</option>
              <option value="stx-mumbai">St. Xavier&apos;s High School, Mumbai</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formattedSchoolContacts.map((contact) => (
            <ContactCard key={contact.name} contact={contact} isSchoolContact={true} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM ADVISORY BANNER (Clean horizontal styling with no shield logo) ── */}
      <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-base font-bold text-white">Emergency Preparedness Protocol</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Save these essential contacts on your mobile device as quick favorites. During natural disasters or campus emergencies, every second counts.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full">
            ● 24/7 Dispatch Ready
          </span>
        </div>
      </div>

    </div>
  )
}
