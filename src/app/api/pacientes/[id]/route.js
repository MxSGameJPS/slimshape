import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const url = `https://slimshapeapi.vercel.app/api/pacientes/${encodeURIComponent(id)}`;
    const headers = {};
    const auth = request.headers.get('authorization');
    if (auth) headers['authorization'] = auth;
    headers['content-type'] = 'application/json';

    const res = await fetch(url, { method: 'GET', headers });
    const contentType = res.headers.get('content-type') || 'application/json';
    const body = await res.text();

    return new Response(body, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch (err) {
    console.error('Proxy /api/pacientes/[id] error', err);
    return NextResponse.json({ error: 'Erro no proxy de paciente' }, { status: 500 });
  }
}
