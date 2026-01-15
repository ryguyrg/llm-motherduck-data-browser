import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import ChatInterface from '../components/ChatInterface';

// Map app names to model IDs
const APP_NAME_TO_MODEL: Record<string, string> = {
  'mash': 'gemini',
  'maude': 'opus',
  'quacker': 'blended',
  'all-the-quackers': 'head-to-head',
};

// Valid app names for static generation
export function generateStaticParams() {
  return Object.keys(APP_NAME_TO_MODEL).map((appName) => ({
    appName,
  }));
}

interface PageProps {
  params: Promise<{ appName: string }>;
}

export default async function AppPage({ params }: PageProps) {
  const { appName } = await params;
  const modelId = APP_NAME_TO_MODEL[appName.toLowerCase()];

  if (!modelId) {
    notFound();
  }

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
      <ChatInterface initialModel={modelId} />
    </Suspense>
  );
}
