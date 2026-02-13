import { StudioLaunchpad } from '@/components/ui/StudioLaunchpad';
import { getActors } from '@/lib/api-server';
import { headers } from 'next/headers';

export default async function LaunchpadPage() {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const searchResults = await getActors({}, lang);
  
  return <StudioLaunchpad strokeWidth={1.5} initialActors={searchResults.results} />;
}
