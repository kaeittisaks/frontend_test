// component

import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1}} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Template',
    path: '/dashboard/Template',
    icon: icon('ic_user'),
  },
  {
    title: 'Document',
    path: '/dashboard/Document',
    icon: icon('ic_cart'),
  },
  {
    title: 'Team',
    path: '/dashboard/Team',
    icon: icon('ic_blog'),
  },
];

export default navConfig;
