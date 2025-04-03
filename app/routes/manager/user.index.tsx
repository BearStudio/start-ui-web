import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/user/"!</div>
}
