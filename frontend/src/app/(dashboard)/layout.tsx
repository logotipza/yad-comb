"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Activity, BarChart3, Bot, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo-group" style={{ marginBottom: "1rem" }}>
                    <div className="logo-mark" />
                    <div className="logo-text">ЯД Оптимизатор</div>
                </div>

                <nav className="sidebar-nav">
                    <Link href="/dashboard" className={`nav-link ${pathname === "/dashboard" ? "active" : ""}`}>
                        <PlusCircle size={20} /> Создать кампанию
                    </Link>
                    <Link href="/audit" className={`nav-link ${pathname === "/audit" ? "active" : ""}`}>
                        <Activity size={20} /> Аудит
                    </Link>
                    <Link href="/stats" className={`nav-link ${pathname === "/stats" ? "active" : ""}`}>
                        <BarChart3 size={20} /> Статистика
                    </Link>
                    <Link href="/settings" className={`nav-link ${pathname === "/settings" ? "active" : ""}`}>
                        <Bot size={20} /> Нейросети
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
