import { useEffect, useRef, useState } from "react";
import style from "../../styles/components/yearPicker.module.css";

type YearPickerProps = {
  value: number;
  years: number[];
  onChange: (year: number) => void;
};

function YearPicker({ value, years, onChange }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div className={style.wrapper} ref={rootRef}>
      <button
        type="button"
        className={style.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
      </button>

      {open && (
        <ul className={style.menu} role="listbox" aria-label="Select year">
          {years.map((year) => (
            <li key={year}>
              <button
                type="button"
                className={`${style.option} ${year === value ? style.active : ""}`}
                onClick={() => {
                  onChange(year);
                  setOpen(false);
                }}
              >
                {year}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default YearPicker;
