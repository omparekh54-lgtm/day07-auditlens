import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'AuditLens | Explainable Transaction Review', description:'Privacy-first explainable transaction anomaly triage for internal audit teams.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}