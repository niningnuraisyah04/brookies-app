// ERROR BOUNDARY — Tahap 12.
// Menangkap error saat render agar halaman tidak putih tanpa keterangan.
// Detail error/stack sengaja tidak disimpan maupun ditampilkan.
import { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { adaError: false }
  }

  static getDerivedStateFromError() {
    return { adaError: true }
  }

  cobaLagi = () => this.setState({ adaError: false })

  render() {
    if (this.state.adaError) {
      return <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-md rounded-card border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-panel font-bold text-ink">Terjadi kesalahan</h1>
          <p className="mt-2 text-[13px] text-muted">Halaman tidak dapat ditampilkan. Silakan coba lagi.</p>
          <div className="mt-5 flex justify-center"><Button onClick={this.cobaLagi}>Coba lagi</Button></div>
        </div>
      </div>
    }
    return this.props.children
  }
}
