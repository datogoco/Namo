import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../../entities/products/api';
import namoTopCut from '../../shared/assets/img/NAMO - Top - cut.png';
import namoFront from '../../shared/assets/img/NAMO - front.jpg';
import namoFrontOpen from '../../shared/assets/img/NAMO - front - open.jpg';
import customer01 from '../../shared/assets/img/customers/profile - 01.jpg';
import customer02 from '../../shared/assets/img/customers/profile - 02.jpg';
import customer03 from '../../shared/assets/img/customers/profile - 03.jpg';
import customer04 from '../../shared/assets/img/customers/profile - 04.jpg';
import customer05 from '../../shared/assets/img/customers/profile - 05.jpg';
import customer06 from '../../shared/assets/img/customers/profile - 06.jpg';
import customer07 from '../../shared/assets/img/customers/profile - 07.jpg';

const FALLBACK_PRODUCT = {
  _id: 'namo-default',
  name: 'Namo Herbal Ointment',
  size: '60ml | 2.03 oz',
  price: 29.37,
  imageUrl: namoTopCut,
};

const testimonials = [
  {
    name: 'Mari Melitskauri',
    photo: customer01,
    quote:
      'I initially purchased the ointment for my mom, and it worked wonders. Her pain has completely disappeared, and she is feeling much better now.',
  },
  {
    name: 'Jean Torres',
    photo: customer02,
    quote:
      "As a professional gardener, wrist and joint pain was something I thought I had to live with. This ointment changed that—it's been a game-changer.",
  },
  {
    name: 'Joseph Murphy',
    photo: customer03,
    quote:
      "Dealing with chronic back pain has been a part of my life for so long. This ointment has been a lifesaver—easy to apply and it works.",
  },
  {
    name: 'Jessica Miller',
    photo: customer04,
    quote:
      "I was skeptical at first, but after positive reviews I tried it for ankle pain. The swelling went down and the pain subsided—I'm amazed.",
  },
  {
    name: 'Emily Johnson',
    photo: customer05,
    quote:
      'After using the ointment for just a few weeks, the difference is remarkable. Mobility improved and pain significantly reduced.',
  },
  {
    name: 'Laura Davis',
    photo: customer06,
    quote:
      "Managing sciatica pain has been tough—this herbal ointment reduced discomfort drastically without harsh chemicals.",
  },
  {
    name: 'Peter Cox',
    photo: customer07,
    quote:
      'This ointment has been a blessing for posture-related back pain. It is now a staple in my daily routine.',
  },
];

const Home = () => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(FALLBACK_PRODUCT);
  const [ctaState, setCtaState] = useState({ fullName: '', email: '', source: '', submitted: false });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await fetchProducts();
        if (Array.isArray(products) && products.length > 0) {
          setProduct(products[0]);
        }
      } catch {
        setProduct(FALLBACK_PRODUCT);
      }
    };
    loadProduct();
  }, []);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const features = useMemo(
    () => [
      {
        icon: 'medkit-outline',
        title: 'Skip the Pharmacy',
        text: 'Avoid expensive drugs with side effects. Choose natural relief with NAMO.',
      },
      {
        icon: 'leaf-outline',
        title: "Nature's Touch",
        text: 'Crafted with premium natural ingredients, gentle yet effective.',
      },
      {
        icon: 'home-outline',
        title: 'Heal at Home',
        text: 'Experience the convenience of healing at home without stepping outside.',
      },
    ],
    [],
  );

  const onCtaSubmit = e => {
    e.preventDefault();
    setCtaState(prev => ({ ...prev, submitted: true }));
  };

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const slideWidth = 436; // card width + gap from CSS (350 + 86)
  const maxIndex = testimonials.length - 1;

  const handleNextTestimonial = () => {
    setTestimonialIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <main>
      <section className="section-hero">
        <div className="hero">
          <div className="hero-text-box slide-out-left">
            <div className="tag-heading">
              <p className="tag-heading-text">handcrafted</p>
              <ion-icon name="rose" className="tag-icon"></ion-icon>
            </div>
            <h1 className="heading-primary">
              All natural ointment for back pain treatment
            </h1>
            <p className="hero-description">
              Namo ointment offers a natural and effective solution for treating
              back pain and the associated inflammation, harnessing the power of
              nature to provide relief and comfort in your daily life.
            </p>
            <button className="btn btn--full margin-right-sm btn--add-to-cart" onClick={handleAddToCart}>
              Add to cart
            </button>
            <a href="#how" className="btn btn--outline">Learn more &darr;</a>
          </div>

          <div className="hero-img-box slide-out-right">
            <picture>
              <source srcSet={`${namoTopCut} 1x`} type="image/jpg" />
              <img
                src={namoTopCut}
                className="hero-img"
                alt="The ointment picture from front"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* SECTION HOW */}
      <section className="section-how" id="how">
        <div className="container">
          <h2 className="heading-secondary slide-up">
            Improve the quality of your life
          </h2>
        </div>

        <div className="container grid grid--2-cols grid--center-v">
          <div className="step-text-box slide-up slide-inout-left">
            <h3 className="heading-tertiary">
              Specially formulated natural ointment
            </h3>
            <p className="step-description">
              Our natural ointment is expertly formulated with a blend of
              healing botanicals to effectively soothe back pain, including
              conditions like herniated disks. It&apos;s crafted to offer quick
              relief with its anti-inflammatory properties, ensuring a gentle
              yet potent solution for pain management without the use of harsh
              chemicals.
            </p>
          </div>
          <div className="step-img-box slide-up slide-inout-right">
            <img
              src={namoFront}
              className="step-img"
              alt="Namo ointment jar"
            />
          </div>

          <div className="step-img-box slide-up slide-inout-left">
            <img
              src={namoFrontOpen}
              className="step-img"
              alt="Namo ointment jar open"
            />
          </div>
          <div className="step-text-box slide-up slide-inout-right">
            <h3 className="heading-tertiary">Long-lasting effect</h3>
            <p className="step-description">
              After completing the full course of treatment, you can look
              forward to a significantly improved condition with long-lasting
              benefits. This improvement will empower you to confidently return
              to your favorite activities, enjoying the freedom and comfort you
              once knew.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <h2 className="heading-secondary features-heading slide-up">
        Benefits of using our product
      </h2>
      <div className="container grid grid--3-cols slide-up">
        {features.map(feature => (
          <div className="feature" key={feature.title}>
            <ion-icon className="feature-icon" name={feature.icon}></ion-icon>
            <p className="feature-title">{feature.title}</p>
            <p className="feature-text">{feature.text}</p>
          </div>
        ))}
      </div>

      <section className="home-testimonials" id="testimonials">
        <h2 className="heading-secondary home-testimonials__heading slide-up">
          Few words from our customers
        </h2>
        <div className="home-testimonials__container slide-up">
          <div className="home-testimonials__wrapper">
            <div
              className="home-testimonials__list"
              style={{ transform: `translateX(-${testimonialIndex * slideWidth}px)` }}
            >
              {testimonials.map(testimonial => (
                <figure className="home-testimonials__card" key={testimonial.name}>
                  <img
                    className="home-testimonials__image"
                    alt={`Photo of customer ${testimonial.name}`}
                    src={testimonial.photo}
                  />
                  <blockquote className="home-testimonials__quote">
                    {testimonial.quote}
                  </blockquote>
                  <p className="home-testimonials__name">&mdash; {testimonial.name}</p>
                </figure>
              ))}
            </div>
          </div>
          <div className="home-testimonials__nav">
            <button type="button" className="home-testimonials__nav-btn" onClick={handlePrevTestimonial} aria-label="Previous testimonial">
              ‹
            </button>
            <button type="button" className="home-testimonials__nav-btn" onClick={handleNextTestimonial} aria-label="Next testimonial">
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="section-cta" id="cta">
        <div className="cta-text-box">
          <h2 className="heading-secondary-cta slide-up">
            Join the Journey to Natural Relief!
          </h2>
          <p className="cta-text slide-up">
            Discover the power of nature with our Herbal Back Pain Ointment.
            Sign up now to receive exclusive updates, expert tips, and special
            offers right to your inbox. Embrace a life free from back pain, the
            natural way.
          </p>

          <form className="cta-form" name="sign-up" onSubmit={onCtaSubmit}>
            <div>
              <label htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                type="text"
                placeholder="John Smith"
                name="full-name"
                value={ctaState.fullName}
                onChange={e => setCtaState(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="me@example.com"
                name="email"
                value={ctaState.email}
                onChange={e => setCtaState(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="select-where">Where did you hear about us?</label>
              <select
                id="select-where"
                name="select-where"
                value={ctaState.source}
                onChange={e => setCtaState(prev => ({ ...prev, source: e.target.value }))}
                required
              >
                <option value="">Please choose one option:</option>
                <option value="friends">Friends and family</option>
                <option value="youtube">Youtube video</option>
                <option value="podcast">Podcast</option>
                <option value="ad">Facebook Ad</option>
                <option value="others">Others</option>
              </select>
            </div>

            <button className="btn btn--form" type="submit">
              {ctaState.submitted ? 'Thanks for signing up!' : 'Sign up now'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Home;
