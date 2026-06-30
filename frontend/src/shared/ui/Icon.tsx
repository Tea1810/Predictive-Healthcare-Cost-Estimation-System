import type { CSSProperties } from 'react'

const svgs = import.meta.glob('../icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export default function Icon({
  name,
  size = 24,
  color = 'currentColor',
  style,
}: {
  name: string
  size?: number
  color?: string
  style?: CSSProperties
}) {
  const raw = svgs[`../icons/${name}.svg`]
  if (!raw) return null
  const svg = raw.replace('<svg ', `<svg width="${size}" height="${size}" `)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
