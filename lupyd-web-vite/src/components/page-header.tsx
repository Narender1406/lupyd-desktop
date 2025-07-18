interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center mb-12">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h1>
      <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">{description}</p>
    </div>
  )
}

