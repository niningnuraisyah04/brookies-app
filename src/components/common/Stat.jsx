// KOMPONEN UI UMUM — dipindahkan dari App.jsx (Tahap 2).
export default function Stat({label,value}){return <div className="rounded-panel border border-line bg-white p-5"><p className="text-[12px] text-muted">{label}</p><p className="mt-2 font-display text-stat font-bold text-ink">{value}</p></div>}
