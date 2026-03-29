import githubBlack from '../assets/GitHub_Invertocat_Black_Clearspace.svg';
import githubWhite from '../assets/GitHub_Invertocat_White_Clearspace.svg';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-links">
        <a href="#">About</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#" onClick={() => alert('Contact form here')}>
          Contact Us
        </a>
      </div>
      <div className="footer-social">
        <a
          href="https://github.com/saoudabdulrahman/DishDetail"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon"
        >
          <img
            src={githubBlack}
            alt="GitHub"
            className="github-logo light-only"
          />
          <img
            src={githubWhite}
            alt="GitHub"
            className="github-logo dark-only"
          />
        </a>
      </div>
      <p>&copy; 2026 Dish Detail</p>
    </footer>
  );
}
