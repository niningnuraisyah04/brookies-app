// KOMPONEN PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import { Camera, MessageCircle, ExternalLink } from 'lucide-react'

export default function PublicFooter() {
  return <footer className="bg-brown px-6 py-10 text-center text-sm text-footer"><p className="font-display text-[21px] font-bold tracking-[.7px]">BROOKIES</p><p className="mt-2 text-footer-sub">Homemade cookies, made with love.</p><div className="mt-5 flex justify-center gap-5"><a href="https://www.instagram.com/brookies.ofc?rpxt=MXZ1cTYyMGhhdThsMQ==" target="_blank" rel="noreferrer"><Camera/></a><a href="https://wa.me/6281242760809" target="_blank" rel="noreferrer"><MessageCircle/></a><a href="https://gofood.link/a/Rp1ChrN" target="_blank" rel="noreferrer"><ExternalLink/></a></div></footer>
}
