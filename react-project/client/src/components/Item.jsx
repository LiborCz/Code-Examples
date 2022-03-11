import React from "react";

function Item({ id, title, text, onDelete }) {

  const onDelClick = () => onDelete(id);

  return (
    <div className="note">
      <h1>{title}</h1>
      <p>{text}</p>
      <button onClick={onDelClick}>DEL</button>
    </div>
  );
}

export default Item;
