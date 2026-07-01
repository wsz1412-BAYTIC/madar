import React from 'react';
import { useLocation } from 'react-router-dom';
import SmartCoachWidget from './SmartCoachWidget';
import WhatsAppWidget from './WhatsAppWidget';

export default function CommunicationWidgets() {
  const location = useLocation();

  // Hide widgets on payment or sensitive pages
  const hiddenPaths = ['/billing', '/checkout', '/payment'];
  const shouldHide = hiddenPaths.some(path => location.pathname.includes(path));

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <SmartCoachWidget />
      <WhatsAppWidget />
    </>
  );
}