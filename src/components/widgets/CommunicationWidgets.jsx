import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import SmartCoachWidget from './SmartCoachWidget';
import PublicAssistantWidget from './PublicAssistantWidget';
import WhatsAppWidget from './WhatsAppWidget';

// Floating stack, bottom inline-end corner (RTL-aware), smallest footprint:
//   • assistant button at the bottom, WhatsApp support directly above it
//   • signed-in users get the private Smart Coach (server-scoped to their
//     own account/properties/subscription with per-user memory)
//   • guests get the offline public guide (general Madar info only —
//     it cannot access customer data by construction)
//   • nothing renders until the session check settles, and never on
//     payment or auth screens where the corner belongs to page CTAs.
export default function CommunicationWidgets() {
  const location = useLocation();
  const { isAuthenticated, authChecked } = useAuth();

  const hiddenPaths = ['/billing', '/checkout', '/payment', '/login', '/signup', '/register', '/forgot-password', '/reset-password'];
  const shouldHide = hiddenPaths.some((path) => location.pathname.includes(path));

  if (shouldHide || !authChecked) return null;

  return (
    <>
      {isAuthenticated ? <SmartCoachWidget /> : <PublicAssistantWidget />}
      <WhatsAppWidget />
    </>
  );
}
