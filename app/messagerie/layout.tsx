import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'

export default function MessageriLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </AuthProvider>
    )
}
