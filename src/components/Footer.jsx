import { SiGithub } from '@icons-pack/react-simple-icons';
import './Footer.css';

export default function Footer() {
	return (
		<footer>
			<div className="footerLinks">
				<a href="#">About</a>
				<a href="#">Privacy Policy</a>
				<a href="#">Terms of Service</a>
				<a href="#" onClick={() => alert('Contact form here')}>
					Contact Us
				</a>
			</div>
			<div className="footerSocial">
				<a
					href="https://github.com/saoudabdulrahman/DishDetail"
					target="_blank"
				>
					<SiGithub />
				</a>
			</div>
			<p>&copy; 2026 Dish Detail. All rights reserved.</p>
		</footer>
	);
}
