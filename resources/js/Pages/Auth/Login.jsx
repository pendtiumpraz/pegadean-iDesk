import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login({ portal_sso_url, errors = {} }) {
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        form.post(route('login.post'))
    }

    const inputStyle = {
        width: '100%',
        height: 38,
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid var(--ink-200)',
        background: 'var(--paper)',
        color: 'var(--ink-900)',
        fontSize: 13.5,
        outline: 'none',
        transition: 'border-color 120ms, box-shadow 120ms',
    }

    const labelStyle = {
        display: 'block',
        fontSize: 12.5,
        fontWeight: 600,
        color: 'var(--ink-700)',
        marginBottom: 6,
        letterSpacing: '0.01em',
    }

    const errorStyle = {
        color: 'var(--rose-600)',
        fontSize: 11.5,
        marginTop: 4,
    }

    const focusOn = (e) => {
        e.currentTarget.style.borderColor = 'var(--brand-500)'
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)'
    }
    const focusOff = (e) => {
        e.currentTarget.style.borderColor = 'var(--ink-200)'
        e.currentTarget.style.boxShadow = 'none'
    }

    return (
        <>
            <Head title="Masuk · iDesk" />
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--canvas)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                }}
            >
                <div
                    className="card"
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        boxShadow: 'var(--shadow-lg)',
                        padding: 32,
                    }}
                >
                    {/* Brand header — mirrors topbar brand mark */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 24,
                        }}
                    >
                        <div
                            className="brand-mark"
                            style={{ width: 44, height: 44, fontSize: 20 }}
                        >
                            iD
                        </div>
                        <div>
                            <div
                                style={{
                                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                                    fontWeight: 500,
                                    fontSize: 22,
                                    letterSpacing: '-0.3px',
                                    color: 'var(--ink-900)',
                                    lineHeight: 1.1,
                                }}
                            >
                                iDesk
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-500)',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    marginTop: 2,
                                }}
                            >
                                Compliance Workspace
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: 13,
                            color: 'var(--ink-500)',
                            marginBottom: 22,
                            lineHeight: 1.55,
                        }}
                    >
                        Masuk untuk meninjau kebijakan, menyetujui SERKEP,
                        dan memantau risiko kepatuhan.
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                    >
                        <div>
                            <label htmlFor="email" style={labelStyle}>
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                onFocus={focusOn}
                                onBlur={focusOff}
                                style={inputStyle}
                                placeholder="nama@pegadaian.co.id"
                            />
                            {errors.email && <p style={errorStyle}>{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" style={labelStyle}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    onFocus={focusOn}
                                    onBlur={focusOff}
                                    style={{ ...inputStyle, paddingRight: 40 }}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: 8,
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        color: 'var(--ink-500)',
                                        padding: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p style={errorStyle}>{errors.password}</p>}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: 12.5,
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: 'var(--ink-700)',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                    style={{ accentColor: 'var(--brand-600)' }}
                                />
                                Ingat saya
                            </label>
                            <a
                                href="#"
                                style={{
                                    color: 'var(--brand-700)',
                                    fontWeight: 600,
                                    borderBottom: '1px dashed var(--brand-500)',
                                    paddingBottom: 1,
                                }}
                            >
                                Lupa password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                marginTop: 4,
                                opacity: form.processing ? 0.7 : 1,
                                cursor: form.processing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {form.processing ? 'Memproses…' : 'Masuk'}
                        </button>
                    </form>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            margin: '20px 0',
                        }}
                    >
                        <div style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
                        <span style={{ fontSize: 11.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                            atau
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
                    </div>

                    {portal_sso_url && (
                        <a
                            href={portal_sso_url}
                            className="btn ghost"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                            }}
                        >
                            <LogIn size={15} />
                            Login via Portal SSO
                        </a>
                    )}
                </div>

                <p
                    style={{
                        marginTop: 24,
                        fontSize: 11.5,
                        color: 'var(--ink-500)',
                        textAlign: 'center',
                    }}
                >
                    &copy; {new Date().getFullYear()} Pegadaian — iDesk Compliance Workspace.
                </p>
            </div>
        </>
    )
}
