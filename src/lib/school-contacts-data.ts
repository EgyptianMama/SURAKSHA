export type SchoolContact = {
  name: string
  number: string
  description: string
  role: "principal" | "nurse" | "security" | "custom"
}

export type SchoolContactsMap = Record<string, {
  schoolName: string
  contacts: SchoolContact[]
}>

export const SCHOOL_CONTACTS_DATA: SchoolContactsMap = {
  "kv-bengaluru": {
    schoolName: "Kendriya Vidyalaya, Bengaluru",
    contacts: [
      {
        name: "School Principal",
        number: "+91 80234 56789",
        description: "Dr. S. K. Rao — Available during school hours (8 AM - 4 PM)",
        role: "principal",
      },
      {
        name: "School Nurse",
        number: "+91 80234 56790",
        description: "Nurse Lakshmi N. — Medical Bay, Ground Floor",
        role: "nurse",
      },
      {
        name: "Security Office",
        number: "+91 80234 56791",
        description: "Gate 1 Main Security Control — 24/7",
        role: "security",
      },
    ],
  },
  "dps-rkpuram": {
    schoolName: "Delhi Public School, R.K. Puram",
    contacts: [
      {
        name: "School Principal",
        number: "+91 11261 74218",
        description: "Dr. Anju Wal — Available during school hours (7:30 AM - 3:30 PM)",
        role: "principal",
      },
      {
        name: "School Nurse",
        number: "+91 11261 74219",
        description: "Nurse Sunita Verma — Infirmary, Block B",
        role: "nurse",
      },
      {
        name: "Security Office",
        number: "+91 11261 74220",
        description: "Main Gate & CCTV Control — 24/7",
        role: "security",
      },
    ],
  },
  "stx-mumbai": {
    schoolName: "St. Xavier's High School, Mumbai",
    contacts: [
      {
        name: "School Principal",
        number: "+91 22226 20945",
        description: "Fr. Francis Swamy — Available during school hours (8 AM - 3.30 PM)",
        role: "principal",
      },
      {
        name: "School Nurse",
        number: "+91 22226 20946",
        description: "Nurse Maria D'Souza — First Aid Room, Main Building",
        role: "nurse",
      },
      {
        name: "Security Office",
        number: "+91 22226 20947",
        description: "Campus Gate Security Desk — 24/7",
        role: "security",
      },
    ],
  },
}

export const DEFAULT_SCHOOL_CONTACTS: SchoolContact[] = [
  {
    name: "School Principal",
    number: "+91 98765 43210",
    description: "Dr. Rajesh Kumar — Available during school hours",
    role: "principal",
  },
  {
    name: "School Nurse",
    number: "+91 98765 43211",
    description: "Nurse Priya Sharma — Medical room, Ground Floor",
    role: "nurse",
  },
  {
    name: "Security Office",
    number: "+91 98765 43212",
    description: "Main gate security — 24/7 availability",
    role: "security",
  },
]

export function getSchoolContacts(schoolId?: string): { schoolName: string; contacts: SchoolContact[] } {
  if (schoolId && SCHOOL_CONTACTS_DATA[schoolId]) {
    return SCHOOL_CONTACTS_DATA[schoolId]
  }
  return {
    schoolName: "General School",
    contacts: DEFAULT_SCHOOL_CONTACTS,
  }
}
