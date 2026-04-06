// 商品新規登録ページ（/productsにリダイレクト）
import { redirect } from "next/navigation";

// 新規登録はモーダルで行うため一覧ページにリダイレクト
const NewProductPage = () => {
  redirect("/products");
};

export default NewProductPage;
