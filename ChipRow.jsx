export default function ChipRow({ options, active, onChange, style }) {
  return (
    <div className="chip-row" style={style}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={'chip' + (opt === active ? ' active' : '')}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
