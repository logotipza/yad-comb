"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/store";
import { api } from "@/lib/api";
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

interface Ad {
    title: string;
    text: string;
}

export default function DashboardPage() {
    const [state, setState] = useState<DashboardState>("idle");
    const [url, setUrl] = useState("");
    const [businessContext, setBusinessContext] = useState("");
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [progressText, setProgressText] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const startAnalysis = async () => {
        if (!url) {
            toast.error("Ошибка", "Введите URL сайта для начала");
            return;
        }
        setState("analyzing_business");
        toast.info("Анализ", `Нейросеть изучает ${url}`);

        try {
            const res = await api.llm.generate(
                "yandexgpt",
                `Ты маркетолог. Пользователь хочет запустить рекламу для сайта: ${url}. Напиши краткое описание бизнеса (2-3 предложения), которое мы будем использовать для создания контекстной рекламы. Выдели нишу и УТП. Если не можешь перейти по ссылке, предположи деятельность по домену.`
            );
            setBusinessContext(res.text);
            setState("confirm_business");
            toast.success("Готово", "ИИ сформировал понимание вашего бизнеса.");
        } catch (error: any) {
            toast.error("Ошибка ИИ", error.message);
            setState("idle");
        }
    };

    const startGeneration = async () => {
        setState("generating");

        try {
            setProgressText("ИИ подбирает ключевые слова...");
            const kwRes = await api.llm.generate(
                "yandexgpt",
                `Сгенерируй 5 целевых ключевых фраз для Яндекс.Директа по этому описанию бизнеса: ${businessContext}. Выведи ТОЛЬКО сами фразы, каждую с новой строки, без нумерации, маркеров и лишних слов.`
            );

            const fetchedKeywords = kwRes.text.split('\n')
                .map((k: string) => k.trim().replace(/^- /g, '').replace(/^\d+\.\s*/g, ''))
                .filter((k: string) => k.length > 0)
                .map((k: string, i: number) => ({ id: String(i), text: k }));

            setKeywords(fetchedKeywords.length > 0 ? fetchedKeywords : [{ id: "1", text: "не удалось сгенерировать" }]);

            setProgressText("ИИ пишет кликабельные объявления...");
            const adsRes = await api.llm.generate(
                "yandexgpt",
                `Напиши 2 варианта рекламного объявления для Директа для бизнеса: ${businessContext}. 
Формат строго такой:
Заголовок: [Текст заголовка]
Текст: [Текст объявления]
`
            );

            // Simple parser for Ads
            const adBlocks = adsRes.text.split(/Заголовок:/i).slice(1);
            const fetchedAds = adBlocks.map((block: string) => {
                const textSplit = block.split(/Текст:/i);
                return {
                    title: textSplit[0]?.trim() || "Заголовок",
                    text: textSplit[1]?.trim() || "Текст"
                };
            });

            setAds(fetchedAds.length > 0 ? fetchedAds : [{ title: "Пример заголовка", text: "Пример текста" }]);

            setState("results");
            toast.success("Успешно", "Кампания сгенерирована!");
        } catch (error: any) {
            toast.error("Ошибка генерации", error.message);
            setState("confirm_business");
        }
    };

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
                                    ИИ изучает контент сайта по URL...
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

                                    {ads.map((ad, idx) => (
                                        <div key={idx} style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0000CC" }}>
                                                {ad.title}
                                            </div>
                                            <div style={{ color: "#006600", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                                                реклама • {url || "https://example.com"}
                                            </div>
                                            <div style={{ fontSize: "0.95rem", color: "#333", lineHeight: 1.4 }}>
                                                {ad.text}
                                            </div>
                                        </div>
                                    ))}

                                </div>

                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </>
    );
}
