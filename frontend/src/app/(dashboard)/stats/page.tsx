"use client";

import { motion } from "framer-motion";

export default function StatsPage() {
    const stats = [
        { title: "Активные кампании", value: "3", change: "+1", positive: true },
        { title: "Показы за сегодня", value: "12 400", change: "+15%", positive: true },
        { title: "Расход (₽)", value: "3 250", change: "-5%", positive: true },
        { title: "Средний CTR", value: "8.4%", change: "-0.2%", positive: false },
    ];

    return (
        <>
            <header className="page-header">
                <h1 className="title font-extrabold">Статистика</h1>
                <div className="user-profile">
                    <div className="avatar" />
                    <span className="font-bold" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        vladimir@yandex.ru
                    </span>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}
            >
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ padding: "1.5rem", gap: "0.5rem", margin: 0 }}>
                        <h3 style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600 }}>{stat.title}</h3>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{stat.value}</span>
                            <span style={{
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                color: stat.positive ? "#10B981" : "#EF4444",
                                marginBottom: "0.25rem"
                            }}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginTop: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}
            >
                <div className="card" style={{ flex: 2, minWidth: "300px", margin: 0, height: "400px", padding: "1.5rem" }}>
                    <h3 className="font-bold" style={{ marginBottom: "1rem" }}>Динамика показов</h3>
                    <div style={{ width: "100%", height: "100%", background: "var(--bg-input)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        График (Chart.js / Recharts)
                    </div>
                </div>

                <div className="card" style={{ flex: 1, minWidth: "300px", margin: 0, height: "400px", padding: "1.5rem" }}>
                    <h3 className="font-bold" style={{ marginBottom: "1rem" }}>Топ объявлений</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ padding: "1rem", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                                <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Купить квартиру в Москве...</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>CTR: 12.{i}% • Клик: 45₽</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
