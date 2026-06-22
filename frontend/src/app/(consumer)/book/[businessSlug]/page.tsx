import { redirect } from 'next/navigation';

type BookEntryProps = {
  params: Promise<{ businessSlug: string }>;
};

export default async function BookEntryPage({ params }: BookEntryProps) {
  const { businessSlug } = await params;
  redirect(`/book/${businessSlug}/service`);
}
