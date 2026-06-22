'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { searchBusinesses } from '@/features/search/api/search.api';
import type { BusinessSearchItem } from '@/features/search/types/search.types';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Typography } from '@/shared/components/ui/typography';

import { VenueCard } from './venue-card';

export function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [results, setResults] = useState<BusinessSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchBusinesses({
        q: query || undefined,
        category: category || undefined,
        limit: 20,
      });
      setResults(response.data);
    } catch (searchError) {
      setError(
        searchError instanceof Error ? searchError.message : 'Search failed',
      );
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.replace(`/search?${params.toString()}`);
    void runSearch();
  };

  return (
    <Section spacing="default">
      <Container className="flex flex-col gap-8">
        <div className="space-y-2">
          <Typography variant="h1">Search venues</Typography>
          <Typography variant="muted">
            Find football pitches, salons, restaurants, and more.
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name..."
            className="flex-1"
          />
          <Input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category (e.g. football)"
            className="sm:w-48"
          />
          <Button type="submit">Search</Button>
        </form>

        {loading && <Typography variant="muted">Loading...</Typography>}
        {error && (
          <Typography variant="small" className="text-destructive">
            {error}
          </Typography>
        )}

        {!loading && !error && results.length === 0 && (
          <Typography variant="muted">No venues found.</Typography>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((business) => (
            <VenueCard key={business.id} business={business} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
