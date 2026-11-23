// FORM LOGIN — dipindahkan dari App.jsx (Tahap 7), loading ditambahkan Tahap 13.
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Field from '@/components/common/Field'
import Input from '@/components/common/Input'

export default function LoginModal({ loginOpen, login, setLogin, doLogin, closeLogin, loading=false }) {
 return <>{loginOpen&&<Modal title="Login Administrator" onClose={closeLogin} loading={loading} className="rounded-login"><form onSubmit={doLogin} className="space-y-4"><Field label="Username"><Input value={login.user} onChange={e=>setLogin({...login,user:e.target.value})} placeholder="Username" required disabled={loading}/></Field><Field label="Password"><Input type="password" value={login.pass} onChange={e=>setLogin({...login,pass:e.target.value})} placeholder="Password" required disabled={loading}/></Field><Button type="submit" disabled={loading}>{loading?'Memproses...':'Masuk'}</Button></form></Modal>}</>
}
