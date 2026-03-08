"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/store";
import { api } from "@/lib/api";
import { Search, ChevronRight, AlertTriangle, CheckCircle2, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

type AuditState = "list" | "analyzing" | "results";

export default function AuditPage() {
    const [state, setState] = useState<AuditState>("list");
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const data = await api.direct.getCampaigns();

            if (data.result && data.result.Campaigns) {
                setCampaigns(data.result.Campaigns);
            } else {
                setCampaigns([]);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
            toast.error("Ошибка", error.message);
        } finally {
            setLoading(false);
        }
    };

    const startAudit = (campaign: any) => {
        setSelectedCampaign(campaign);
        setState("analyzing");

        // Эмуляция анализа кампании ИИ (В будущем подключим к /api/llm/generate)
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
                    {state === "results" && `Результаты аудита: ${selectedCampaign?.Name}`}
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
                                {loading ? (
                                    <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--brand-yellow)" />
                                    </div>
                                ) : errorMsg ? (
                                    <div style={{ textAlign: "center", padding: "2rem" }}>
                                        <AlertTriangle size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
                                        <h3 className="font-bold" style={{ marginBottom: "0.5rem" }}>Не удалось загрузить кампании</h3>
                                        <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>{errorMsg}</p>
                                        <Link href="/settings">
                                            <button className="btn-dark">Перейти в настройки</button>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                                            <div className="input-group" style={{ flex: 1 }}>
                                                <Search size={20} color="var(--text-light)" />
                                                <input type="text" className="input-field" placeholder="Поиск кампании..." style={{ border: 'none', paddingLeft: '0.5rem' }} />
                                            </div>
                                            <button className="btn-dark" onClick={loadCampaigns} style={{ padding: "0 1rem", height: "48px", background: "var(--bg-input)", color: "#000", border: "1px solid var(--border-color)" }}>
                                                <RefreshCw size={18} />
                                            </button>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                            {campaigns.length === 0 ? (
                                                <p style={{ textAlign: "center", color: "var(--text-light)", padding: "2rem" }}>Кампаний не найдено</p>
                                            ) : (
                                                campaigns.map(c => (
                                                    <div
                                                        key={c.Id}
                                                        className="setting-row"
                                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                                        onClick={() => startAudit(c)}
                                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--text-main)"}
                                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                                                    >
                                                        <div className="setting-info" style={{ width: "100%" }}>
                                                            <div className="setting-icon dark">{c.Name.charAt(0)}</div>
                                                            <div className="setting-text" style={{ flex: 1 }}>
                                                                <h4>{c.Name}</h4>
                                                                <p>Статус: {c.State} · Тип: {c.Type?.replace("_CAMPAIGN", "")}</p>
                                                            </div>
                                                            <ChevronRight color="var(--text-light)" />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
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
