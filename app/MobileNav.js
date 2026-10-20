"use client";

import { useEffect, useRef, useState } from "react";

export function MobileNav({ links, openLabel, closeLabel, navLabel }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const menu = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    menu.current?.querySelector("a")?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="nav-burger"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <span className={"burger-icon" + (open ? " is-open" : "")} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      {open && <button type="button" className="nav-backdrop" aria-label={closeLabel} onClick={() => setOpen(false)} />}
      <nav ref={menu} id="site-menu" className={"links" + (open ? " is-open" : "")} aria-label={navLabel}>
        {links.map((item) => (
          <a key={item.href + item.label} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
