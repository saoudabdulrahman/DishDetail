import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
	return (
		<div className="main-layout">
			<Header />
			<div className="main-content animate-fade-in">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default MainLayout;
