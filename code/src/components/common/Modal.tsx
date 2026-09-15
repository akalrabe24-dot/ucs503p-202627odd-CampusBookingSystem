import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'; }
export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = '2xl' }: ModalProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (isOpen && element && !element.open) element.showModal();
    if (!isOpen && element?.open) element.close();
  }, [isOpen]);
  useEffect(() => { if (!isOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [isOpen]);
  return <dialog ref={dialog} className={`portal-dialog legacy-route dialog-${maxWidth}`} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose(); } }}><div className="dialog-heading"><div><span className="eyebrow">CAMPUS RESERVE</span><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button onClick={onClose} aria-label="Close dialog"><X size={22} /></button></div>{isOpen && <div className="dialog-body">{children}</div>}</dialog>;
};
