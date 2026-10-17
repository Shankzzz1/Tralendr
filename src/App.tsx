import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Stops pinned sections from jumping when the mobile address bar shows/hides */
ScrollTrigger.config({ ignoreMobileResize: true });

const destinations = [
  {
    name: "Kyoto, Japan",
    detail: "Quiet streets, small cafés and an unhurried pace.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
    days: "5 days",
  },
  {
    name: "Amalfi Coast, Italy",
    detail: "Coastal towns, long lunches and sea air.",
    image:
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1200&q=85",
    days: "3 days",
  },
  {
    name: "Dolomites, Italy",
    detail: "Alpine trails, mountain huts and wide views.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
    days: "4 days",
  },
];

const itinerary = [
  {
    day: "Day 1",
    place: "Positano",
    note: "Old town walk and sunset by the sea",
    tone: "blue",
  },
  {
    day: "Day 2",
    place: "Path of the Gods",
    note: "Morning hike and a long lunch",
    tone: "teal",
  },
  {
    day: "Day 3",
    place: "Amalfi and Ravello",
    note: "Lemon groves, gardens and viewpoints",
    tone: "slate",
  },
];



const navLinks = [
  { label: "Why Tralendr", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Destinations", href: "#explore" },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Tralendr home">
      tralendr<span>.</span>
    </a>
  );
}

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=90",
    alt: "Mediterranean coastal village with white buildings and blue water",
    title: "Greek Islands",
    note: "4 days, sea views, slow mornings",
    progress: 72,
  },
  {
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=90",
    alt: "Quiet street in Kyoto",
    title: "Kyoto, Japan",
    note: "5 days, small cafés, unhurried pace",
    progress: 55,
  },
  {
    image:
      "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1600&q=90",
    alt: "Amalfi Coast town above the sea",
    title: "Amalfi Coast",
    note: "3 days, long lunches, sea air",
    progress: 40,
  },
  {
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=90",
    alt: "Dolomites mountain landscape",
    title: "Dolomites, Italy",
    note: "4 days, alpine trails, wide views",
    progress: 85,
  },
];

/* Where each card sits in the stack. Slot 0 = front. */
const SLOTS = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 4 },
  { x: 22, y: -14, rotate: 3.5, scale: 0.95, opacity: 1, zIndex: 3 },
  { x: 42, y: -26, rotate: 7, scale: 0.9, opacity: 0.8, zIndex: 2 },
  { x: 56, y: -34, rotate: 10, scale: 0.86, opacity: 0, zIndex: 1 },
];

function HeroRight() {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const floatRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const order = useRef(heroSlides.map((_, i) => i)); // order[0] = front card
  const busy = useRef(false);
  const paused = useRef(false);
  const firstRender = useRef(true);
  const [active, setActive] = useState(0);

  const { contextSafe } = useGSAP({ scope: wrap });

  /* Preload so a card never pops in blank */
  useEffect(() => {
    heroSlides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  /* Initial stack layout */
  useGSAP(
    () => {
      order.current.forEach((cardIndex, slot) => {
        gsap.set(cards.current[cardIndex], SLOTS[slot]);
      });
      if (barRef.current)
        gsap.set(barRef.current, { width: `${heroSlides[0].progress}%` });
    },
    { scope: wrap },
  );

  /* Card change: pull the next card from behind to the front */
  const next = useCallback(
    contextSafe(() => {
      if (busy.current) return;
      busy.current = true;

      const [front, incoming, ...rest] = order.current;
      const newOrder = [incoming, ...rest, front];
      order.current = newOrder;

      const frontEl = cards.current[front];
      const incomingEl = cards.current[incoming];
      const last = SLOTS.length - 1;

      const tl = gsap.timeline({
        onComplete: () => {
          newOrder.forEach((cardIndex, slot) =>
            gsap.set(cards.current[cardIndex], { zIndex: SLOTS[slot].zIndex }),
          );
          busy.current = false;
        },
      });

      /* Incoming card is "picked" from behind: lifts, squashes, then pops to front */
      tl.set(incomingEl, { zIndex: 6 }, 0)
        .set(frontEl, { zIndex: 5 }, 0)
        .to(
          incomingEl,
          {
            y: -46,
            x: 10,
            rotate: -3,
            scale: 1.04,
            duration: 0.3,
            ease: "power2.out",
          },
          0,
        )
        .to(
          incomingEl,
          {
            ...SLOTS[0],
            zIndex: 6,
            duration: 1.1,
            ease: "elastic.out(1, 0.55)",
          },
          0.3,
        );

      /* Old front card peels away, then tucks to the back with a bounce */
      tl.to(
        frontEl,
        {
          x: -80,
          y: 24,
          rotate: -9,
          scale: 0.97,
          duration: 0.3,
          ease: "power2.in",
        },
        0,
      )
        .set(frontEl, { zIndex: 0 }, 0.3)
        .to(
          frontEl,
          { ...SLOTS[last], zIndex: 0, duration: 0.8, ease: "back.out(1.8)" },
          0.3,
        );

      /* Cards in between step forward one slot, slightly staggered */
      rest.forEach((cardIndex, i) => {
        const slot = i + 1; // slot they were at before moving up
        tl.to(
          cards.current[cardIndex],
          {
            ...SLOTS[slot],
            zIndex: SLOTS[slot].zIndex,
            duration: 0.8,
            ease: "back.out(1.6)",
          },
          0.32 + i * 0.06,
        );
      });

      /* Swap the tag content once the new card starts landing */
      tl.call(() => setActive(incoming), undefined, 0.3);
    }),
    [contextSafe],
  );

  /* Tag content: bubbly swap */
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      gsap.fromTo(
        ".trip-swap",
        { y: 18, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.07,
          ease: "back.out(2)",
        },
      );
      gsap.fromTo(
        floatRef.current,
        { scale: 0.93 },
        { scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
      );
      gsap.to(barRef.current, {
        width: `${heroSlides[active].progress}%`,
        duration: 0.9,
        ease: "elastic.out(1, 0.7)",
      });
    },
    { dependencies: [active], scope: wrap },
  );

  /* Autoplay (respects reduced motion, pauses on hover and hidden tab) */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current && !document.hidden) next();
    }, 4800);
    return () => window.clearInterval(id);
  }, [next]);

  const slide = heroSlides[active];

  return (
    <div
      ref={wrap}
      className="hero-right"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div
        className="hero-art"
        onClick={next}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured trips"
      >
        {heroSlides.map((s, i) => (
          <div
            className="hero-card"
            key={s.title}
            ref={(el) => {
              cards.current[i] = el;
            }}
          >
            <img className="hero-art-image" src={s.image} alt={s.alt} />
          </div>
        ))}
      </div>

      <div className="trip-float" ref={floatRef} aria-live="polite">
        <div className="trip-float-top">
          <span className="mini-label">Sample itinerary</span>
          <Bookmark size={16} />
        </div>
        <div className="trip-title-row">
          <div>
            <h3 className="trip-swap">{slide.title}</h3>
            <p className="trip-swap">{slide.note}</p>
          </div>
          <span className="trip-arrow">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="trip-progress">
          <span ref={barRef} />
        </div>
      </div>
    </div>
  );
}
function App() {
  const rollWords = ["Wanderer", "Foodie", "Hiker", "Planner"];
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState(
    "A slow 4-day trip to Portugal, great food and coastal walks.",
  );
  const [tripReady, setTripReady] = useState(false);
  const [saved, setSaved] = useState(false);

  /* Smooth scrolling, synced with ScrollTrigger */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    /* Any in-page link (#why, #how, #start, #top...) scrolls smoothly */
    const onAnchorClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target =
        hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
      if (target === null) return;

      e.preventDefault();

      /* Longer trips take a bit longer, within sensible limits */
      const targetY =
        target === 0
          ? 0
          : target.getBoundingClientRect().top + window.scrollY;
      const distance = Math.abs(targetY - window.scrollY);

      lenis.scrollTo(target, {
        offset: 0,
        duration: Math.min(2.4, Math.max(1.2, distance / 2500)),
        easing: (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* Mobile menu: scroll lock, Escape to close, auto-close when resized to desktop */
  useEffect(() => {
    if (!menuOpen) return;
    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 850px)");
    const onMq = () => {
      if (mq.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);

    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.body.style.overflow = "";
      lenisRef.current?.start();
    };
  }, [menuOpen]);

  /* Mobile menu: circular reveal from the toggle + staggered links */
  const menuFirst = useRef(true);
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    /* classList (not React className) so it never wipes nav--scrolled */
    el.querySelector(".nav")?.classList.toggle("nav--open", menuOpen);

    if (menuFirst.current) {
      menuFirst.current = false;
      return;
    }

    const menu = el.querySelector<HTMLElement>(".mobile-menu");
    const toggle = el.querySelector<HTMLElement>(".menu-toggle");
    if (!menu || !toggle) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const r = toggle.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const radius =
      Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy),
      ) + 24;
    const from = `circle(0px at ${cx}px ${cy}px)`;
    const full = `circle(${radius}px at ${cx}px ${cy}px)`;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (reduced) {
        tl.set(
          menu,
          menuOpen
            ? { visibility: "visible", pointerEvents: "auto", clipPath: "none" }
            : { visibility: "hidden", pointerEvents: "none" },
        );
        return;
      }

      if (menuOpen) {
        tl.set(".mm-link, .mm-foot", { clearProps: "opacity,transform" }, 0)
          .set(menu, { visibility: "visible", pointerEvents: "auto" }, 0)
          .fromTo(
            menu,
            { clipPath: from },
            { clipPath: full, duration: 0.8, ease: "power3.inOut" },
            0,
          )
          .fromTo(
            ".mm-label-inner",
            { yPercent: 115 },
            { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power4.out" },
            0.3,
          )
          .fromTo(
            ".mm-index, .mm-arrow",
            { opacity: 0 },
            { opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" },
            0.4,
          )
          .fromTo(
            ".mm-rule",
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" },
            0.35,
          )
          .fromTo(
            ".mm-foot > *",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
            0.6,
          )
          .set(menu, { clipPath: "none" });
      } else {
        tl.to(
          ".mm-link, .mm-foot",
          { opacity: 0, y: -12, duration: 0.25, stagger: 0.03, ease: "power2.in" },
          0,
        )
          .fromTo(
            menu,
            { clipPath: full },
            { clipPath: from, duration: 0.6, ease: "power3.inOut" },
            0.12,
          )
          .set(menu, { visibility: "hidden", pointerEvents: "none" })
          .set(".mm-link, .mm-foot", { clearProps: "opacity,transform" });
      }
    }, el);

    return () => ctx.kill();
  }, [menuOpen]);

  useGSAP(
    () => {
      /* Always on: nav state + scroll progress (not decorative motion) */
      ScrollTrigger.create({
        start: 24,
        end: "max",
        onUpdate: (self) => {
          root.current
            ?.querySelector(".nav")
            ?.classList.toggle("nav--scrolled", self.scroll() > 24);
        },
      });

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop:
            "(min-width: 850px) and (prefers-reduced-motion: no-preference)",
          mobile:
            "(max-width: 849px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { mobile, desktop } = context.conditions as {
            mobile: boolean;
            desktop: boolean;
          };
          const reveal = (
            targets: gsap.TweenTarget,
            trigger: Element | string,
            vars: gsap.TweenVars = {},
          ) =>
            gsap.from(targets, {
              y: 28,
              opacity: 0,
              duration: 0.8,
              ease: "power2.out",
              ...vars,
              scrollTrigger: { trigger, start: "top 82%", once: true },
            });

          /* Page progress bar */
          gsap.to(".scroll-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          });

          /* 1. Navigation */
          gsap.from(".nav-inner", {
            y: -16,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
          });

          /* 2. Hero: one load sequence, then parallax on scroll */
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(
              ".hero-title .line-inner",
              { yPercent: 110, duration: 0.9, stagger: 0.12 },
              0.1,
            )
            .from(
              ".hero-eyebrow, .hero-copy, .hero-actions, .hero-footnote",
              { y: 18, opacity: 0, duration: 0.7, stagger: 0.1 },
              0.35,
            )
            .from(
              ".hero-art",
              {
                clipPath: "inset(8% 8% 8% 8% round 20px)",
                opacity: 0,
                duration: 1,
                ease: "power2.out",
              },
              0.2,
            )
            .from(".trip-float", { y: 24, opacity: 0, duration: 0.7 }, 0.9);

          gsap.to(".hero-art-image", {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
          gsap.to(".hero-left", {
            y: -40,
            opacity: 0.2,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "center top",
              end: "bottom top",
              scrub: true,
            },
          });

          /* 3. Rolling words (pinned) */
          if (desktop) {
            /* Desktop: original vertical word roll, unchanged */
            const items = gsap.utils.toArray<HTMLElement>(".roll-item");
            const last = items.length - 1;
            const paint = (p: number) => {
              const lh = items[0].offsetHeight;
              gsap.set(".roll-list", { y: -p * lh });
              items.forEach((el, i) => {
                const d = i - p; // below the line > 0, on the line 0, above < 0
                const above = Math.max(0, -d);
                gsap.set(el, {
                  color: gsap.utils.interpolate(
                    "#b8b8c0",
                    "#e5383b",
                    Math.max(0, 1 - above),
                  ),
                  opacity:
                    d >= 1
                      ? 0
                      : d > 0
                        ? 1 - d
                        : Math.max(0, 1 - above * 0.35),
                });
              });
              gsap.set(".roll-sub", {
                opacity: gsap.utils.clamp(0, 1, (p - (last - 0.5)) / 0.5),
              });
            };
            paint(0);
            ScrollTrigger.create({
              trigger: ".roll",
              start: "top top",
              end: () => `+=${items.length * 40}%`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => paint(self.progress * last),
            });
          }

          if (mobile) {
            /* Mobile: pinned horizontal text marquee with pop-in chips */
            const rows = gsap.utils.toArray<HTMLElement>(".rm-row");
            const chips = gsap.utils.toArray<HTMLElement>(".rm-chip");

            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: ".roll",
                start: "top top",
                end: "+=260%",
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            /* Rows slide sideways, alternating direction */
            rows.forEach((row, i) => {
              const dist = () =>
                Math.max(0, row.offsetWidth - window.innerWidth);
              const toLeft = i % 2 === 0;
              tl.fromTo(
                row,
                { x: () => (toLeft ? 0 : -dist()) },
                { x: () => (toLeft ? -dist() : 0), duration: 1 },
                0,
              );
            });

            /* Chips pop in one after another with a small tilt */
            tl.fromTo(
              chips,
              { scale: 0.55, opacity: 0, rotate: -10 },
              {
                scale: 1,
                opacity: 1,
                rotate: (i: number) => (i % 2 ? 3 : -3),
                duration: 0.2,
                stagger: 0.18,
                ease: "back.out(2.2)",
              },
              0,
            );

            /* Closing line */
            tl.fromTo(
              ".rm-sub",
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.2 },
              0.8,
            );
          }

          /* 4. How it works: pinned and scrubbed on desktop AND mobile
             (mobile gets a shorter scroll distance and a compact layout in CSS) */
          const story = gsap.timeline({
            scrollTrigger: {
              trigger: ".story-section",
              start: "top top",
              end: mobile ? "+=1100" : "+=1500",
              pin: ".story-sticky",
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          story
            .fromTo(
              ".story-kicker",
              { opacity: 0.3, x: -16 },
              { opacity: 1, x: 0, duration: 0.18 },
              0,
            )
            .fromTo(
              ".story-heading .word",
              { yPercent: 110, opacity: 0 },
              { yPercent: 0, opacity: 1, stagger: 0.12, duration: 0.35 },
              0,
            )
            .fromTo(
              ".story-copy, .story-step",
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.1, duration: 0.25 },
              0.2,
            )
            .fromTo(
              ".itinerary-window",
              { y: 70, scale: 0.94, opacity: 0 },
              { y: 0, scale: 1, opacity: 1, duration: 0.5 },
              0.12,
            )
            .fromTo(
              ".route-path",
              { strokeDashoffset: 420 },
              { strokeDashoffset: 0, duration: 0.55 },
              0.35,
            )
            .fromTo(
              ".route-pin",
              { scale: 0, transformOrigin: "center" },
              { scale: 1, stagger: 0.09, duration: 0.18 },
              0.5,
            )
            .fromTo(
              ".itinerary-row",
              { x: 24, opacity: 0 },
              { x: 0, opacity: 1, stagger: 0.12, duration: 0.24 },
              0.58,
            );

          /* 5. Destinations */
          reveal(".destinations .section-heading > *", ".destinations", {
            stagger: 0.1,
          });
          gsap.from(".destination-card", {
            y: 48,
            opacity: 0,
            duration: 0.8,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".destination-grid",
              start: "top 82%",
              once: true,
            },
          });
          gsap.utils
            .toArray<HTMLElement>(".destination-card img")
            .forEach((img) => {
              gsap.fromTo(
                img,
                { yPercent: -6 },
                {
                  yPercent: 6,
                  ease: "none",
                  scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            });
          reveal(".destination-foot", ".destination-foot", { y: 16 });

          /* 6. Planner */
          reveal(".planner-copy > *", ".planner", { stagger: 0.1 });
          reveal(".planner-card", ".planner-card", { y: 40, duration: 0.9 });

          /* 7. Closing call to action */
          gsap.from(".closing-inner > *", {
            y: 24,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".closing",
              start: "top 75%",
              once: true,
            },
          });

          /* 8. Footer */
          gsap.from(".footer-top > *, .footer-bottom > *", {
            y: 14,
            opacity: 0,
            stagger: 0.06,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: ".footer", start: "top 94%", once: true },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  /* Runs before the global anchor handler, so Lenis can already scroll */
  const closeMenuForLink = () => {
    lenisRef.current?.start();
    document.body.style.overflow = "";
    setMenuOpen(false);
  };

  const buildTrip = () => {
    setTripReady(true);
    window.setTimeout(() => {
      const el = document.getElementById("how");
      if (!el) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { duration: 1.6 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 220);
  };

  return (
    <div ref={root} id="top" className="site-shell">
      <div className="scroll-progress" aria-hidden="true" />

      <nav className="nav">
        <div className="nav-inner page-gutter">
          <Brand />
          <div className="nav-links">
            {navLinks.map((l) => (
              <a href={l.href} key={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <a className="nav-cta" href="#start">
            Start planning
          </a>
          <button
            className={`menu-toggle ${menuOpen ? "menu-toggle--open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className="mobile-menu" aria-hidden={!menuOpen}>
        <div className="mm-links">
          {navLinks.map((l, i) => (
            <a
              className="mm-link"
              href={l.href}
              key={l.href}
              onClick={closeMenuForLink}
            >
              <span className="mm-index">0{i + 1}</span>
              <span className="mm-label">
                <span className="mm-label-inner">{l.label}</span>
              </span>
              <ArrowUpRight className="mm-arrow" size={22} />
              <span className="mm-rule" />
            </a>
          ))}
        </div>
        <div className="mm-foot">
          <a className="button mm-cta" href="#start" onClick={closeMenuForLink}>
            Start planning <ArrowUpRight size={18} />
          </a>
          <p>Travel planning, simplified.</p>
        </div>
      </div>

      <main>
        <section className="hero page-gutter">
          <div className="hero-left">
            <p className="hero-eyebrow">
              Trip planning for individuals and small groups
            </p>
            <h1 className="hero-title">
              <span className="line">
                <span className="line-inner">Plan the trip once.</span>
              </span>
              <span className="line">
                <span className="line-inner">Travel with confidence.</span>
              </span>
            </h1>
            <p className="hero-copy">
              Tralendr turns your travel ideas into a clear day-by-day
              itinerary, so everything you need is in one place before you
              leave.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#start">
                Plan a trip <ArrowUpRight size={17} />
              </a>
              <a className="text-link" href="#how">
                See how it works <ArrowDownRight size={17} />
              </a>
            </div>
            <p className="hero-footnote">
              No account or booking required to try the demo.
            </p>
          </div>

          <HeroRight />
        </section>

        <section id="why" className="roll" aria-label="Who Tralendr is for">
          <span className="sr-only">
            Wanderer, foodie, hiker or planner? Tralendr is built for all of
            them.
          </span>

          {/* Desktop: vertical word roll */}
          <div className="roll-inner">
            <div className="roll-line">
              <span className="roll-prefix">Are you a trip</span>
              <span className="roll-window" aria-hidden="true">
                <span className="roll-size">Wanderer?</span>
                <span className="roll-list">
                  {rollWords.map((w) => (
                    <span className="roll-item" key={w}>
                      {w}?
                    </span>
                  ))}
                </span>
              </span>
            </div>
            <p className="roll-sub">
              Tralendr is built for everyone who travels.
            </p>
          </div>

          {/* Mobile: horizontal marquee */}
          <div className="roll-mobile" aria-hidden="true">
            <div className="rm-row">
              <span>Are you a trip</span>
              <span className="rm-chip rm-chip--coral">Wanderer?</span>
              <span>chasing the road less taken</span>
            </div>
            <div className="rm-row">
              <span>or a hungry</span>
              <span className="rm-chip rm-chip--sage">Foodie?</span>
              <span>hunting the best table in town</span>
            </div>
            <div className="rm-row">
              <span>maybe a</span>
              <span className="rm-chip rm-chip--sand">Hiker?</span>
              <span>after the next summit, or a</span>
              <span className="rm-chip rm-chip--ink">Planner?</span>
            </div>
            <p className="rm-sub">Tralendr is built for everyone who travels.</p>
          </div>
        </section>

        <section
          id="how"
          className="story-section"
          aria-label="How a trip comes together"
        >
          <div className="story-sticky page-gutter">
            <div className="story-left">
              <div className="story-kicker">
                <span className="eyebrow-dot" /> From idea to itinerary
              </div>
              <h2 className="story-heading">
                {["Describe it.", "Review it.", "Take it with you."].map(
                  (t) => (
                    <span className="story-line" key={t}>
                      <span className="word">{t}</span>
                    </span>
                  ),
                )}
              </h2>
              <p className="story-copy">
                One connected plan, every day mapped out, with room to adjust as
                you go.
              </p>
              <div className="story-step">
                <span className="story-step-number">
                  {tripReady ? "Ready" : "Step 1"}
                </span>
                <span>
                  {tripReady
                    ? "Your itinerary is ready to review"
                    : "A prompt becomes a plan"}
                </span>
              </div>
            </div>

            <div className="story-right">
              <div className="itinerary-window">
                <div className="itinerary-top">
                  <div>
                    <span className="mini-label">Itinerary</span>
                    <h3>
                      {tripReady ? "Portugal, your way" : "The Amalfi Coast"}
                    </h3>
                    <p>
                      {tripReady
                        ? "4 days in Portugal"
                        : "3 days in southern Italy"}
                    </p>
                  </div>
                  <button
                    className={`save-button ${saved ? "save-button--saved" : ""}`}
                    onClick={() => setSaved(!saved)}
                    aria-label={saved ? "Remove saved trip" : "Save trip"}
                    aria-pressed={saved}
                  >
                    <Bookmark
                      size={17}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="route-map">
                  <svg
                    className="route-svg"
                    viewBox="0 0 520 180"
                    preserveAspectRatio="none"
                    aria-label="Illustrated route between destinations"
                  >
                    <path
                      className="route-path"
                      d="M38 136 C88 104 106 142 165 94 S260 113 310 72 S404 100 478 34"
                      fill="none"
                      stroke="#2557d6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="420"
                      strokeDashoffset="0"
                    />
                    {[
                      [38, 136],
                      [165, 94],
                      [310, 72],
                      [478, 34],
                    ].map(([cx, cy]) => (
                      <g className="route-pin" key={`${cx}-${cy}`}>
                        <circle cx={cx} cy={cy} r="7" fill="#0b1b33" />
                        <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
                      </g>
                    ))}
                  </svg>
                  <span className="map-label map-label--one">Positano</span>
                  <span className="map-label map-label--two">Ravello</span>
                  <span className="map-label map-label--three">Amalfi</span>
                </div>

                <div className="itinerary-list">
                  {itinerary.map((item) => (
                    <div className="itinerary-row" key={item.day}>
                      <span className={`day-bubble day-bubble--${item.tone}`}>
                        {item.day}
                      </span>
                      <div className="itinerary-place">
                        <h4>{item.place}</h4>
                        <p>{item.note}</p>
                      </div>
                      <ArrowUpRight className="row-arrow" size={16} />
                    </div>
                  ))}
                </div>
                <div className="itinerary-bottom">
                  <span>
                    <Sparkles size={14} /> Sample plan
                  </span>
                  <span>Editable</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="destinations section-pad page-gutter">
          <div className="section-heading">
            <div>
              <span className="section-index">Destinations</span>
              <h2>Start from a place you already have in mind</h2>
            </div>
            <a href="#start" className="text-link">
              Plan your own <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="destination-grid">
            {destinations.map((destination) => (
              <a
                href="#start"
                className="destination-card"
                key={destination.name}
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                />
                <div className="destination-shade" />
                <span className="destination-days">{destination.days}</span>
                <div className="destination-info">
                  <h3>{destination.name}</h3>
                  <p>{destination.detail}</p>
                </div>
                <span className="destination-open">
                  <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
          </div>
          <div className="destination-foot">
            <span>Not sure where to go? Start with a feeling.</span>
            <ArrowRight size={16} />
          </div>
        </section>

        <section id="start" className="planner section-pad page-gutter">
          <div className="planner-copy">
            <span className="section-index">Try it</span>
            <h2>Describe your trip</h2>
            <p>
              Share a destination, a mood or a rough idea. We will turn it into
              a sample itinerary you can review and edit.
            </p>
          </div>
          <div className="planner-card">
            <div className="planner-card-head">
              <span className="mini-label">New trip</span>
            </div>
            <label htmlFor="trip-prompt">
              What kind of trip are you planning?
            </label>
            <textarea
              id="trip-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="A week in Japan, slow mornings, small restaurants..."
            />
            <div className="prompt-chips">
              <button
                onClick={() =>
                  setPrompt(
                    "A quiet beach escape with good food and no fixed plans.",
                  )
                }
              >
                Beach escape
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "A mountain trip with scenic hikes and comfortable stays.",
                  )
                }
              >
                Mountain trip
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "A long weekend in a city full of art, cafés and hidden streets.",
                  )
                }
              >
                City weekend
              </button>
            </div>
            <button
              className="button button-primary planner-submit"
              onClick={buildTrip}
            >
              Create sample itinerary <ArrowUpRight size={17} />
            </button>
            {tripReady && (
              <p className="planner-success" role="status">
                Your sample itinerary is ready above. Save it or adjust the
                details.
              </p>
            )}
            <p className="planner-disclaimer">
              Concept demo. No account or booking required.
            </p>
          </div>
        </section>

        <section className="closing">
          <div className="closing-inner page-gutter">
            <h2>Ready to plan your next trip?</h2>
            <p>Start with an idea and get a clear itinerary in minutes.</p>
            <a href="#start" className="button button-primary">
              Start planning <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer page-gutter">
        <div className="footer-top">
          <Brand />
          <span>Travel planning, simplified.</span>
          <a href="#top" className="back-top">
            Back to top
          </a>
        </div>
        <div className="footer-bottom">
          <span>Independent concept redesign, 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default App;