import HomePage, { homeAlternates } from "./HomePage";

export const dynamic = "force-dynamic";

export const metadata = { alternates: homeAlternates("ar") };

export default function Home() {
  return <HomePage lang="ar" />;
}
