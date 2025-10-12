import { getCurrentUser } from "../lib/auth";
import { redirect } from "next/navigation";

const Home = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/feed");
};

export default Home;
