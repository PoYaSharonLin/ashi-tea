import { getCurrentUser } from "~/lib/auth";

import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <ProfileForm
      initialName={user?.name ?? ""}
      initialPhone={user?.phone ?? ""}
      email={user?.email ?? ""}
    />
  );
}
