import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import type { PublicConfig, ServiceItem, User } from '../types';

interface SanctuaryContextValue {
  user: User | null;
  authLoading: boolean;
  publicConfig: PublicConfig;
  services: ServiceItem[];
  selectedServiceIds: number[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<User | null>;
  refreshPublicData: () => Promise<void>;
  toggleSelectedService: (serviceId: number) => void;
  setSelectedServiceIds: React.Dispatch<React.SetStateAction<number[]>>;
  clearSelectedServices: () => void;
  logout: () => Promise<void>;
}

const DEFAULT_CONFIG: PublicConfig = {
  sanctuaryName: 'Akansha.Predicts',
  practitionerName: 'Akansha Bansal',
  whatsappBusinessNumber: '919560564150',
  contactEmail: 'contact@akanshapredicts.com',
  consultationHours: 'Mon – Sat · 10:30 AM – 7:30 PM IST',
  announcementText:
    'Akansha.Predicts — Astrology, Tarot Reading, Spiritual Guidance & Energy Healing · Direct Booking via WhatsApp',
};

const STORAGE_CART_KEY = 'akansha_predicts_selected_services';

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

export function SanctuaryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [publicConfig, setPublicConfig] =
    useState<PublicConfig>(DEFAULT_CONFIG);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.filter((n) => typeof n === 'number')
          : [];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CART_KEY,
        JSON.stringify(selectedServiceIds)
      );
    } catch {
      // ignore
    }
  }, [selectedServiceIds]);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await api.me();
      setUser(res.user);
      return res.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshPublicData = async () => {
    try {
      const [cfg, svc] = await Promise.all([
        api.getPublicConfig(),
        api.getServices(),
      ]);
      setPublicConfig(cfg);
      setServices(svc.services);
    } catch (err) {
      console.error('Failed to load sanctuary data:', err);
    }
  };

  useEffect(() => {
    void refreshUser();
    void refreshPublicData();
  }, []);

  const toggleSelectedService = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const clearSelectedServices = () => setSelectedServiceIds([]);

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <SanctuaryContext.Provider
      value={{
        user,
        authLoading,
        publicConfig,
        services,
        selectedServiceIds,
        setUser,
        refreshUser,
        refreshPublicData,
        toggleSelectedService,
        setSelectedServiceIds,
        clearSelectedServices,
        logout,
      }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) {
    throw new Error('useSanctuary must be used inside SanctuaryProvider');
  }
  return ctx;
}

