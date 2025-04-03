import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/repository/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/repository/"!</div>
}
