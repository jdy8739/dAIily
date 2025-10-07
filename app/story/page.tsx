import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

const StoryPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Redirect to user's own story page
  redirect(`/story/${currentUser.id}`);
};

export default StoryPage;
