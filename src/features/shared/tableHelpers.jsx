// HELPER TABEL & AKSI — dipindahkan dari EntityModal.jsx (Tahap 8).
// Dipisahkan agar EntityModal.jsx hanya mengekspor komponen (Fast Refresh).
import { Pencil, Trash2 } from 'lucide-react'
import Table from '@/components/common/Table'

export const buatActionButtons=(startEdit,delEntity)=>(kind,item)=> <div className="flex gap-1"><button onClick={()=>startEdit(kind,item)} className="rounded-lg p-2 text-muted hover:bg-cream-deep"><Pencil size={15}/></button><button onClick={()=>delEntity(kind,item.id)} className="rounded-lg p-2 text-red hover:bg-cancel"><Trash2 size={15}/></button></div>
export const tableCard=(title,subtitle,headers,rows)=> <div className="overflow-hidden rounded-panel border border-line bg-white"><div className="border-b border-line p-5"><h3 className="font-display text-panel font-bold text-ink">{title}</h3><p className="mt-1 text-[12px] text-muted">{subtitle}</p></div><Table headers={headers}>{rows}</Table></div>
