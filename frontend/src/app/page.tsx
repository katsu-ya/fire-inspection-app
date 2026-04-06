import { redirect } from "next/navigation";

// ルートへのアクセスはダッシュボードにリダイレクトする
const Home = () => {
  redirect("/dashboard");
};

export default Home;
