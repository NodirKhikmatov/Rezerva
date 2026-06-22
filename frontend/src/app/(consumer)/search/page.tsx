import { Suspense } from 'react';

import { SearchPageContent } from '@/features/search/components/search-page-content';

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
