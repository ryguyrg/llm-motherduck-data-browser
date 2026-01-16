import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ChatInterface from '../components/ChatInterface';
import { getDatasetByPath } from '@/lib/datasets';

interface PageProps {
  params: Promise<{ datasetPath: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  const { datasetPath } = await params;

  // Load dataset from database
  const dataset = await getDatasetByPath(datasetPath);

  if (!dataset) {
    notFound();
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
