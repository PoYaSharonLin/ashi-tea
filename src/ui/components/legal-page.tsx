import Image from "next/image";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  heroImage?: {
    src: string;
    alt: string;
  };
}

export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
  heroImage,
}: LegalPageProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{lastUpdated}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">{intro}</p>

      {heroImage && (
        <div className="mt-8 overflow-hidden rounded-lg">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={1200}
            height={400}
            className="w-full object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {section.content}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
