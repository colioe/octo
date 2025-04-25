// /app/api/ip-location/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://ipinfo.io/json?token=401d7dd3cb0377'); // optional token
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch IP data' }, { status: res.status });
    }

    const data = await res.json();

    const [lat, lon] = data.loc.split(',');
    return NextResponse.json({
      city: data.city,
      region: data.region,
      country: data.country,
      latitude: lat,
      longitude: lon,
    });
  } catch (error) {
    console.error('IP fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
