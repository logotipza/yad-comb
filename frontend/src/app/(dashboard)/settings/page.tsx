"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/store";
import { api, ApiKey } from "@/lib/api";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
    const [keys, setKeys] = useState<Record<string, ApiKey>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            const data = await api.settings.getKeys();
            const keysMap: Record<string, ApiKey> = {};
            data.forEach((k: ApiKey) => {
                keysMap[k.service] = k;
            });
            setKeys(keysMap);
        } catch (error: any) {
            toast.error("Ошибка", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (service: string) => {
        const val = formValues[service];
        if (!val) {
            toast.error("Ошибка", "Поле не может быть пустым");
            return;
        }

        setSaving(true);
        try {
            const updated = await api.settings.saveKey(service, val);
            setKeys(prev => ({ ...prev, [service]: updated }));
            setFormValues(prev => ({ ...prev, [service]: "" })); // Clear input
            toast.success("Сохранено", `Ключ для ${service} успешно обновлен`);
        } catch (error: any) {
            toast.error("Ошибка сохранения", error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 className="animate-spin" size={32} color="var(--brand-yellow)" />
            </div>
        );
    }

    const renderKeyInput = (service: string, label: string, placeholder: string = "Введите новый ключ...") => {
        const keyInfo = keys[service];
        const isConfigured = keyInfo?.is_configured;

        return (
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    {label} {isConfigured && <span style={{ color: "var(--brand-green)" }}>(Настроено: {keyInfo.masked_key})</span>}
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="password"
                        className="input-field"
                        placeholder={isConfigured ? "Введите ключ для перезаписи" : placeholder}
                        value={formValues[service] || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [service]: e.target.value }))}
                        style={{ flex: 1 }}
                    />
                    <button
                        className="btn-dark"
                        onClick={() => handleSave(service)}
                        disabled={saving || !formValues[service]}
                        style={{ padding: "0 1rem", height: "48px", borderRadius: "12px", display: "flex", gap: "0.5rem", alignItems: "center" }}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Сохранить
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="page-header">
                <h1 className="title font-extrabold">Нейросети и Интеграции</h1>
                <div className="user-profile">
                    <div className="avatar" />
                    <span className="font-bold" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        vladimir@yandex.ru
                    </span>
                </div>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem", maxWidth: "800px" }}>

                {/* YandexGPT Block */}
                <div className="card" style={{ margin: 0, padding: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div className="setting-icon dark">Y</div>
                        <div>
                            <h3 className="font-bold" style={{ fontSize: "1.1rem" }}>YandexGPT API</h3>
                            <p className="subtitle">Для генерации семантики и объявлений</p>
                        </div>
                    </div>
                    {renderKeyInput("yandexgpt", "API-ключ сервисного аккаунта")}
                    {renderKeyInput("yandex_gpt_folder_id", "Идентификатор каталога (Folder ID)")}
                </div>

                {/* GigaChat Block */}
                <div className="card" style={{ margin: 0, padding: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div className="setting-icon light" style={{ background: "#21A038", color: "#fff" }}>G</div>
                        <div>
                            <h3 className="font-bold" style={{ fontSize: "1.1rem" }}>GigaChat API</h3>
                            <p className="subtitle">Альтернативная модель от Сбера</p>
                        </div>
                    </div>
                    {renderKeyInput("gigachat", "Авторизационные данные (Credentials)")}
                    {renderKeyInput("gigachat_scope", "Scope (GIGACHAT_API_PERS или GIGACHAT_API_CORP)")}
                </div>

                {/* Yandex Direct Block */}
                <div className="card" style={{ margin: 0, padding: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div className="setting-icon light" style={{ background: "#FFCC00", color: "#000" }}>Д</div>
                        <div>
                            <h3 className="font-bold" style={{ fontSize: "1.1rem" }}>Яндекс.Директ API</h3>
                            <p className="subtitle">Для аудита и загрузки кампаний</p>
                        </div>
                    </div>
                    {renderKeyInput("yandex_direct", "OAuth-токен")}
                    {renderKeyInput("yandex_direct_login", "Логин клиента (без @yandex.ru)")}
                </div>

            </div>
        </>
    );
}
