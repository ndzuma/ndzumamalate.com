'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LiveUpdateProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Determine API URL based on env or default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const eventSource = new EventSource(`${API_URL}/api/v1/public/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE event received:', data);
        
        // Refresh the router to re-fetch Server Components without losing client state
        router.refresh();
      } catch (err) {
        console.error('Failed to parse SSE data', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // EventSource handles reconnections automatically, 
      // but we log errors for debugging
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  return <>{children}</>;
}
