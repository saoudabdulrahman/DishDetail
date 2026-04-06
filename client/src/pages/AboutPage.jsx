import { Link } from 'react-router';

export default function AboutPage() {
  const packages = {
    client: [
      {
        name: 'React',
        description: 'A JavaScript library for building user interfaces.',
      },
      {
        name: 'React Router',
        description: 'Declarative routing for React web applications.',
      },
      {
        name: 'TanStack Query',
        description: 'Powerful asynchronous state management for TS/JS.',
      },
      {
        name: 'Tailwind CSS',
        description: 'A utility-first CSS framework for rapid UI development.',
      },
      {
        name: 'Vite',
        description: 'Next Generation Frontend Tooling.',
      },
      {
        name: 'Headless UI',
        description: 'Unstyled, fully accessible UI components.',
      },
      { name: 'Zod', description: 'Type-safe schema validation library.' },
      {
        name: 'Lucide React',
        description: 'Beautiful & consistent icon toolkit.',
      },
      {
        name: 'Sonner',
        description: 'An opinionated toast component for React.',
      },
      {
        name: 'clsx & tailwind-merge',
        description: 'Utilities for constructing and merging CSS classes.',
      },
      {
        name: 'ESLint & Prettier',
        description:
          'Pluggable JavaScript linter and opinionated code formatter.',
      },
      {
        name: 'Vitest & Testing Library',
        description:
          'Blazing fast unit test framework with React testing utilities.',
      },
      {
        name: 'MSW',
        description: 'API mocking library for browser and Node.js.',
      },
      {
        name: 'happy-dom',
        description:
          'Lightweight DOM environment used by Vitest on the client.',
      },
    ],
    server: [
      {
        name: 'Express',
        description:
          'Fast, unopinionated, minimalist web framework for Node.js.',
      },
      {
        name: 'Mongoose',
        description: 'Elegant MongoDB object modeling for Node.js.',
      },
      {
        name: 'bcryptjs',
        description: 'Password hashing for secure credential storage.',
      },
      {
        name: 'Helmet',
        description: 'Security middleware for Express.',
      },
      {
        name: 'Express Rate Limit',
        description: 'Basic rate-limiting middleware for Express.',
      },
      {
        name: 'dotenv',
        description: 'Loads environment variables from a .env file.',
      },
      {
        name: 'cors',
        description: 'Node.js CORS middleware.',
      },
      {
        name: 'Zod',
        description: 'Server-side request and payload validation.',
      },
      {
        name: 'Pino & pino-http',
        description: 'Structured logging for the API and HTTP lifecycle.',
      },
      {
        name: 'Multer & Cloudinary',
        description: 'Image upload pipeline and cloud media storage.',
      },
      {
        name: 'slugify',
        description: 'String slugification utility.',
      },
      {
        name: 'Vitest & Supertest',
        description: 'Testing framework and HTTP assertion library.',
      },
    ],
    infrastructure: [
      {
        name: 'npm Workspaces',
        description: 'Monorepo dependency management.',
      },
      {
        name: 'npm-run-all2',
        description:
          'CLI tool to run multiple npm-scripts in parallel or sequential.',
      },
      {
        name: 'Husky',
        description: 'Git hooks made easy.',
      },
      {
        name: 'lint-staged',
        description: 'Runs formatting and lint checks on staged files.',
      },
      {
        name: 'Prettier',
        description: 'Code formatting across client and server workspaces.',
      },
    ],
    thirdParty: [
      {
        name: 'Google Fonts',
        description: 'Providing Manrope and Noto Serif typefaces.',
      },
      {
        name: 'MongoDB / Atlas',
        description: 'NoSQL Database for data persistence.',
      },
      {
        name: 'Cloudinary',
        description: 'Hosted media transformation and delivery service.',
      },
    ],
  };

  const productHighlights = [
    'Discover restaurants through establishment listings, detail pages, and review feeds with pagination.',
    'Search and filter by name, cuisine, and minimum rating for faster discovery.',
    'Explore a curated homepage with featured spotlights, latest critiques, and trending sorting.',
    'Create, edit, and delete rich reviews with star ratings, body text, and optional images.',
    'Vote reviews as Helpful or Unhelpful with duplicate-vote protection.',
    'Use JWT Bearer-token authentication with username routes like /profile/:username.',
    'Update your own profile data (avatar and bio) once authenticated.',
    'Enjoy route-level code splitting and React Query caching for faster page transitions.',
  ];

  const renderSection = (title, badge, badgeColor, items) => (
    <div className="mb-12">
      <h3 className="font-headline mb-6 flex items-center gap-4 text-2xl font-bold">
        {badge && (
          <span
            className={`font-ui rounded-md px-3 py-1 text-sm tracking-widest uppercase ${badgeColor}`}
          >
            {badge}
          </span>
        )}
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((pkg) => (
          <div
            key={pkg.name}
            className="bg-surface-container-low border-outline-variant/10 hover:border-outline-variant/30 rounded-xl border p-6 transition-colors"
          >
            <h4 className="font-ui text-on-surface mb-2 text-lg font-bold">
              {pkg.name}
            </h4>
            <p className="font-ui text-on-surface-variant text-sm leading-relaxed">
              {pkg.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      <section className="mb-20 text-center md:text-left">
        <h1 className="font-headline text-on-surface mb-6 text-6xl font-black tracking-tighter md:text-8xl">
          About <span className="text-primary italic">DishDetail</span>
        </h1>
        <p className="font-body text-on-surface-variant mx-auto mb-10 max-w-xl text-lg leading-relaxed md:mx-0">
          DishDetail is a full-stack restaurant review application built as a
          monorepo with npm Workspaces. It helps people discover local
          restaurants, explore community feedback, and publish their own dining
          experiences with modern tooling across the stack.
        </p>
      </section>

      <section className="mb-20">
        <h2 className="font-headline border-outline-variant/15 mb-12 border-b pb-4 text-4xl font-bold">
          Product Highlights
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {productHighlights.map((item) => (
            <div
              key={item}
              className="bg-surface-container-low border-outline-variant/10 hover:border-outline-variant/30 rounded-xl border p-6 transition-colors"
            >
              <p className="font-ui text-on-surface-variant text-sm leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="font-headline border-outline-variant/15 mb-12 border-b pb-4 text-4xl font-bold">
          Technology Stack
        </h2>

        <div className="space-y-4">
          {renderSection(
            'Client Dependencies',
            'Frontend',
            'bg-primary/20 text-primary',
            packages.client,
          )}
          {renderSection(
            'Server Dependencies',
            'Backend',
            'bg-secondary/20 text-secondary',
            packages.server,
          )}
          {renderSection(
            'Monorepo & Build Tools',
            'Tooling',
            'bg-tertiary/20 text-tertiary',
            packages.infrastructure,
          )}
          {renderSection(
            'Third-Party Libraries & Services',
            'External',
            'bg-surface-container-highest text-on-surface',
            packages.thirdParty,
          )}
        </div>
      </section>

      <section className="mt-32 text-center">
        <Link
          to="/"
          className="bg-surface-container-high border-outline-variant/15 text-primary hover:bg-surface-container-highest font-ui inline-block rounded-xl border px-8 py-4 font-bold transition-colors active:scale-95"
        >
          Return Home
        </Link>
      </section>
    </main>
  );
}
