import React from "react";
export default function productItem({ product, user, onEdit, onDelete }) {
    return (
        <div className="productRow">
            <div className="productImage">
                <img src={product.image} alt={product.name}/>
            </div>
            <div className="productMain">
                <div className="productId">#{product.id}</div>
                <div className="productName">{product.name}</div>
                <div className="productCategory">{product.category}</div>
                <div className="productDescription">{product.description}</div>
                <div className="productQuantity">Осталось: {product.quantity}</div>
                <div className="productCost">{product.cost} рублей</div>
            </div>
            <div className="productActions">
                {(user?.role === "seller" || user?.role === "admin") && (
                    <button className="btn" onClick={() => onEdit(product)}>
                        Редактировать
                    </button>
                )}
                {user?.role === "admin" && (
                    <button className="btn btn--danger" onClick={() =>
                        onDelete(product.id)}>
                        Удалить
                    </button>
                )}
            </div>
        </div>
    );
}