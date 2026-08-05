// APIレスポンス・リクエスト型定義（一元管理）
// バックエンドのJSONはすべてsnake_caseで返される

// ============ 共通 ============

// ユーザーロール
export type Role = "ADMIN" | "EMPLOYEE";

// 現場作業のステータス
export type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

// 点検結果の値（良 / 不良 / 対象外）
export type InspectionResultValue = "PASS" | "FAIL" | "NA";

// ============ 認証 ============

// ユーザー情報
export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  is_active: boolean;
};

// ログインレスポンス
export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

// トークンリフレッシュレスポンス
export type RefreshResponse = {
  access_token: string;
};

// ============ マスタ ============

// 現場マスタ
export type Site = {
  id: number;
  name: string;
  address: string | null;
  building_type: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  note: string | null;
  is_active: boolean;
};

// 現場概要（assignment・点検報告詳細に埋め込まれる形。is_activeは返されない）
export type SiteSummary = Omit<Site, "is_active">;

// 現場の登録・更新リクエスト
export type SiteRequest = {
  name: string;
  address: string;
  building_type: string;
  contact_name: string;
  contact_phone: string;
  note: string;
};

// 点検項目マスタ
export type InspectionItem = {
  id: number;
  category: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

// 点検項目の登録・更新リクエスト
export type InspectionItemRequest = {
  category: string;
  name: string;
  display_order: number;
};

// 職員の新規登録リクエスト
export type UserCreateRequest = {
  email: string;
  password: string;
  name: string;
  role: Role;
};

// 職員の更新リクエスト（passwordは指定時のみ変更）
export type UserUpdateRequest = {
  email: string;
  name: string;
  role: Role;
  password?: string;
};

// ============ ルート ============

// ルートassignment（管理者向け・従業員向け共通の基本形）
export type RouteAssignment = {
  id: number;
  user_id: number;
  user_name: string;
  work_date: string;
  visit_order: number;
  status: AssignmentStatus;
  arrived_at: string | null;
  departed_at: string | null;
  note: string | null;
  site: SiteSummary;
};

// 従業員向けassignment（点検報告の保存済みフラグ付き）
export type MyRouteAssignment = RouteAssignment & {
  has_report: boolean;
};

// 従業員向けルートレスポンス
export type MyRouteResponse = {
  work_date: string;
  assignments: MyRouteAssignment[];
};

// ルート内の現場指定（配列順=訪問順）
export type RouteSiteInput = {
  site_id: number;
  note?: string;
};

// ルート置き換えリクエスト
export type RoutePutRequest = {
  user_id: number;
  work_date: string;
  sites: RouteSiteInput[];
};

// ルート期間一括設定リクエスト
export type RouteBulkRequest = {
  user_id: number;
  date_from: string;
  date_to: string;
  skip_weekends: boolean;
  sites: RouteSiteInput[];
};

// ============ 点検報告 ============

// 点検フォームの項目（未入力はresult=null）
export type InspectionFormItem = {
  item_id: number;
  category: string;
  name: string;
  display_order: number;
  result: InspectionResultValue | null;
  note: string | null;
};

// 点検フォーマット+入力済み結果のレスポンス
export type InspectionResponse = {
  remarks: string | null;
  items: InspectionFormItem[];
};

// 点検結果の入力値
export type InspectionResultInput = {
  item_id: number;
  result: InspectionResultValue;
  note?: string;
};

// 点検報告の保存リクエスト
export type InspectionSaveRequest = {
  remarks: string;
  results: InspectionResultInput[];
};

// 管理者向け点検報告詳細
export type ReportDetail = {
  assignment_id: number;
  user_name: string;
  work_date: string;
  status: AssignmentStatus;
  arrived_at: string | null;
  departed_at: string | null;
  site: SiteSummary;
  remarks: string | null;
  items: InspectionFormItem[];
};

// ============ 日報 ============

// 日報内の現場ごとの実績
export type DailyReportVisit = {
  site_name: string;
  status: AssignmentStatus;
  arrived_at: string | null;
  departed_at: string | null;
  duration_minutes: number | null;
};

// 従業員向け日報プレビューレスポンス
export type DailyReportResponse = {
  work_date: string;
  submitted: boolean;
  special_note: string | null;
  submitted_at: string | null;
  visits: DailyReportVisit[];
  total_minutes: number;
  all_completed: boolean;
};

// 日報提出リクエスト
export type DailyReportSubmitRequest = {
  work_date: string;
  special_note: string;
};

// 管理者向け日報の現場実績（点検報告詳細への遷移用にassignment_idを含む）
export type AdminDailyReportVisit = DailyReportVisit & {
  assignment_id: number;
};

// 管理者向け日報レスポンス（従業員向けと同じ集計形+user情報）
export type AdminDailyReport = {
  user_id: number;
  user_name: string;
  work_date: string;
  submitted: boolean;
  special_note: string | null;
  submitted_at: string | null;
  visits: AdminDailyReportVisit[];
  total_minutes: number;
  all_completed: boolean;
};

// ============ ダッシュボード ============

// 当日サマリー
export type DashboardSummary = {
  working_employees: number;
  planned_sites: number;
  completed_sites: number;
  in_progress_sites: number;
  submitted_daily_reports: number;
  fail_count: number;
};

// 職員ごとの当日状況
export type StaffStatus = {
  user_id: number;
  user_name: string;
  total_sites: number;
  completed_sites: number;
  current_site_name: string | null;
  daily_report_submitted: boolean;
};

// 直近7日の点検実施状況（棒グラフ用）
export type WeeklyPoint = {
  date: string;
  planned: number;
  completed: number;
};

// 不良（FAIL）件数の設備カテゴリ別集計
export type FailCategoryCount = {
  category: string;
  count: number;
};
