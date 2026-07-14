/*
 * Pricing page — home for the campaign build calculator. Every string in this
 * file is user-supplied verbatim; sections read from these constants and
 * render as-is (no rewriting, no invented supporting copy, no fabricated
 * dollar amounts). If a value isn't in this file, it doesn't appear on the
 * Pricing page.
 */

export const PRICING_HERO = {
  heading: 'Find the Right Digital Build for Your Campaign.',
  subtext:
    'Every campaign has a different race, audience size, timeline, and level of digital support needed. Use the calculator to identify the website, campaign assets, and launch path that best fit your campaign.',
  // Same-page scroll to the calculator section on this page — handled via
  // onClick + scrollToId so no hash href ever hits the DOM.
  cta: { label: 'CALCULATE MY CAMPAIGN WEBSITE', scrollTo: 'calculator' },
}

export const PRICING_CALCULATOR = {
  fields: [
    {
      id: 'campaign-type',
      title: 'Campaign Type',
      options: [
        'Local Candidate',
        'County / Municipal Race',
        'State-Level Race',
        'Federal Race',
        'Political Organization',
        'Advocacy / Issue Campaign',
        'Other',
      ],
    },
    {
      id: 'area-size',
      title: 'Campaign Area Size',
      options: [
        'Micro — Less than 10,000 people',
        'Small — 10,000 to 50,000 people',
        'Medium — 50,000 to 150,000 people',
        'Large — 150,000 to 500,000 people',
        'Major — 500,000+ people',
      ],
    },
    {
      id: 'website-needs',
      title: 'Website Needs',
      options: [
        'Starter Campaign Website',
        'Full Campaign Website',
        'Campaign Website + Social Assets',
        'Campaign Website + Landing Pages',
        'Full Digital Campaign Support',
      ],
    },
    {
      id: 'timeline',
      title: 'Timeline',
      options: [
        'Launch as soon as possible',
        'Launch within 2 weeks',
        'Launch within 30 days',
        'Launch within 60 days',
        'Not sure yet',
      ],
    },
  ],
  result:
    'Based on your campaign size and digital needs, Agency 1776 will recommend the website package, campaign assets, and launch path that best fit your race.',
}

export const PRICING_COMMIT = {
  heading: 'Know Your Build Before You Commit',
  body:
    'Start with the calculator or contact us directly. We will help identify the right digital build based on your race, goals, and launch timeline.',
  ctas: [
    {
      label: 'CALCULATE MY CAMPAIGN BUILD',
      scrollTo: 'calculator',
      variant: 'primary',
    },
    { label: 'CONTACT US', href: '/contact', variant: 'ghost' },
  ],
}
