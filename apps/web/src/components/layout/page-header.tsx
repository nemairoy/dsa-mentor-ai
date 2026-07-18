type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function PageHeader({ title, description, eyebrow = "DSA Mentor AI" }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <nav className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground" aria-label="Breadcrumb">
        {eyebrow} / <span className="text-foreground">{title}</span>
      </nav>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-normal md:text-xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
