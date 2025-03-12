import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public-only/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public-only/login"!</div>
}
