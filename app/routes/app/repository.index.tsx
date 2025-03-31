import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/repository/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/repository"!</div>
}
