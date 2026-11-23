// LAYOUT PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import PublicHeader from '@/layouts/PublicHeader'
import PublicFooter from '@/layouts/PublicFooter'

export default function PublicLayout({ children, setPage, openLogin }) {
  return <div className="min-h-screen bg-cream text-ink">
   <PublicHeader setPage={setPage} openLogin={openLogin}/>
   {children}
   <PublicFooter/>
  </div>
}
