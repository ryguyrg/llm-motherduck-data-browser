import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ChatInterface from './components/ChatInterface';
import { getDatasetByPath } from '@/lib/datasets';

export default async function Home() {
  // Load the default eastlake dataset
  const dataset = await getDatasetByPath('eastlake');

  if (!dataset) {
    // If no eastlake dataset exists, render with defaults
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
        <ChatInterface initialModel="gemini" />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
      <ChatInterface
        initialModel="gemini"
        datasetPath={dataset.url_path}
        datasetName={dataset.name}
        examplePrompts={dataset.example_prompts}
      />
    </Suspense>
  );
}
