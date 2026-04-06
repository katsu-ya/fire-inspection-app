// 商品詳細ページ（/productsにリダイレクト）
import { redirect } from "next/navigation";

// 詳細・編集はモーダルで行うため一覧ページにリダイレクト
const ProductDetailPage = () => {
  redirect("/products");
};

export default ProductDetailPage;
