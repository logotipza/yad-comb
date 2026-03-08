"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/store";
import { SortableItem } from "@/components/SortableItem";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Play, Loader2, Sparkles, Plus } from "lucide-react";

type DashboardState = "idle" | "analyzing_business" | "confirm_business" | "generating" | "results";

interface Keyword {
    id: string;
    text: string;
}

const INITIAL_KEYWORDS: Keyword[] = [
    { id: "1", text: "купить квартиру в москве" },
    { id: "2", text: "квартиры от застройщика" },
    { id: "3", text: "новостройки бизнес класс" },
    { id: "4", text: "жк премиум класс" },
];

export default function DashboardPage() {
    const [state, setState] = useState<DashboardState>("idle");
    const [url, setUrl] = useState("");
    const [businessContext, setBusinessContext] = useState("Мы продаем новостройки бизнес-класса в Москве. Наше УТП: закрытая территория, паркинг, скидка 10% до конца месяца.");
    const [keywords, setKeywords] = useState<Keyword[]>(INITIAL_KEYWORDS);
    const [progressText, setProgressText] = useState("Инициируем YandexGPT...");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const startAnalysis = () => {
        if (!url) {
            toast.error("Ошибка", "Введите URL сайта для начала");
            return;
        }
        setState("analyzing_business");
        toast.info("Анализ начат", `Нейросеть изучает контент сайта ${url}`);

        setTimeout(() => {
            setState("confirm_business");
            toast.success("Готово", "ИИ сформировал понимание вашего бизнеса. Проверьте и подтвердите.");
        }, 3000);
    };

    const startGeneration = () => {
        setState("generating");
        const steps = [
            "Подбор базы ключевых слов Wordstat...",
            "Группировка и минусация...",
            "Создание кликабельных креативов...",
            "Финальная сборка кампании..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                setProgressText(steps[i]);
                i++;
            } else {
                clearInterval(interval);
                setState("results");
                toast.success("Успешно", "Кампания сгенерирована!");
            }
        }, 1500);
    };

    useEffect(() => {
        // This useEffect is now only for cleanup if the state changes away from 'generating'
        // The interval logic is moved to startGeneration
        // However, if startGeneration is called, and then state changes, the interval needs to be cleared.
        // So, this useEffect can remain to clear any active interval if the component unmounts or state changes.
        // For now, it's effectively empty as the interval is managed within startGeneration.
        // If we want to clear the interval when state changes *from* generating, we'd need to store the interval ID.
        // For simplicity, let's assume startGeneration handles its own interval lifecycle until completion.
    }, [state]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setKeywords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeKeyword = (id: string) => {
        setKeywords(keywords.filter(k => k.id !== id));
        toast.info("Фраза удалена");
    };

    return (
        <>
            <header className="page-header">
                <h1 className="title font-extrabold">Создание кампании</h1>
                <div className="user-profile">
                    <div className="avatar" />
                    <span className="font-bold" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        vladimir@yandex.ru
                    </span>
                </div>
            </header>

            <div style={{ flex: 1, position: "relative" }}>
                <AnimatePresence mode="wait">

                    {/* STATE: IDLE */}
                    {state === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: "flex", marginTop: "2rem" }}
                        >
                            <div className="card" style={{ maxWidth: "680px", margin: 0 }}>
                                <h2 className="title font-extrabold" style={{ fontSize: "1.25rem" }}>
                                    Какой сайт будем продвигать?
                                </h2>
                                <div className="input-group">
                                    <input
                                        type="url"
                                        className="input-field"
                                        placeholder="Например: https://yoursite.ru"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                    <button className="btn-dark" onClick={startAnalysis}>
                                        ✨ Сгенерировать
                                    </button>
                                </div>
                                <p className="hint">
                                    ИИ проанализирует сайт и сформирует выжимку о вашем бизнесе перед созданием рекламы.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: ANALYZING BUSINESS */}
                    {state === "analyzing_business" && (
                        <motion.div
                            key="analyzing_business"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ marginTop: "2rem" }}
                        >
                            <div className="card" style={{ maxWidth: "800px", margin: 0, padding: "3rem 2rem", textAlign: "center" }}>
                                <div className="skeleton" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 1.5rem" }} />
                                <h2 className="title font-bold" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                                    ИИ парсит контент и изучает вашу нишу...
                                </h2>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: CONFIRM BUSINESS */}
                    {state === "confirm_business" && (
                        <motion.div
                            key="confirm_business"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ marginTop: "2rem" }}
                        >
                            <div className="card" style={{ maxWidth: "800px", margin: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", color: "var(--brand-blue)" }}>
                                    <Sparkles size={24} />
                                    <h2 className="title font-bold" style={{ fontSize: "1.25rem" }}>Вот как мы поняли ваш бизнес</h2>
                                </div>
                                <p className="subtitle" style={{ marginBottom: "1.5rem", color: "var(--text-main)" }}>
                                    ИИ сгенерирует семантику и объявления на основе этого описания. Вы можете скорректировать текст, чтобы направить нейросеть.
                                </p>
                                <textarea
                                    className="input-field"
                                    style={{ minHeight: "120px", marginBottom: "1.5rem", borderRadius: "12px", padding: "1rem", lineHeight: 1.5 }}
                                    value={businessContext}
                                    onChange={(e) => setBusinessContext(e.target.value)}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button className="btn-dark" onClick={startGeneration} style={{ height: "48px" }}>
                                        Да, все верно. Создать семантику →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: GENERATING ADS */}
                    {state === "generating" && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ marginTop: "2rem" }}
                        >
                            <div className="card" style={{ maxWidth: "800px", margin: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                    <Loader2 className="animate-spin" size={24} color="var(--brand-yellow)" />
                                    <h2 className="title font-bold" style={{ fontSize: "1.25rem" }}>
                                        {progressText}
                                    </h2>
                                </div>

                                {/* Skeletons to mimic generation process */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div className="skeleton" style={{ width: "100%", height: "24px" }} />
                                    <div className="skeleton" style={{ width: "80%", height: "24px" }} />
                                    <div className="skeleton" style={{ width: "90%", height: "24px" }} />

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                        <div className="skeleton" style={{ flex: 1, height: "120px", borderRadius: "12px" }} />
                                        <div className="skeleton" style={{ flex: 1, height: "120px", borderRadius: "12px" }} />
                                    </div>
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
                            style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px" }}
                        >

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                <div>
                                    <h2 className="title font-extrabold" style={{ marginBottom: "0.5rem" }}>
                                        Готовая кампания
                                    </h2>
                                    <p className="subtitle">
                                        Проверьте ключевые слова и креативы перед отправкой в Яндекс.Директ.
                                    </p>
                                </div>
                                <button
                                    className="btn-dark"
                                    style={{ height: "48px", borderRadius: "8px", gap: "0.5rem", display: "flex", alignItems: "center" }}
                                    onClick={() => toast.success("Кампания отправлена", "Кампания успешно создана в Яндекс.Директе!")}
                                >
                                    <Play size={16} fill="white" /> Запустить
                                </button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

                                {/* DND Keywords List */}
                                <div className="card" style={{ padding: "2rem", margin: 0, maxWidth: "100%" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                        <h3 className="font-bold">Ключевые фразы ({keywords.length})</h3>
                                        <button style={{ color: "var(--text-light)" }}>
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={keywords}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {keywords.map((k) => (
                                                <SortableItem key={k.id} id={k.id} text={k.text} onRemove={removeKeyword} />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>

                                {/* Ads Preview */}
                                <div className="card" style={{ padding: "2rem", margin: 0, maxWidth: "100%", background: "var(--bg-input)", boxShadow: "none" }}>
                                    <h3 className="font-bold" style={{ marginBottom: "1.5rem" }}>Сгенерированные объявления</h3>

                                    <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0000CC" }}>
                                            Купить квартиру в Москве — Бизнес-класс
                                        </div>
                                        <div style={{ color: "#006600", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                                            реклама • {url || "https://example.com"}
                                        </div>
                                        <div style={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.4 }}>
                                            Новостройки от надежного застройщика. Скидка 10% до конца месяца. Закрытая территория, паркинг, школа во дворе. Звоните!
                                        </div>
                                    </div>

                                    <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0000CC" }}>
                                            Квартиры от застройщика | Ипотека от 4.5%
                                        </div>
                                        <div style={{ color: "#006600", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                                            реклама • {url || "https://example.com"}
                                        </div>
                                        <div style={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.4 }}>
                                            Успейте забронировать видовую квартиру. Отделка под ключ, панорамные окна. Рядом метро и парк. Узнать цены на сайте.
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </>
    );
}
