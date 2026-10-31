import { DeskProvider } from './desk.jsx'
import Shell from './components/Shell.jsx'

export default function App() {
  return (
    <DeskProvider>
      <Shell />
    </DeskProvider>
  )
}
