import TimeTracker from '@/components/TimeTracker';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <TimeTracker />
      </div>
    </main>
  );
}