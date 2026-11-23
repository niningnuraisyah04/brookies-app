// LAYOUT ADMIN — dibuat dari JSX render akhir App.jsx yang benar-benar aktif (Tahap 4).
// Salinan lama di src/components/layout/ sudah dihapus pada Tahap 9B.
import AdminSidebar from '@/layouts/AdminSidebar'
import AdminHeader from '@/layouts/AdminHeader'

export default function AdminLayout({ page, setPage, logout, adminNama, loadingData, content, children }) {
  return <div className="min-h-screen bg-admin text-ink"><AdminSidebar page={page} setPage={setPage} logout={logout}/><div className="pl-[74px] md:pl-[245px] lg:pl-[300px]"><AdminHeader adminNama={adminNama}/><main className="mx-auto max-w-[1500px] p-3 md:p-6 lg:p-9">{loadingData?<div className="py-20 text-center text-[13px] text-muted">Memuat data dari database...</div>:content}</main></div>{children}</div>
}
