import React, { useEffect, useState } from "react";

export default function AuthModal({ open, mode, initialUser, onClose, onSubmit }) {
    // Состояния для всех полей товара
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!open) return;
        // Синхронизируем поля при открытии
        setEmail(initialUser?.email ?? "");
        setFirstName(initialUser?.first_name ?? "");
        setLastName(initialUser?.last_name ?? "");
        setPassword(initialUser?.password ?? "");
    }, [open, initialUser]);

    if (!open) return null;

    const title = mode === "login" ? "Вход" : "Регистрация";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "login") {
            onSubmit({
                email: email,
                password: password,
            });
        } else {
            onSubmit({
                email: email,
                first_name: first_name,
                last_name: last_name,
                password: password,
            });
        }

    };
    if (mode === "login") {
        return (
            <div className="backdrop" onMouseDown={onClose}>
                <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                    <div className="modal__header">
                        <div className="modal__title">{title}</div>
                        <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
                    </div>

                    <form className="form" onSubmit={handleSubmit}>
                        <label className="label">
                            Электронная почта
                            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" autoFocus />
                        </label>

                        <label className="label">
                            Пароль
                            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </label>

                        <div className="modal__footer">
                            <button type="button" className="btn" onClick={onClose}>Отмена</button>
                            <button type="submit" className="btn btn--primary">
                                Войти
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    } else{
        return (
            <div className="backdrop" onMouseDown={onClose}>
                <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                    <div className="modal__header">
                        <div className="modal__title">{title}</div>
                        <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
                    </div>

                    <form className="form" onSubmit={handleSubmit}>
                        <label className="label">
                            Электронная почта
                            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" autoFocus />
                        </label>

                        <label className="label">
                            Имя
                            <input className="input" value={first_name} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
                        </label>

                        <label className="label">
                            Фамилия
                            <input className="input" value={last_name} onChange={(e) => setLastName(e.target.value)} placeholder="Иванович" />
                        </label>

                        <label className="label">
                            Пароль
                            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </label>

                        <div className="modal__footer">
                            <button type="button" className="btn" onClick={onClose}>Отмена</button>
                            <button type="submit" className="btn btn--primary">
                                Зарегистрироваться
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

}