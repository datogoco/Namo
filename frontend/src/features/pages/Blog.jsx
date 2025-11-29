import React from "react";
import { Link } from "react-router-dom";
import "./Blog.css";

const posts = [
  {
    slug: "herbal-relief-everyday-back-tension",
    title: "Herbal relief for everyday back tension",
    summary:
      "Learn how consistent topical care, gentle movement, and mindful posture can support your back throughout long workdays.",
    tag: "Wellness",
    date: "Jan 12, 2025",
    thumbnail: "/dist/img/blog/herbal-relief.jpg",
  },
  {
    slug: "patch-testing-sensitive-skin",
    title: "Patch testing: keeping sensitive skin happy",
    summary:
      "A simple 3-step patch test to make sure your skin welcomes new topical products—especially if you’re prone to irritation.",
    tag: "Skin Safety",
    date: "Jan 8, 2025",
    thumbnail: "/dist/img/blog/sensitive-skin.jpg",
  },
  {
    slug: "evening-wind-down-routine",
    title: "Evenings done right: a soothing wind-down routine",
    summary:
      "Create a calming nighttime ritual with gentle stretches, warm compresses, and targeted ointment application for better rest.",
    tag: "Recovery",
    date: "Jan 2, 2025",
    thumbnail: "/dist/img/blog/done-right.png",
  },
  {
    slug: "travel-comfort-flights-roadtrips",
    title: "Traveling with comfort: tips for flights & road trips",
    summary:
      "Small adjustments—lumbar support, micro-movements, and timed applications—can keep you comfortable when you’re on the go.",
    tag: "Lifestyle",
    date: "Dec 28, 2024",
    thumbnail: "/dist/img/blog/comfort-traveling.jpg",
  },
  {
    slug: "warm-up-rituals-long-sitting",
    title: "Warm-up rituals before long sitting sessions",
    summary:
      "Quick mobility drills to prep your spine and hips before working at a desk or sitting through meetings.",
    tag: "Movement",
    date: "Dec 20, 2024",
    thumbnail: "/dist/img/blog/warmup-ritual.jpg",
  },
  {
    slug: "hydration-and-joints",
    title: "Hydration and joints: why water matters",
    summary:
      "Staying hydrated supports tissue resilience and joint comfort—here’s how to build better hydration habits.",
    tag: "Wellness",
    date: "Dec 15, 2024",
    thumbnail: "/dist/img/blog/hydration-joints.jpg",
  },
  {
    slug: "mindful-breaks-micro-pauses",
    title: "Mindful breaks: micro-pauses for relief",
    summary:
      "Set a timer for 90-second breaks to reset posture, breathe deeply, and apply ointment where needed.",
    tag: "Habits",
    date: "Dec 10, 2024",
    thumbnail: "/dist/img/blog/mindful-breaks.jpg",
  },
  {
    slug: "layering-care-heat-ointment-stretch",
    title: "Layering care: heat, ointment, then stretch",
    summary:
      "A simple sequence to maximize comfort: warm the area, apply topicals, then follow with gentle lengthening.",
    tag: "Recovery",
    date: "Dec 6, 2024",
    thumbnail: "/dist/img/blog/layering-care.png",
  },
  {
    slug: "supportive-sleep-positions",
    title: "Supportive sleep positions for back comfort",
    summary:
      "Pillow placement and side-sleep tweaks that help your spine stay neutral overnight.",
    tag: "Sleep",
    date: "Dec 1, 2024",
    thumbnail: "/dist/img/blog/sleep-positions.jpg",
  },
  {
    slug: "outdoor-walks-reset",
    title: "Outdoor walks: the underrated reset",
    summary:
      "Light, frequent walks can reduce stiffness and boost circulation—especially when paired with mindful breathing.",
    tag: "Lifestyle",
    date: "Nov 27, 2024",
    thumbnail: "/dist/img/blog/outdoor-walks.jpg",
  },
  {
    slug: "desk-ergonomics-on-a-budget",
    title: "Desk ergonomics on a budget",
    summary:
      "Small, affordable adjustments—chair height, footrests, and screen level—that make a big difference.",
    tag: "Workspace",
    date: "Nov 22, 2024",
    thumbnail: "/dist/img/blog/desk-ergonomics.jpg",
  },
  {
    slug: "cooling-vs-warming-topicals",
    title: "Cooling vs warming topicals: when to use each",
    summary:
      "Understand the difference between cooling and warming sensations to choose the right product for your needs.",
    tag: "Guides",
    date: "Nov 18, 2024",
    thumbnail: "/dist/img/blog/cooling-vs-warming.jpg",
  },
];

function Blog() {
  return (
    <div className="blog-page">
      <header className="blog-hero">
        <div className="blog-badge">
          <span>Blog</span>
          <span>•</span>
          <span>Insights &amp; Care</span>
        </div>
        <h1 className="heading-primary" style={{ margin: "1.6rem 0 1rem" }}>
          Natural care, practical tips, real relief.
        </h1>
        <p
          style={{
            fontSize: "1.8rem",
            color: "var(--color-ink-subtle)",
            maxWidth: "720px",
          }}
        >
          Explore guidance on back care, safe product use, and routines that
          help you stay comfortable and confident every day.
        </p>
      </header>

      <main style={{ marginBottom: "3.2rem" }}>
        <div className="blog-grid">
          {posts.map((post) => (
            <Link
              key={post.title}
              to={`/blog/${post.slug}`}
              className="blog-card"
              aria-label={`Read more about ${post.title}`}
            >
              {post.thumbnail && (
                <div className="blog-card__media">
                  <img src={post.thumbnail} alt={post.title} />
                </div>
              )}
              <div className="blog-badge">
                <span>{post.tag}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
              <h2
                className="heading-tertiary"
                style={{ color: "var(--color-ink-primary)", margin: "0" }}
              >
                {post.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-ink-subtle)",
                  flexGrow: 1,
                }}
              >
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Blog;
