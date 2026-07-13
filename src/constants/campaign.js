/*
 * Agency 1776 — home page content. Every string here is the single source of
 * truth for the on-page copy; sections read from these constants and render
 * verbatim (no rewriting, no summarising, no invented supporting copy).
 */

export const AGENCY = {
  brand: 'Agency 1776',
}

export const HERO = {
  heading:
    'The Campaign Website Builder That Helps America Hear Your Message and Act On It.',
  tagline:
    'Agency 1776 builds campaign websites and digital campaign assets for candidates, political leaders, and movements that need to reach voters, earn support, and build momentum.',
  ctas: [
    { label: 'LAUNCH YOUR SITE', href: '#process', variant: 'primary' },
    { label: 'BUILD TO WIN', href: '#contact', variant: 'ghost' },
  ],
}

export const FORWARD = {
  heading: 'Move the Campaign Forward.',
  tagline:
    'We build political campaign websites around the sections voters and supporters actually need.',
  items: [
    { label: 'Candidate story', icon: 'scroll' },
    { label: 'Issues and priorities', icon: 'chart' },
    { label: 'Donation path', icon: 'arrow' },
    { label: 'Volunteer signup', icon: 'star' },
    { label: 'Supporter capture', icon: 'pulse' },
    { label: 'Events and updates', icon: 'book' },
    { label: 'Endorsements', icon: 'shield' },
    { label: 'Contact and press information', icon: 'scroll' },
    { label: 'Mobile-ready structure', icon: 'chart' },
  ],
}

export const REALITY = {
  eyebrow: 'THE CAMPAIGN REALITY',
  heading:
    'When People Know What You Stand For, They Know How to Support You.',
  body: 'A campaign website is the first place people go to understand who you are, what you believe, what you are fighting for, and why they should support you. That requires end-to-end digital support. A website and digital presence makes the message clear, the candidate credible, and the next step easy to take.',
  cta: { label: 'VIEW OUR SOLUTIONS', href: '#solutions' },
}

export const SCOPE = {
  eyebrow: 'FOR CAMPAIGNS OF EVERY SIZE',
  heading: 'Agency 1776',
  body:
    'Built for Candidates, Leaders, and Movements. We give your campaign a digital foundation that supports the race whether you are running for local office, organizing a political movement, or building support for a cause. Agency 1776 supports:',
  items: [
    'Local candidates',
    'Down-ballot campaigns',
    'State-level campaigns',
    'Political organizations',
    'Advocacy campaigns',
    'Community movements',
    'Issue-based campaigns',
    'First-time candidates',
    'Campaign teams that need a stronger digital presence',
  ],
}

export const PROCESS = {
  heading: 'Launch Fast',
  steps: [
    {
      num: '1',
      title: 'Share the Campaign',
      body:
        'Send us the candidate details, campaign goals, message, colors, logo, and key priorities.',
    },
    {
      num: '2',
      title: 'Build the Message',
      body:
        'We shape the candidate story, homepage message, issue sections, and calls-to-action.',
    },
    {
      num: '3',
      title: 'Create the Website',
      body:
        'We build the campaign website with the pages and action paths your campaign needs.',
    },
    {
      num: '4',
      title: 'Prepare Campaign Assets',
      body:
        'We create digital content your campaign can use across social media, supporter updates, and promotion.',
    },
    {
      num: '5',
      title: 'Launch and Move',
      body:
        'Your campaign gets a professional digital foundation built to help voters hear the message and act.',
    },
  ],
  cta: { label: 'START THE BUILD', href: '#contact' },
}

export const CONTACT = {
  heading: 'Ready to Put Your Campaign in Motion?',
  cta: { label: 'START THE CONVERSATION', href: '#contact' },
}

/*
 * ABOUT page content. Every string in this block is verbatim from the source
 * copy — sections read from these constants and render them exactly as
 * supplied. Do not rewrite, shorten, expand, or reword any of it.
 */
export const ABOUT = {
  hero: {
    heading:
      'Agency 1776 Serves Different Missions, Different Audiences, and One Standard: Build Websites That Drive Results.',
  },
  parent: {
    eyebrow: 'PART OF OPS 1776 GROUP',
    heading: 'A Specialized Agency Within a Larger Ecosystem.',
    body: [
      'Agency 1776 operates under Ops 1776 Group of Companies, a parent company built around focused brands serving strategy, e-commerce, news, AI-driven website solutions, and digital execution.',
      'Inside that ecosystem, Agency 1776 has one clear role:',
    ],
    role: 'build websites for organizations that need people to act.',
    close:
      'That focus keeps our work sharp. It keeps the audience clear. It keeps every project tied to a real outcome.',
    cta: { label: 'EXPLORE OPS 1776 GROUP', href: '#contact' },
  },
  paths: {
    eyebrow: 'WHO WE SERVE',
    heading: 'Three Paths. One Agency Standard.',
    intro:
      'Agency 1776 was built to serve organizations where communication matters and action matters even more.',
    items: [
      {
        text: 'For businesses, the website has to create confidence and generate leads.',
        icon: 'chart',
      },
      {
        text: 'For political campaigns, it has to communicate priorities, build trust, and move voters and supporters.',
        icon: 'star',
      },
      {
        text: 'For nonprofits, it has to make the mission real, earn donor confidence, and turn support into action.',
        icon: 'shield',
      },
    ],
    standard: [
      'The standard never changes.',
      'The message has to be clear.',
      'The website has to build trust.',
      'The next step has to be obvious',
    ],
  },
  experience: {
    heading: 'THE AGENCY 1776 EXPERIENCE',
    body: 'We bring together strategy, messaging, design, and execution to build websites that support real outcomes: leads, voters, donors, supporters, inquiries, and momentum.',
    lines: [
      'Not every organization needs the same website.',
      'But every serious organization needs a website with purpose.',
    ],
  },
  values: {
    heading: 'OUR VALUES',
    items: [
      {
        title: 'Clarity',
        body:
          'Confusion kills action. We build websites that make the message easy to understand and the next step easy to take.',
      },
      {
        title: 'Discipline',
        body:
          'Strong websites are not built from random ideas. They are built through structure, focus, and decisions that support the goal.',
      },
      {
        title: 'Trust',
        body:
          'People act when they believe. Every website needs to create confidence through message, proof, design, and experience.',
      },
      {
        title: 'Execution',
        body:
          'Strategy only matters if it gets built. We turn ideas into pages, sections, copy, design, and launch-ready websites.',
      },
      {
        title: 'Purpose',
        body:
          'Nothing goes on the page just to fill space. Every section should help the visitor understand, trust, or act.',
      },
      {
        title: 'America First Standard',
        body:
          'Agency 1776 carries a strong America First identity rooted in responsibility, work ethic, leadership, discipline, and results.',
      },
    ],
  },
  closer: {
    heading: 'Let’s Build the Website Your Mission Deserves.',
    ctas: [{ label: 'CONTACT US', href: '/#contact', variant: 'primary' }],
  },
}
