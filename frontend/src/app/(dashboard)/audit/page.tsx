"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/store";
import { Search, ChevronRight, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

type AuditState = "list" | "analyzing" | "results";

const MOCK_CAMPAIGNS = [
    { id: "1", name: "Поиск | Недвижимость МСК", spend: "12 500 ₽/мес", status: "Активна", ctr: "6.2%" },
    { id: "2", name: "РСЯ | Ремаркетинг Дизайн", spend: "4 200 ₽/мес", status: "Активна", ctr: "0.8%" },
    { id: "3", name: "Мастер Кампаний | Лиды", spend: "25 000 ₽/мес", status: "Активна", ctr: "3.4%" }
];

export default function AuditPage() {
    const [state, setState] = useState<AuditState>("list");
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    const startAudit = (campaign: any) => {
        setSelectedCampaign(campaign);
        setState("analyzing");

        // Эмуляция анализа
        setTimeout(() => {
            setState("results");
            toast.info("Анализ завершен", "Найдено 3 критических рекомендации");
        }, 4000);
    };

    const applyChanges = () => {
        toast.success("Успешно", "Все рекомендации применены к кампании в Яндекс.Директ!");
        setState("list");
    };

    return (
        <>
            <header className="page-header">
                <h1 className="title font-extrabold">
                    {state === "list" && "Аудит кампаний"}
                    {state === "analyzing" && "ИИ Анализирует..."}
                    {state === "results" && `Результаты аудита: ${selectedCampaign?.name}`}
                </h1>
                <div className="user-profile">
                    <div className="avatar" />
                    <span className="font-bold" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        vladimir@yandex.ru
                    </span>
                </div>
            </header>

            <div style={{ flex: 1, position: "relative", marginTop: "2rem" }}>
                <AnimatePresence mode="wait">

                    {/* STATE: CAMPAIGN LIST */}
                    {state === "list" && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="card" style={{ maxWidth: "800px", margin: 0 }}>
                                <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                                    <div className="input-group" style={{ flex: 1 }}>
                                        <Search size={20} color="var(--text-light)" />
                                        <input type="text" className="input-field" placeholder="Поиск кампании..." style={{ border: 'none', paddingLeft: '0.5rem' }} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {MOCK_CAMPAIGNS.map(c => (
                                        <div
                                            key={c.id}
                                            className="setting-row"
                                            style={{ cursor: "pointer", transition: "all 0.2s" }}
                                            onClick={() => startAudit(c)}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-main)"}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                                        >
                                            <div className="setting-info" style={{ width: "100%" }}>
                                                <div className="setting-icon dark">{c.name.charAt(0)}</div>
                                                <div className="setting-text" style={{ flex: 1 }}>
                                                    <h4>{c.name}</h4>
                                                    <p>Расход: {c.spend} · CTR: {c.ctr}</p>
                                                </div>
                                                <ChevronRight color="var(--text-light)" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: ANALYZING */}
                    {state === "analyzing" && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="card" style={{ maxWidth: "800px", margin: 0, padding: "3rem 2rem", textAlign: "center" }}>
                                <div className="skeleton" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 1.5rem" }} />
                                <h2 className="title font-bold" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                                    ИИ разбирает креативы и метрику...
                                </h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                                    <div className="skeleton" style={{ width: "80%", height: "20px" }} />
                                    <div className="skeleton" style={{ width: "60%", height: "20px" }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: RESULTS */}
                    {state === "results" && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px" }}
                        >
                            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                                {/* Summary Card */}
                                <div className="card" style={{ flex: 1, margin: 0, background: "#FEF2F2", borderColor: "#FEE2E2" }}>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "#B91C1C", marginBottom: "1rem" }}>
                                        <AlertTriangle size={24} />
                                        <h3 className="font-bold">Критические проблемы</h3>
                                    </div>
                                    <p style={{ color: "#7F1D1D", fontSize: "0.95rem", lineHeight: 1.5 }}>
                                        Обнаружено сильное падение CTR на поиске (с 8% до 2.3%). ИИ выявил, что 60% бюджета сливается на нецелевые мобильные площадки и устаревшие формулировки в текстах.
                                    </p>
                                </div>
                            </div>

                            {/* Recommendation 1: Sites to exclude */}
                            <div className="card" style={{ margin: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <div>
                                        <h3 className="font-bold">1. Отключение мусорных площадок</h3>
                                        <p className="subtitle" style={{ marginTop: "0.25rem" }}>ИИ выявил сайты с показателем отказов {">"} 80%</p>
                                    </div>
                                    <div className={`toggle on`}>
                                        <div className="toggle-dot" />
                                    </div>
                                </div>
                                <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", fontFamily: "monospace", color: "#EF4444" }}>
                                    - m.avito.ru<br />
                                    - dzen.ru/games<br />
                                    - 1000dosok.ru
                                </div>
                            </div>

                            {/* Recommendation 2: Rewrite Ads */}
                            <div className="card" style={{ margin: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <div>
                                        <h3 className="font-bold">2. Улучшение кликабельности текстов (CTR)</h3>
                                        <p className="subtitle" style={{ marginTop: "0.25rem" }}>ИИ предлагает более агрессивные офферы</p>
                                    </div>
                                    <div className={`toggle on`}>
                                        <div className="toggle-dot" />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{ background: "#F3F4F6", padding: "1.5rem", borderRadius: "12px", opacity: 0.7 }}>
                                        <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Купить квартиру в Москве</div>
                                        <div style={{ fontSize: "0.85rem", color: "#666" }}>Продаем квартиры в новостройках. Звоните нам.</div>
                                        <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}>Текущий CTR: 1.2%</div>
                                    </div>

                                    <ArrowRight color="var(--text-light)" />

                                    <div style={{ background: "#ECFDF5", padding: "1.5rem", borderRadius: "12px", border: "1px solid #A7F3D0" }}>
                                        <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#065F46" }}>Квартиры в Москве от 8 млн ₽ | Ипотека 4%</div>
                                        <div style={{ fontSize: "0.85rem", color: "#065F46" }}>Закрытый двор, парк у дома. Скидка 10% до конца месяца. Успейте забронировать!</div>
                                        <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>Прогноз CTR: ~4.5%</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                                <button className="btn-dark" onClick={applyChanges} style={{ gap: "0.5rem", display: "flex", alignItems: "center" }}>
                                    <CheckCircle2 size={18} /> Применить изменения (API)
                                </button>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </>
    );
}
