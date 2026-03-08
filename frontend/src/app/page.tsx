"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/lib/store";

export default function AuthPage() {
  const router = useRouter();

  const handleLogin = () => {
    toast.info("Внимание", "В режиме MVP токены добавляются вручную. Перенаправляем...");
    setTimeout(() => {
      router.push("/settings");
    }, 1500);
  };

  return (
    <div className="screen-center">
      {/* Top Header */}
      <header className="header-top">
        <div className="logo-group">
          <div className="logo-mark" />
          <div className="logo-text">ЯД Оптимизатор</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="card">
        <div className="text-center" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h1 className="title font-extrabold">Добро пожаловать</h1>
          <p className="subtitle">
            Для старта работы платформы необходимо авторизоваться и предоставить гостевой доступ к кампаниям Директа.
          </p>
        </div>

        <div>
          <button className="btn btn-yandex" onClick={handleLogin} style={{ width: "100%", display: "block" }}>
            <span className="ya-icon">Я</span>
            Войти через Яндекс
          </button>
        </div>

        <p className="hint text-center">
          Мы не передаём ваши данные 3-м лицам. Используется только официальный OAuth-протокол Яндекса.
        </p>
      </main>
    </div>
  );
}
