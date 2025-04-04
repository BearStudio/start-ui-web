import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/_layout/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/user/"!</div>
}
