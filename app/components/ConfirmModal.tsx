"use client";
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm deletion",
  message = "Are you sure you want to delete this item?",
}: Props) {
  return (
    <dialog className="modal" open={open}>
      <div className="modal-box rounded-xl shadow-xl">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4">{message}</p>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-error text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* background click closes modal */}
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
