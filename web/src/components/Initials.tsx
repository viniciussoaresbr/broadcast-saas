type InitialsProps = {
  name: string
  size?: 'sm' | 'md'
}

const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}

/** Rounded-square monogram for connections and contacts. Decorative: the name is always next to it. */
const Initials = ({ name, size = 'md' }: InitialsProps) => (
  <span
    aria-hidden
    className={`grid shrink-0 place-items-center rounded-lg bg-tone-200 font-semibold text-ink ${
      size === 'sm' ? 'size-7 text-[0.6875rem]' : 'size-9 text-xs'
    }`}
  >
    {initialsOf(name)}
  </span>
)

export default Initials
