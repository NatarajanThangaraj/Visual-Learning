import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function Header() {
  return (
    <Link className="title-strip" to="/">
      <img className="logo" src={logo} alt="" width="48" height="48" />
      <div className="titles">
        <span className="eyebrow">Zoho Schools</span>
        <span className="heading">Visual Learning</span>
      </div>
    </Link>
  );
}
