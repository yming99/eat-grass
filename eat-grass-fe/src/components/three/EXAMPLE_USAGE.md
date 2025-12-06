# VegetableTrayScene Usage Example

## Basic Usage

```tsx
import VegetableTrayScene from '@/components/three/VegetableTrayScene'

function MyPage() {
  return (
    <div>
      <h1>My 3D Scene</h1>
      <VegetableTrayScene />
    </div>
  )
}
```

## With Custom Model URL

```tsx
import VegetableTrayScene from '@/components/three/VegetableTrayScene'

function MyPage() {
  return (
    <div>
      <VegetableTrayScene modelUrl="/3d/custom_model.glb" />
    </div>
  )
}
```

## Integration Example (Home Page)

```tsx
import VegetableTrayScene from '@/components/three/VegetableTrayScene'

export default function Home() {
  return (
    <div>
      <section>
        <h2>3D Vegetable Tray</h2>
        <VegetableTrayScene />
      </section>
    </div>
  )
}
```

