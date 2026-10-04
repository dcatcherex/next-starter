import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  const who =
    user?.primaryEmailAddress?.emailAddress ?? user?.firstName ?? user?.id;
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {who}</p>
    </div>
  );
}
