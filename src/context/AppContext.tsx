import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/types";
import { Language, translations } from "@/lib/tamil-translations";

interface OfflineQueueItem {
  id: string;
  type: "issue" | "receipt" | "old_gold";
  payload: any;
  timestamp: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  isOnline: boolean;
  offlineQueue: OfflineQueueItem[];
  addToOfflineQueue: (item: Omit<OfflineQueueItem, "id" | "timestamp">) => void;
  syncOfflineQueue: () => Promise<void>;
  selectedKarigarId: string;
  setSelectedKarigarId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("issue_clerk");
  const [lang, setLangState] = useState<Language>("en");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [selectedKarigarId, setSelectedKarigarId] = useState<string>("KAR-01");

  useEffect(() => {
    // Read cached preferences
    const savedRole = localStorage.getItem("swarna_role") as UserRole;
    if (savedRole) setRoleState(savedRole);

    const savedLang = localStorage.getItem("swarna_lang") as Language;
    if (savedLang) setLangState(savedLang);

    const savedQueue = localStorage.getItem("swarna_offline_queue");
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (e) {
        // ignore
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("swarna_role", newRole);
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("swarna_lang", newLang);
  };

  const addToOfflineQueue = (item: Omit<OfflineQueueItem, "id" | "timestamp">) => {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `OFFLINE-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [...offlineQueue, queueItem];
    setOfflineQueue(updated);
    localStorage.setItem("swarna_offline_queue", JSON.stringify(updated));
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    for (const item of offlineQueue) {
      try {
        if (item.type === "issue" || item.type === "receipt") {
          await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
        } else if (item.type === "old_gold") {
          await fetch("/api/old-gold", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload),
          });
        }
      } catch (err) {
        console.error("Failed to sync item:", item, err);
        return; // stop and keep remaining in queue
      }
    }

    setOfflineQueue([]);
    localStorage.removeItem("swarna_offline_queue");
  };

  const t = translations[lang] || translations.en;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        t,
        isOnline,
        offlineQueue,
        addToOfflineQueue,
        syncOfflineQueue,
        selectedKarigarId,
        setSelectedKarigarId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

