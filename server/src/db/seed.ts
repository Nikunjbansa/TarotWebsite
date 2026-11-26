import { DatabaseSync } from 'node:sqlite';
import { env } from '../config/env';
import { getDb, closeDb } from './database';
import { hashPassword } from '../utils/security';

export const SEED_SERVICES = [
  {
    slug: 'akashik-tarot-reading',
    name: 'Akashik Tarot Reading',
    subtitle: 'Soul Ledger & Karmic Timeline Guidance',
    category: 'Divination & Astrology',
    price: 3100,
    duration_minutes: 45,
    delivery_mode: '1:1 Live Consultation (Video / Audio Coordinated via WhatsApp)',
    short_description:
      'Channel insights from the Akashic Records woven through sacred tarot spreads to illuminate karmic contracts, soul lessons, and pivotal life choices.',
    full_description:
      'Akashik Tarot Reading bridges intuitive tarot symbolism with deep Akashic soul-record perception. Ideal when you stand at a major crossroad in love, vocation, or spiritual awakening, this session uncovers recurring ancestral patterns, past-life echoes, and grounded next steps without fear or ambiguity.',
    benefits: [
      'Unveils hidden karmic blocks across relationships and career',
      'Clarifies soul purpose and upcoming 6-to-12 month energetic timelines',
      'Includes practical daily grounding & reflection remedies',
      'Deeply empathetic, confidential 1:1 reading space',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-akashik-tarot.jpg',
    is_featured: 1,
    sort_order: 1,
  },
  {
    slug: 'tarot-reading',
    name: 'Tarot Reading',
    subtitle: 'Clear Intuitive Guidance for Present Crossroads',
    category: 'Divination & Astrology',
    price: 2100,
    duration_minutes: 30,
    delivery_mode: '1:1 Live Consultation or Structured Voice Summary via WhatsApp',
    short_description:
      'Focused, compassionate card readings addressing love, career transitions, emotional clarity, and immediate decisions with direct answers.',
    full_description:
      'Whether you are navigating uncertainty in a relationship, evaluating a career move, or seeking emotional reassurance, a dedicated Tarot Reading brings calm perspective to the present moment. Cards are drawn intuitively in real time around your specific questions to map energies, obstacles, and aligned choices.',
    benefits: [
      'Direct, jargon-free answers to your priority life questions',
      'Identifies immediate opportunities and hidden influences',
      'Actionable mindset and energy alignment tips',
      'Gentle guidance tailored to your pace and comfort',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-tarot.jpg',
    is_featured: 1,
    sort_order: 2,
  },
  {
    slug: 'astrology',
    name: 'Astrology',
    subtitle: 'Vedic Kundli, Dasha & Planetary Remedy Consultation',
    category: 'Divination & Astrology',
    price: 3500,
    duration_minutes: 60,
    delivery_mode: '1:1 Live Chart Walkthrough (Coordinated via WhatsApp)',
    short_description:
      'Comprehensive Vedic birth chart analysis covering Mahadasha cycles, planetary strengths, relationship compatibility, career timing, and gentle Upayas.',
    full_description:
      'Rooted in traditional Jyotish Shastra and practical modern counsel, this session decodes your Natal Kundli, Navamsa chart, and active Dasha transits. You receive clear insight into favorable timing windows, karmic strengths, and simple, accessible Vedic remedies suited to everyday life.',
    benefits: [
      'Full Lagna, Moon & Navamsa chart interpretation',
      'Detailed Mahadasha / Antardasha timeline outlook',
      'Personalized career, marriage, wealth & wellness windows',
      'Non-fear-based, simple mantras, charity, and lifestyle Upayas',
    ],
    requires_birth_details: 1,
    image_url: '/images/service-astrology.jpg',
    is_featured: 1,
    sort_order: 3,
  },
  {
    slug: 'rituals',
    name: 'Rituals',
    subtitle: 'Personalized Sacred Sankalpa & Altar Ceremonies',
    category: 'Sacred Rituals',
    price: 4500,
    duration_minutes: 60,
    delivery_mode: 'Custom Sacred Ritual + Guided Integration Notes via WhatsApp',
    short_description:
      'Intentionally curated Vedic and lunar ceremonies for home harmony, new beginnings, planetary pacification, abundance alignment, and protection.',
    full_description:
      'Every life milestone or lingering energetic heaviness calls for intentional sacred space. Designed around your natal chart or current intention, our Rituals service prepares personalized Sankalpa prayers, planetary or lunar offerings, and simple step-by-step home practice guidance for lasting serenity.',
    benefits: [
      'Custom-aligned to lunar tithi and personal planetary needs',
      'Supports house blessings, relationship harmony, and career openings',
      'Includes clear home altar preparation & follow-up checklist',
      'Rooted in traditional reverence, purity, and ethical intent',
    ],
    requires_birth_details: 1,
    image_url: '/images/service-rituals.jpg',
    is_featured: 0,
    sort_order: 4,
  },
  {
    slug: 'shiv-shakti-healing',
    name: 'Shiv–Shakti Healing',
    subtitle: 'Sacred Masculine–Feminine Equilibrium & Union',
    category: 'Energy & Tantra Healing',
    price: 4100,
    duration_minutes: 50,
    delivery_mode: '1:1 Guided Distance Energy Transmission & Debrief',
    short_description:
      'Restores inner balance between stillness (Shiva) and creative vitality (Shakti) to heal emotional polarization, partnership blocks, and burnout.',
    full_description:
      'Shiv–Shakti Healing harmonizes the solar and lunar currents flowing through your subtle nadis and chakra system. Ideal for releasing inner conflict, emotional exhaustion, or relational disharmony, this gentle yet potent energy session anchors grounded clarity alongside open-hearted intuition.',
    benefits: [
      'Harmonizes Ida & Pingala subtle energy channels',
      'Softens emotional reactivity and relationship strain',
      'Cultivates grounded confidence paired with intuitive flow',
      'Post-session integration guidance shared via WhatsApp',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-shiv-shakti.jpg',
    is_featured: 1,
    sort_order: 5,
  },
  {
    slug: 'maa-tara-healing',
    name: 'Maa Tara Healing',
    subtitle: 'Compassionate Grace Through Emotional Storms',
    category: 'Energy & Tantra Healing',
    price: 3800,
    duration_minutes: 45,
    delivery_mode: '1:1 Sacred Distance Healing Session',
    short_description:
      'Invoke the nurturing, swift compassion of Maa Tara to dissolve deep anxiety, grief, sudden crisis overwhelm, and unspoken heartache.',
    full_description:
      'Maa Tara is revered as the guiding star across turbulent waters. This serene spiritual healing modality wraps the nervous system and aura in steady, protective grace—supporting souls navigating heartbreak, prolonged stress, or daunting transitions with renewed hope and inner peace.',
    benefits: [
      'Soothes acute anxiety, grief, and emotional overwhelm',
      'Restores sense of inner refuge, clarity, and resilience',
      'Clears stagnant heart-chakra heaviness gently',
      'Includes supportive breath & mantra anchoring practice',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-maa-tara.jpg',
    is_featured: 0,
    sort_order: 6,
  },
  {
    slug: 'lama-fera-healing',
    name: 'Lama Fera Healing',
    subtitle: 'Himalayan Buddhist High-Frequency Aura Clearing',
    category: 'Energy & Tantra Healing',
    price: 3600,
    duration_minutes: 45,
    delivery_mode: '1:1 Distance Himalayan Healing & Chakra Alignment',
    short_description:
      'An ancient Tibetan healing transmission channeling deep stillness to dissolve heavy energetic attachments, lethargy, fear, and stubborn blockages.',
    full_description:
      'Practiced for centuries in Himalayan monasteries, Lama Fera works rapidly at the causal and etheric layers of the aura. Using sacred Tibetan symbols and meditative resonance, this session clears stagnant negative imprints, sharpens mental focus, and elevates vibrational vitality.',
    benefits: [
      'Clears dense aura heaviness, fatigue, and mental fog',
      'Balances all seven primary chakras swiftly and gently',
      'Supports emotional liberation from prolonged stagnation',
      'Deeply restorative meditative state throughout the session',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-lama-fera.jpg',
    is_featured: 1,
    sort_order: 7,
  },
  {
    slug: 'm-e-v-healing',
    name: 'M.E.V Healing',
    subtitle: 'Mind–Emotion–Vibration Realignment Therapy',
    category: 'Energy & Tantra Healing',
    price: 3300,
    duration_minutes: 45,
    delivery_mode: '1:1 Subtle Vibration Calibration Session',
    short_description:
      'Structured energetic recalibration harmonizing mental loops, suppressed emotional weight, and personal vibrational coherence.',
    full_description:
      'M.E.V (Mind–Emotion–Vibration) Healing targets the subtle triad where overthinking and unexpressed emotion lower daily vitality. Through guided frequency clearing and somatic energetic attunement, this modality resets nervous-system noise into calm clarity and aligned intention.',
    benefits: [
      'Interrupts repetitive overthinking and energetic drain',
      'Releases stored emotional tension gently without overwhelm',
      'Elevates daily focus, sleep quality, and emotional steadiness',
      'Ideal for professionals and creatives feeling misaligned',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-mev.jpg',
    is_featured: 0,
    sort_order: 8,
  },
  {
    slug: 'mahakali-healing',
    name: 'Mahakali Healing',
    subtitle: 'Fierce Protection, Cord Cutting & Boundary Restoration',
    category: 'Energy & Tantra Healing',
    price: 4400,
    duration_minutes: 50,
    delivery_mode: '1:1 Intensive Aura Shielding & Cord-Cutting Session',
    short_description:
      'Transformative Shakti-guided energetic clearing to sever draining cords, dispel psychic heaviness, and reclaim personal sovereignty.',
    full_description:
      'When subtle boundaries feel breached by toxic dynamics, persistent negativity, or generational patterns, Mahakali Healing brings decisive, compassionate purification. Far from fear-driven rituals, this sacred transmission dissolves what no longer serves your highest path and seals your aura in radiant strength.',
    benefits: [
      'Cuts draining energetic cords from past dynamics or environments',
      'Establishes strong auric boundaries and grounded sovereignty',
      'Clears deep-seated fear and self-doubt blocks',
      'Includes personalized protection & grounding protocol',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-mahakali.jpg',
    is_featured: 0,
    sort_order: 9,
  },
  {
    slug: 'hoomkar-with-halaum',
    name: 'Hoomkar with Halaum',
    subtitle: 'Sacred Beej-Mantra Resonance & Deep Purification',
    category: 'Sacred Rituals',
    price: 5100,
    duration_minutes: 60,
    delivery_mode: '1:1 Sound-Vibration Invocation & Healing Session',
    short_description:
      'Potent sonic-mantra invocation pairing primal Hoomkar and Halaum seed frequencies to shatter stagnant inertia and awaken inner clarity.',
    full_description:
      'Hoomkar with Halaum is an advanced sacred sound-and-energy invocation rooted in classical contemplative lineages. By channeling focused beej-mantra resonance across your subtle energy centers, this session breaks through deep karmic inertia, clears environmental or inner heaviness, and restores fearless radiance.',
    benefits: [
      'Dissolves deep-rooted spiritual and circumstantial stagnation',
      'Awakens Solar Plexus and Third Eye clarity through sound resonance',
      'Purifies subtle energetic field before major life ventures',
      'Followed by tailored mantra discipline guidance',
    ],
    requires_birth_details: 0,
    image_url: '/images/service-hoomkar.jpg',
    is_featured: 1,
    sort_order: 10,
  },
];

const DEFAULT_WEEKLY_SLOTS = [
  '10:30 AM',
  '12:00 PM',
  '02:30 PM',
  '04:30 PM',
  '06:30 PM',
];

export async function seedDatabase(dbParam?: DatabaseSync): Promise<void> {
  const db = dbParam || getDb();

  // 1. Sanctuary settings
  const defaultSettings: Array<[string, string]> = [
    ['sanctuary_name', 'Akansha.Predicts'],
    ['practitioner_name', 'Akansha Bansal'],
    ['whatsapp_business_number', env.whatsappBusinessNumber],
    ['contact_email', 'contact@akanshapredicts.com'],
    ['consultation_hours', 'Mon – Sat · 10:30 AM – 7:30 PM IST'],
    [
      'announcement_text',
      'Akansha.Predicts — Astrology, Tarot Reading, Spiritual Guidance & Energy Healing · Direct Booking via WhatsApp',
    ],
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO sanctuary_settings (key, value) VALUES (?, ?)
  `);
  for (const [k, v] of defaultSettings) {
    insertSetting.run(k, v);
  }

  // 2. Seed services (10 core spiritual modalities)
  const existingServiceCount = (
    db.prepare('SELECT COUNT(*) as count FROM services').get() as {
      count: number;
    }
  ).count;

  if (existingServiceCount === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (
        slug, name, subtitle, category, price, duration_minutes,
        delivery_mode, short_description, full_description,
        benefits_json, requires_birth_details, image_url,
        is_featured, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    for (const s of SEED_SERVICES) {
      insertService.run(
        s.slug,
        s.name,
        s.subtitle,
        s.category,
        s.price,
        s.duration_minutes,
        s.delivery_mode,
        s.short_description,
        s.full_description,
        JSON.stringify(s.benefits),
        s.requires_birth_details,
        s.image_url,
        s.is_featured,
        s.sort_order
      );
    }
  }

  // 3. Seed weekly availability rules (Mon-Sat open, Sunday off by default)
  const existingRuleCount = (
    db.prepare('SELECT COUNT(*) as count FROM availability_rules').get() as {
      count: number;
    }
  ).count;

  if (existingRuleCount === 0) {
    const insertRule = db.prepare(`
      INSERT INTO availability_rules (day_of_week, is_available, slots_json)
      VALUES (?, ?, ?)
    `);
    for (let day = 0; day <= 6; day++) {
      const isAvailable = day === 0 ? 0 : 1; // Sunday closed by default; Admin can toggle anytime
      const slots =
        day === 6
          ? ['11:00 AM', '01:00 PM', '03:30 PM']
          : DEFAULT_WEEKLY_SLOTS;
      insertRule.run(day, isAvailable, JSON.stringify(slots));
    }
  }

  // 4. Seed Admin user & Demo Client user if missing
  const adminEmail = 'admin@akanshapredicts.com';
  const existingAdmin = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(adminEmail) as { id: number } | undefined;

  if (!existingAdmin) {
    const adminHash = await hashPassword('ChandraAdmin@2026');
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, whatsapp_number, notes)
      VALUES (?, ?, ?, 'admin', ?, ?, ?)
    `).run(
      'Akansha Bansal',
      adminEmail,
      adminHash,
      '+91 95605 64150',
      '919560564150',
      'Owner & Lead Practitioner — Akansha.Predicts'
    );
  }

  const demoClientEmail = 'ananya@example.com';
  let clientId: number;
  const existingClient = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(demoClientEmail) as { id: number } | undefined;

  if (!existingClient) {
    const clientHash = await hashPassword('ClientPass@2026');
    const info = db
      .prepare(`
        INSERT INTO users (
          name, email, password_hash, role, phone, whatsapp_number,
          date_of_birth, time_of_birth, place_of_birth
        ) VALUES (?, ?, ?, 'client', ?, ?, ?, ?, ?)
      `)
      .run(
        'Ananya Kulkarni',
        demoClientEmail,
        clientHash,
        '+91 98201 11223',
        '919820111223',
        '1994-08-19',
        '07:42 AM',
        'Pune, Maharashtra, India'
      );
    clientId = Number(info.lastInsertRowid);
  } else {
    clientId = existingClient.id;
  }

  // 5. Seed initial sample bookings so Admin Dashboard & Client History look populated out of the box
  const existingBookingCount = (
    db.prepare('SELECT COUNT(*) as count FROM bookings').get() as {
      count: number;
    }
  ).count;

  if (existingBookingCount === 0) {
    const services = db
      .prepare('SELECT id, name, price, duration_minutes FROM services ORDER BY sort_order ASC')
      .all() as Array<{
        id: number;
        name: string;
        price: number;
        duration_minutes: number;
      }>;

    const getOffsetDate = (daysAhead: number): string => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1); // avoid Sunday
      return d.toISOString().slice(0, 10);
    };

    if (services.length >= 7) {
      const s1 = services[0]; // Akashik Tarot Reading
      const s3 = services[2]; // Astrology
      const s7 = services[6]; // Lama Fera Healing

      const insertBooking = db.prepare(`
        INSERT INTO bookings (
          booking_code, user_id, appointment_date, appointment_time,
          status, total_amount, total_duration_minutes,
          client_name, client_email, client_phone, client_whatsapp,
          date_of_birth, time_of_birth, place_of_birth,
          requirements, whatsapp_message, whatsapp_confirmed_sent, admin_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertItem = db.prepare(`
        INSERT INTO booking_items (booking_id, service_id, service_name, service_price, duration_minutes)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Past completed booking
      const b1 = insertBooking.run(
        'CV-2026-4108A',
        clientId,
        getOffsetDate(-7),
        '12:00 PM',
        'completed',
        s1.price + s7.price,
        s1.duration_minutes + s7.duration_minutes,
        'Ananya Kulkarni',
        demoClientEmail,
        '+91 98201 11223',
        '919820111223',
        '1994-08-19',
        '07:42 AM',
        'Pune, Maharashtra, India',
        'Seeking clarity on career transition and calming lingering anxiety.',
        'Booking Request CV-2026-4108A — Akashik Tarot Reading + Lama Fera Healing',
        1,
        'Completed via WhatsApp coordination. Google Meet link shared 15 mins prior.'
      );
      insertItem.run(b1.lastInsertRowid, s1.id, s1.name, s1.price, s1.duration_minutes);
      insertItem.run(b1.lastInsertRowid, s7.id, s7.name, s7.price, s7.duration_minutes);

      // Upcoming accepted booking
      const b2 = insertBooking.run(
        'CV-2026-5204B',
        clientId,
        getOffsetDate(3),
        '04:30 PM',
        'accepted',
        s3.price,
        s3.duration_minutes,
        'Ananya Kulkarni',
        demoClientEmail,
        '+91 98201 11223',
        '919820111223',
        '1994-08-19',
        '07:42 AM',
        'Pune, Maharashtra, India',
        'Annual Vedic Dasha review and Saturn transit remedies.',
        'Booking Request CV-2026-5204B — Astrology Consultation',
        1,
        'Confirmed on WhatsApp. Payment transfer acknowledged; Meet link will be sent on session day.'
      );
      insertItem.run(b2.lastInsertRowid, s3.id, s3.name, s3.price, s3.duration_minutes);
    }
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Akansha.Predicts database seeded successfully.');
      closeDb();
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

