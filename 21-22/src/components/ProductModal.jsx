import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    // Состояния для всех полей товара
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (!open) return;
        // Синхронизируем поля при открытии
        setName(initialProduct?.name ?? "");
        setCost(initialProduct?.cost != null ? String(initialProduct.cost) : "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setQuantity(initialProduct?.quantity != null ? String(initialProduct.quantity) : "");
        setImage(initialProduct?.image != null ? String(initialProduct.image) : "")
    }, [open, initialProduct]);

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const parsedCost = Number(cost);
        const parsedQuantity = Number(quantity);

        // Валидация
        if (!trimmedName) {
            alert("Введите название");
            return;
        }
        if (isNaN(parsedCost) || parsedCost < 0) {
            alert("Введите корректную стоимость");
            return;
        }
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            alert("Введите корректное количество");
            return;
        }

        // Отправляем объект со всеми новыми переменными
        onSubmit({
            id: initialProduct?.id,
            name: trimmedName,
            cost: parsedCost,
            category: category.trim(),
            description: description.trim(),
            quantity: parsedQuantity,
            image: image !== ""? image : "https://rusles-35.ru/bitrix/templates/rusles_new/img/icon/no-photo.png"
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </label>

                    <label className="label">
                        Категория
                        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Например, Смартфоны" />
                    </label>

                    <label className="label">
                        Описание
                        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание товара..." rows="3" />
                    </label>

                    <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                        <label className="label" style={{ flex: 1 }}>
                            Стоимость
                            <input className="input" value={cost} onChange={(e) => setCost(e.target.value)} inputMode="numeric" />
                        </label>

                        <label className="label" style={{ flex: 1 }}>
                            Количество
                            <input className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" />
                        </label>
                    </div>
                    <label className="label">
                        URL фото
                        <input className="input" value={image} onChange={(e) => setImage(e.target.value)} />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}