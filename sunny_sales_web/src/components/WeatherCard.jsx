import { useState, useEffect } from 'react';
import {
  FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiCloudLightning, FiWind,
} from 'react-icons/fi';
import './WeatherCard.css';

const WMO = {
  0:  { label: 'Céu limpo',          icon: 'sun'     },
  1:  { label: 'Maioritariamente limpo', icon: 'sun'  },
  2:  { label: 'Parcialmente nublado', icon: 'cloud'  },
  3:  { label: 'Nublado',             icon: 'cloud'   },
  45: { label: 'Nevoeiro',            icon: 'wind'    },
  48: { label: 'Nevoeiro gelado',     icon: 'wind'    },
  51: { label: 'Chuvisco',            icon: 'rain'    },
  53: { label: 'Chuvisco',            icon: 'rain'    },
  55: { label: 'Chuvisco intenso',    icon: 'rain'    },
  61: { label: 'Chuva leve',          icon: 'rain'    },
  63: { label: 'Chuva',               icon: 'rain'    },
  65: { label: 'Chuva intensa',       icon: 'rain'    },
  71: { label: 'Neve leve',           icon: 'snow'    },
  73: { label: 'Neve',                icon: 'snow'    },
  75: { label: 'Neve intensa',        icon: 'snow'    },
  80: { label: 'Aguaceiros',          icon: 'rain'    },
  81: { label: 'Aguaceiros',          icon: 'rain'    },
  82: { label: 'Aguaceiros fortes',   icon: 'rain'    },
  95: { label: 'Trovoada',            icon: 'thunder' },
  96: { label: 'Trovoada c/ granizo', icon: 'thunder' },
  99: { label: 'Trovoada c/ granizo', icon: 'thunder' },
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function WIcon({ type, size = 24 }) {
  switch (type) {
    case 'sun':     return <FiSun size={size} />;
    case 'cloud':   return <FiCloud size={size} />;
    case 'rain':    return <FiCloudRain size={size} />;
    case 'snow':    return <FiCloudSnow size={size} />;
    case 'thunder': return <FiCloudLightning size={size} />;
    default:        return <FiWind size={size} />;
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [city, setCity]       = useState('');
  const [now, setNow]         = useState(new Date());
  const [status, setStatus]   = useState('loading'); // loading | ok | denied | error

  // Clock tick every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        try {
          const [wRes, gRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
              `&current=temperature_2m,weathercode` +
              `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
              `&timezone=auto&forecast_days=5`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
              { headers: { 'Accept-Language': 'pt' } }
            ),
          ]);
          const wData = await wRes.json();
          const gData = await gRes.json();
          setWeather(wData);
          const addr = gData.address || {};
          setCity(addr.city || addr.town || addr.village || addr.county || '');
          setStatus('ok');
        } catch {
          setStatus('error');
        }
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error');
      },
      { timeout: 10_000 }
    );
  }, []);

  if (status === 'loading') {
    return (
      <div className="weather-card weather-card--skeleton">
        <div className="weather-skeleton-line" />
        <div className="weather-skeleton-line weather-skeleton-line--sm" />
      </div>
    );
  }

  if (status !== 'ok' || !weather) return null;

  const cur   = weather.current;
  const daily = weather.daily;
  const info  = WMO[cur.weathercode] || WMO[0];
  const temp  = Math.round(cur.temperature_2m);
  const tMax  = Math.round(daily.temperature_2m_max[0]);
  const tMin  = Math.round(daily.temperature_2m_min[0]);

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const mo = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const dayName = DAYS[now.getDay()].toUpperCase();

  const forecast = daily.time.slice(1, 5).map((d, i) => {
    const idx = i + 1;
    const code = daily.weathercode[idx];
    return {
      label: DAYS[new Date(d + 'T12:00:00').getDay()].toUpperCase(),
      icon:  (WMO[code] || WMO[0]).icon,
    };
  });

  return (
    <div className="weather-card">
      <div className="weather-main">
        <div className="weather-left">
          <div className="weather-condition">
            <WIcon type={info.icon} size={18} />
            <span>{info.label}</span>
          </div>
          <div className="weather-temp">{temp}°</div>
          <div className="weather-minmax">{tMax}°/{tMin}°</div>
        </div>
        <div className="weather-right">
          <div className="weather-time">{hh}:{mm}</div>
          <div className="weather-date">{dayName} {mo}-{dd}</div>
          {city && <div className="weather-city">{city}</div>}
        </div>
      </div>
      <div className="weather-forecast">
        {forecast.map((f) => (
          <div key={f.label} className="weather-forecast-item">
            <span className="forecast-day">{f.label}</span>
            <WIcon type={f.icon} size={15} />
          </div>
        ))}
      </div>
    </div>
  );
}
