import githubWhite from '../assets/GitHub_Invertocat_White_Clearspace.svg';
import githubBlack from '../assets/GitHub_Invertocat_Black_Clearspace.svg';

export default function Footer() {
  return (
    <footer className="border-outline-variant/15 bg-surface-container-lowest px-fluid-container mt-20 w-full border-t py-12 pt-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="font-headline text-on-background text-2xl font-black italic">
          DishDetail
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: 'About', href: '#' },
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            {
              label: 'Contact',
              href: '#',
              onClick: () => alert('Contact form here'),
            },
          ].map(({ label, href, onClick }) => (
            <a
              key={label}
              href={href}
              onClick={onClick}
              className="font-body text-on-surface-variant hover:text-primary content-center text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/saoudabdulrahman/DishDetail"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
          >
            <img
              src={githubBlack}
              alt="GitHub"
              className="h-8 w-8 dark:hidden"
            />
            <img
              src={githubWhite}
              alt="GitHub"
              className="hidden h-8 w-8 dark:block"
            />
          </a>
        </div>

        <div className="font-body text-on-surface-variant text-xs tracking-[0.2em] uppercase opacity-80">
          © 2026 DishDetail
        </div>
      </div>
    </footer>
  );
}
