"use client"

import { useSyncExternalStore } from "react"

export type ConsentDecision = "accepted" | "rejected"
export type ConsentState = "pending" | ConsentDecision

const STORAGE_KEY = "cookieConsent"
const POLICY_VERSION = "1.0"
const CONSENT_EVENT = "cookie-consent-change"

interface StoredConsent {
    decision: ConsentDecision
    timestamp: string
    policyVersion: string
}

function readStoredConsent(): ConsentState {
    if (typeof window === "undefined") return "pending"
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return "pending"
        const parsed = JSON.parse(raw) as StoredConsent
        if (parsed.decision === "accepted" || parsed.decision === "rejected") {
            return parsed.decision
        }
        return "pending"
    } catch {
        return "pending"
    }
}

function persistConsent(decision: ConsentDecision) {
    const payload: StoredConsent = {
        decision,
        timestamp: new Date().toISOString(),
        policyVersion: POLICY_VERSION,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT))
}

function subscribe(callback: () => void) {
    window.addEventListener(CONSENT_EVENT, callback)
    window.addEventListener("storage", callback)
    return () => {
        window.removeEventListener(CONSENT_EVENT, callback)
        window.removeEventListener("storage", callback)
    }
}

const getSnapshot = (): ConsentState => readStoredConsent()
const getServerSnapshot = (): ConsentState => "pending"

export function useCookieConsent() {
    const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    return {
        state,
        accept: () => persistConsent("accepted"),
        reject: () => persistConsent("rejected"),
    }
}
