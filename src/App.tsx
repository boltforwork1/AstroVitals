import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import BodyMap from '@/pages/BodyMap';
import CheckIn from '@/pages/CheckIn';
import Trends from '@/pages/Trends';
import RadiationPage from '@/pages/RadiationPage';
import Mind from '@/pages/Mind';
import Training from '@/pages/Training';
import Assistant from '@/pages/Assistant';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/body-map" element={<BodyMap />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/radiation" element={<RadiationPage />} />
          <Route path="/mind" element={<Mind />} />
          <Route path="/training" element={<Training />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
