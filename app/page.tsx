import { Suspense } from 'react';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
      <ChatInterface />
    </Suspense>
  );
}
