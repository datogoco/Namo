import React, { useState } from 'react';
import './HelpCenter.css';

const FAQItem = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="faq-toggle"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="faq-toggle__icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-answer">{children}</div>}
    </div>
  );
};

function HelpCenter() {
  return (
    <div className="help-center-page">
      <h1>Help Center</h1>
      <p>
        Welcome to the NAMO Help Center. Here you will find answers to the most common questions about our products, usage,
        safety, ordering, and support. If you need extra assistance, you can always contact us at: <strong>support@namo.com</strong>
      </p>

      <section className="help-center-section">
        <h2>1. General Questions</h2>

        <FAQItem question="What is NAMO?">
          <p>
            NAMO is a natural wellness brand focused on topical herbal ointments designed to support comfort in back pain, muscle
            tension, and herniated disc–related discomfort.
          </p>
        </FAQItem>

        <FAQItem question="Are NAMO products medical treatments?">
          <p>
            No. Our ointments are <strong>not medicines</strong> and do not diagnose, treat, cure, or prevent diseases. They provide{' '}
            <strong>natural support</strong>, comfort, and relaxation.
          </p>
        </FAQItem>

        <FAQItem question="Is NAMO safe for everyday use?">
          <p>
            Yes — when used as directed. Always perform a <strong>patch test</strong> if you have sensitive skin.
          </p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>2. Product Usage &amp; Safety</h2>

        <FAQItem question="How do I apply the ointment?">
          <p>For best results:</p>
          <ol>
            <li>Warm the area (optional — heating pad or warm shower).</li>
            <li>Apply a thin, even layer of ointment.</li>
            <li>Massage gently for 1–2 minutes.</li>
            <li>Follow with gentle stretching or rest.</li>
          </ol>
        </FAQItem>

        <FAQItem question="Where on the body can I apply it?">
          <p>Common areas include:</p>
          <ul>
            <li>Lower back</li>
            <li>Hips</li>
            <li>Neck &amp; shoulders</li>
            <li>Glutes</li>
            <li>Legs &amp; knees</li>
          </ul>
          <p>Avoid applying to:</p>
          <ul>
            <li>Broken skin</li>
            <li>Open wounds</li>
            <li>Eyes or mucous membranes</li>
          </ul>
        </FAQItem>

        <FAQItem question="Can I use NAMO during pregnancy?">
          <p>If you are pregnant or breastfeeding, consult a healthcare professional before use.</p>
        </FAQItem>

        <FAQItem question="Can I use NAMO with other treatments?">
          <p>
            Yes — NAMO can be used alongside stretching, physical therapy, heat or ice therapy, and massage. Avoid combining with
            other strong topical heating or cooling agents.
          </p>
        </FAQItem>

        <FAQItem question="Is a warming or cooling sensation normal?">
          <p>Yes — mild warmth is normal depending on the ingredients. If discomfort occurs, remove with mild soap and water.</p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>3. Ingredients &amp; Allergies</h2>

        <FAQItem question="What ingredients are used in NAMO ointments?">
          <p>
            Our formulas include natural herbal extracts, plant-based oils, essential oils, and soothing botanicals. Exact ingredients
            are listed on each product label.
          </p>
        </FAQItem>

        <FAQItem question="Is NAMO vegan-friendly?">
          <p>Most formulations are plant-based and contain no animal-derived ingredients.</p>
        </FAQItem>

        <FAQItem question="What if I experience irritation?">
          <p>
            Stop use immediately if you experience redness, burning, or an allergic reaction. Wash the area with soap and water. If
            symptoms persist, seek medical advice.
          </p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>4. Ordering &amp; Payment</h2>

        <FAQItem question="How do I place an order?">
          <p>You can order directly from our Shop page. Choose your product → Add to cart → Checkout securely.</p>
        </FAQItem>

        <FAQItem question="What payment methods are accepted?">
          <p>
            We accept credit/debit cards and online payment platforms depending on your region. Your payment details are processed
            securely by third-party providers.
          </p>
        </FAQItem>

        <FAQItem question="Can I change or cancel my order?">
          <p>If your order has not shipped yet, email us immediately at <strong>support@namo.com</strong>.</p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>5. Shipping &amp; Delivery</h2>

        <FAQItem question="Where do you ship?">
          <p>We currently ship to selected regions. Shipping availability and options are shown during checkout.</p>
        </FAQItem>

        <FAQItem question="How long does delivery take?">
          <p>Delivery times vary by location. Estimated delivery dates appear at checkout.</p>
        </FAQItem>

        <FAQItem question="How do I track my order?">
          <p>Once your order ships, you will receive a tracking number via email.</p>
        </FAQItem>

        <FAQItem question="What if my package is delayed?">
          <p>Delays can occur due to courier issues. If you haven’t received your order within the expected timeframe, contact us.</p>
        </FAQItem>

        <FAQItem question="My package arrived damaged. What do I do?">
          <p>
            Please send your order number and photos of the damaged product and packaging to <strong>support@namo.com</strong>. We will
            assist you with a replacement or solution.
          </p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>6. Returns &amp; Refunds</h2>

        <FAQItem question="Do you accept returns?">
          <p>
            For hygiene and safety reasons, opened ointments cannot be returned. Unopened items may be eligible depending on your region’s rules.
          </p>
        </FAQItem>

        <FAQItem question="Do you offer refunds?">
          <p>Refunds are available for damaged items, incorrect orders, or items lost in transit after verification.</p>
        </FAQItem>

        <FAQItem question="How do I request a refund?">
          <p>Email <strong>support@namo.com</strong> with your full name, order number, reason for request, and photos (if applicable).</p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>7. Tips for Best Results</h2>

        <FAQItem question="How often should I use the ointment?">
          <p>1–2 times per day is common. Do not exceed recommended use.</p>
        </FAQItem>

        <FAQItem question="What routines pair well with NAMO products?">
          <ul>
            <li>Gentle back stretches</li>
            <li>Warm compresses</li>
            <li>Light mobility exercises</li>
            <li>Daily posture resets</li>
            <li>Short walking breaks</li>
          </ul>
        </FAQItem>

        <FAQItem question="Can I use it before workouts?">
          <p>Yes — great for warming up tight areas.</p>
        </FAQItem>

        <FAQItem question="Can I use it before sleep?">
          <p>Absolutely. A warm shower, ointment application, and gentle stretching can improve relaxation.</p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>8. Troubleshooting</h2>

        <FAQItem question="The ointment feels too warm — is that normal?">
          <p>
            Mild warmth is expected. If it feels uncomfortable, remove immediately, apply a cold compress, and avoid layering with heat for
            24 hours.
          </p>
        </FAQItem>

        <FAQItem question="The product texture seems different. Why?">
          <p>Natural products can vary slightly due to temperature or batch differences. This does not affect performance.</p>
        </FAQItem>

        <FAQItem question="The ointment isn’t helping enough. What should I do?">
          <p>
            Try warming the area before applying, use it consistently, and add light mobility exercises. If pain persists, consult a healthcare professional.
          </p>
        </FAQItem>
      </section>

      <section className="help-center-section">
        <h2>9. Contact &amp; Support</h2>

        <p>
          If your question isn’t answered here, we’re happy to help.
          <br />
          <strong>Email:</strong> support@namo.com
          <br />
          <strong>Response time:</strong> 24–48 hours
        </p>
      </section>
    </div>
  );
}

export default HelpCenter;
