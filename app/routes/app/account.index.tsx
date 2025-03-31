import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/account/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/account/"!</div>
}
