"use client";

import { useState } from "react";
import { toast } from "@/lib/store";

export default function SettingsPage() {
    const [yandexActive, setYandexActive] = useState(true);
    const [gigaActive, setGigaActive] = useState(false);

    const toggleYandex = () => {
        setYandexActive(!yandexActive);
        if (!yandexActive) {
            toast.success("YandexGPT активирован", "Модель выбрана по умолчанию для генерации");
        } else {
            toast.info("YandexGPT отключен");
        }
    };

    const toggleGiga = () => {
        setGigaActive(!gigaActive);
        if (!gigaActive) {
            toast.success("GigaChat активирован", "Токен будет использоваться для генерации");
        } else {
            toast.info("GigaChat отключен");
        }
    };

    return (
        <>
            <header className="page-header">
                <h1 className="title font-extrabold">Нейросети</h1>
                <div className="user-profile">
                    <div className="avatar" />
                    <span className="font-bold" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        vladimir@yandex.ru
                    </span>
                </div>
            </header>

            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "2rem" }}>
                <div className="card" style={{ maxWidth: "800px", margin: 0, padding: "2.5rem" }}>
                    <p className="subtitle" style={{ fontSize: "0.95rem" }}>
                        Выберите, какая модель будет писать объявления для Директа. Вы можете добавить любой OpenAI-совместимый провайдер.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                        {/* YandexGPT Row */}
                        <div className={`setting-row ${yandexActive ? "active" : ""}`}>
                            <div className="setting-info">
                                <div className="setting-icon dark">Y</div>
                                <div className="setting-text">
                                    <h4>YandexGPT Pro 5.1</h4>
                                    <p className="success">Активна · Базовая интеграция</p>
                                </div>
                            </div>
                            <div className={`toggle ${yandexActive ? "on" : ""}`} onClick={toggleYandex}>
                                <div className="toggle-dot" />
                            </div>
                        </div>

                        {/* GigaChat Row */}
                        <div className={`setting-row ${gigaActive ? "active" : ""}`}>
                            <div className="setting-info">
                                <div className="setting-icon light">G</div>
                                <div className="setting-text">
                                    <h4>GigaChat Pro</h4>
                                    <p>Не авторизована · Нажмите, чтобы добавить Authorization Key</p>
                                </div>
                            </div>
                            <div className={`toggle ${gigaActive ? "on" : ""}`} onClick={toggleGiga}>
                                <div className="toggle-dot" />
                            </div>
                        </div>
                    </div>

                    <button style={{
                        marginTop: "1rem",
                        width: "max-content",
                        padding: "0 1.5rem",
                        height: "48px",
                        background: "var(--bg-input)",
                        borderRadius: "var(--radius-md)",
                        fontWeight: "700",
                        fontSize: "0.95rem"
                    }}>
                        + Добавить OpenAI-совместимую модель
                    </button>
                </div>
            </div>
        </>
    );
}
