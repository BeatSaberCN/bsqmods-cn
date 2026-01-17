import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const mods = await import("./mods.json")

console.log(mods)
createRoot(document.getElementById('root')!).render(
  <div>woops</div>
)
