export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiKey {
    service: string;
    masked_key: string;
    is_configured: boolean;
}

export const api = {
    settings: {
        async getKeys(): Promise<ApiKey[]> {
            const res = await fetch(`${API_BASE_URL}/settings/keys`);
            if (!res.ok) throw new Error("Ошибка при загрузке ключей");
            return res.json();
        },
        async saveKey(service: string, apiKey: string) {
            const res = await fetch(`${API_BASE_URL}/settings/keys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service, api_key: apiKey }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Ошибка при сохранении ключа");
            }
            return res.json();
        },
    },
    direct: {
        async getCampaigns() {
            // Идем на наш проксирующий бекенд
            const res = await fetch(`${API_BASE_URL}/direct/campaigns`);
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Ошибка при загрузке кампаний из Яндекс.Директа");
            }
            return res.json();
        }
    },
    llm: {
        async generate(provider: string, prompt: string, system_prompt?: string) {
            const res = await fetch(`${API_BASE_URL}/llm/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    prompt,
                    system_prompt,
                    temperature: 0.7,
                    max_tokens: 2000
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Ошибка генерации текста");
            }
            return res.json();
        }
    }
};
