import React from 'react';
import { MediaLibraryView } from '@/components/media/media-library-view';

export const metadata = {
  title: 'Digital Asset Management | SmartGO Admin',
  description: 'Enterprise Media & Asset Management Platform',
};

export default function AdminMediaPage() {
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <MediaLibraryView />
    </div>
  );
}
