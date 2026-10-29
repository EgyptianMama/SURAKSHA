// Emergency Alerts Pipeline — Real-time Firestore Persistence & Top Dashboard Banners
// Target roles strictly: "Teacher" | "Student"

import {
  collection, doc, getDocs, addDoc, setDoc, query, where, orderBy,
  serverTimestamp, onSnapshot, limit, Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"

export type AlertSeverity = "info" | "warning" | "critical" | "emergency"
export type AlertRoleTarget = "Teacher" | "Student"
export type DeliveryChannel = "in_app"

export type EmergencyAlertDoc = {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  targetSchoolId: string                  // "all" or specific school ID e.g., "kv-bengaluru"
  targetSchoolName: string
  targetRoles: AlertRoleTarget[]
  deliveryChannels: DeliveryChannel[]
  sentByUid: string
  sentByName: string
  sentAt: string | Timestamp
  status: "active" | "resolved"
}

// Initial active fallback alert for immediate top banner demonstration
const INITIAL_ACTIVE_ALERTS: EmergencyAlertDoc[] = []

const ALERTS_COL = "alerts"

/**
 * Broadcast an emergency alert and persist to Firestore
 */
export async function sendEmergencyAlert(params: {
  title: string
  message: string
  severity: AlertSeverity
  targetSchoolId: string
  targetRoles: AlertRoleTarget[]
  adminUid: string
  adminName: string
}): Promise<EmergencyAlertDoc> {
  const { title, message, severity, targetSchoolId, targetRoles, adminUid, adminName } = params

  const schoolObj = SEED_SCHOOLS.find(s => s.id === targetSchoolId)
  const targetSchoolName = targetSchoolId === "all" ? "All Schools" : (schoolObj?.name || targetSchoolId)

  const alertData: Omit<EmergencyAlertDoc, "id"> = {
    title,
    message,
    severity,
    targetSchoolId,
    targetSchoolName,
    targetRoles,
    deliveryChannels: ["in_app"],
    sentByUid: adminUid,
    sentByName: adminName,
    sentAt: new Date().toISOString(),
    status: "active",
  }

  try {
    const docRef = await addDoc(collection(db, ALERTS_COL), {
      ...alertData,
      createdAt: serverTimestamp(),
    })
    const newDoc = { id: docRef.id, ...alertData }
    saveLocalAlert(newDoc)
    return newDoc
  } catch (err) {
    console.warn("Firestore alert write notice (storing in local session):", err)
    const localAlert: EmergencyAlertDoc = { id: `alert-${Date.now()}`, ...alertData }
    saveLocalAlert(localAlert)
    return localAlert
  }
}

import { withTimeout } from "@/lib/async-utils"

/**
 * Fetch emergency alerts from Firestore or local fallback
 */
export async function getEmergencyAlerts(): Promise<EmergencyAlertDoc[]> {
  return withTimeout(
    (async () => {
      const q = query(collection(db, ALERTS_COL), orderBy("createdAt", "desc"), limit(20))
      const snap = await getDocs(q)
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyAlertDoc))
      }
      return getLocalAlerts()
    })(),
    getLocalAlerts(),
    1500
  )
}

/**
 * Real-time listener for emergency alerts
 */
export function subscribeToEmergencyAlerts(callback: (alerts: EmergencyAlertDoc[]) => void): () => void {
  try {
    const q = query(collection(db, ALERTS_COL), orderBy("createdAt", "desc"), limit(10))
    const unsub = onSnapshot(q, (snap) => {
      try {
        const firestoreAlerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyAlertDoc))
        if (firestoreAlerts.length > 0) {
          callback(firestoreAlerts)
        } else {
          callback(getLocalAlerts())
        }
      } catch {
        callback(getLocalAlerts())
      }
    }, () => {
      callback(getLocalAlerts())
    })
    return unsub
  } catch {
    callback(getLocalAlerts())
    return () => {}
  }
}

function saveLocalAlert(alert: EmergencyAlertDoc) {
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalAlerts()
      const updated = [alert, ...existing]
      localStorage.setItem("suraksha_emergency_alerts", JSON.stringify(updated))
    } catch (e) {
      console.warn("Failed to save local alert", e)
    }
  }
}

function getLocalAlerts(): EmergencyAlertDoc[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("suraksha_emergency_alerts")
      if (data) return JSON.parse(data)
    } catch (e) {
      console.warn("Failed to read local alerts", e)
    }
  }
  return INITIAL_ACTIVE_ALERTS
}
