type Props = {
  width?: number | string
  height?: number | string
  radius?: number
}

export default function Skeleton({ width = '100%', height = 12, radius = 6 }: Readonly<Props>) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-loading 1.4s ease infinite',
      }}
    />
  )
}
