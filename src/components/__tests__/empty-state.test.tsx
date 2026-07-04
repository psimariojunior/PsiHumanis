import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "@/components/empty-state"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState icon={Users} title="Nada aqui" description="Adicione algo" />)
    expect(screen.getByText("Nada aqui")).toBeInTheDocument()
    expect(screen.getByText("Adicione algo")).toBeInTheDocument()
  })

  it("renders action button when provided", () => {
    render(
      <EmptyState
        icon={Users}
        title="Vazio"
        action={<Button onClick={() => {}}>Criar</Button>}
      />
    )
    expect(screen.getByText("Criar")).toBeInTheDocument()
  })
})
