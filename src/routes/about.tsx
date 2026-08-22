import { createFileRoute } from "@tanstack/react-router";
import aboutImg from "@/assets/about-hunza.jpg";
import heroImg from "@/assets/hero-hunza.jpg";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hunza & Co." },
      {
        name: "description",
        content:
          "The story of Hunza — its culture, organic farming, traditional craftsmanship, and the families we work with.",
      },
      { property: "og:title", content: "About Hunza & Co." },
      {
        property: "og:description",
        content: "The story behind our sourcing, our valleys, and the families we work with.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Hunza valley" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-background" />
        </div>
        <div className="container-x flex min-h-[60vh] flex-col justify-end pb-16 pt-40 text-white">
          <div className="text-xs uppercase tracking-widest text-white/80">Our Story</div>
          <h1 className="mt-2 max-w-2xl font-display text-4xl md:text-6xl">
            A quiet valley. A slow way of making.
          </h1>
        </div>
      </section>

      <section className="container-x grid gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <div className="prose prose-neutral max-w-none text-muted-foreground">
          <p className="text-lg leading-relaxed text-foreground">
            Hunza & Co. began with a simple idea: connect the world with the extraordinary food and
            craft of Hunza — while making sure the families who grow and make these products share
            fairly in the value.
          </p>
          <p className="mt-6 leading-relaxed">
            Hunza sits high in the Karakoram, surrounded by 7,000-metre peaks. For centuries, its
            people have farmed apricots, walnuts and mulberries on terraced slopes, and woven wool
            caps and shawls beside wood-fired stoves. Everything is slow, seasonal, and deeply
            careful.
          </p>
          <p className="mt-6 leading-relaxed">
            We work directly with growers and artisan collectives — no middlemen, no anonymous
            supply chains. Every product is traceable to the family or workshop that made it.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
          <img src={aboutImg} alt="Artisan at loom" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-x">
          <h2 className="max-w-2xl font-display text-3xl md:text-4xl">What we stand for</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                t: "Rich culture",
                b: "We celebrate the traditions and languages that have shaped Hunza for centuries.",
              },
              {
                t: "Organic farming",
                b: "Grown without chemicals in glacial water and mountain air.",
              },
              {
                t: "Traditional craft",
                b: "Weaving, knitting and woodwork done by hand, the way it's always been done.",
              },
              {
                t: "Local families",
                b: "Fair, direct payments so making a living from craft is possible again.",
              },
              {
                t: "Sustainable sourcing",
                b: "Small batches, reusable packaging, and shipping we can be proud of.",
              },
              {
                t: "Honest pricing",
                b: "We show you the value — no marketing tricks, no inflated tags.",
              },
            ].map((v) => (
              <div key={v.t}>
                <h3 className="font-display text-xl">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
