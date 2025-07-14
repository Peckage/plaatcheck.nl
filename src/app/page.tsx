'use client';

import { useState } from 'react';
import { DataRow } from '@/components/data-row';
import { formatDate } from '@/utils/utilities';
import { StructuredSection } from '@/components/structured-section';
import { formatLicensePlate } from '@/components/format-license-plate';

type Gebrek = {
  omschrijving?: string;
  soort?: string;
  locatie?: string;
};

type RDWData = {
  base: Record<string, string> | null;
  fuel: Record<string, string> | null;
  mileage: Record<string, string> | null;
  apk: Record<string, string>[];
  defects: Record<string, Gebrek[]>;
  specs: Record<string, string> | null;
  emissions: Record<string, string> | null;
  wltp: Record<string, string> | null;
};

function isAllEmpty(data: RDWData | null): boolean {
  if (!data) return true;

  const keys: (keyof RDWData)[] = ['base', 'fuel', 'mileage', 'apk', 'specs', 'emissions', 'wltp'];
  return keys.every(key => {
    const value = data[key];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
    return !value;
  });
}

const fetchAllCarData = async (plate: string): Promise<RDWData> => {
  const clean = plate.replaceAll('-', '');
  const urls = {
    base: `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${clean}`,
    fuel: `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${clean}`,
    mileage: `https://opendata.rdw.nl/resource/qyyz-sp7a.json?kenteken=${clean}`,
    apk: `https://opendata.rdw.nl/resource/vkij-7mwc.json?kenteken=${clean}`,
    specs: `https://opendata.rdw.nl/resource/vezc-m2t6.json?kenteken=${clean}`,
    emissions: `https://opendata.rdw.nl/resource/j49n-pgkz.json?kenteken=${clean}`,
    wltp: `https://opendata.rdw.nl/resource/e8ys-bvje.json?kenteken=${clean}`,
  };

  const [base, fuel, mileage, apk, specs, emissions, wltp] = await Promise.all(
    Object.values(urls).map(url => fetch(url).then(r => r.json()))
  );

  const defects: Record<string, Gebrek[]> = {};
  if (apk && apk.length > 0) {
    await Promise.all(
      apk.map(async (entry: { rapportnummer?: string }) => {
        if (!entry.rapportnummer) return;
        const res = await fetch(`https://opendata.rdw.nl/resource/hx2c-gt7k.json?rapportnummer=${entry.rapportnummer}`).then(r => r.json());
        defects[entry.rapportnummer] = res;
      })
    );
  }

  return {
    base: base[0] || null,
    fuel: fuel[0] || null,
    mileage: mileage[0] || null,
    apk: apk || [],
    defects,
    specs: specs[0] || null,
    emissions: emissions[0] || null,
    wltp: wltp[0] || null,
  };
};

export default function Home() {
  const [plate, setPlate] = useState<string>('');
  const [data, setData] = useState<RDWData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);
    setData(null);

    try {
      const fullData = await fetchAllCarData(plate);
      setData(fullData);
    } catch (err) {
      console.error('Fout bij ophalen:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-sm text-gray-800 dark:text-gray-200">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Plaatcheck Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold tracking-wide">Plaatcheck.nl</span>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
            <input
              type="text"
              maxLength={6}
              minLength={6}
              value={plate}
              onChange={(e) => setPlate(formatLicensePlate(e.target.value))}
              placeholder="bijv. A-123-BC"
              className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white text-center tracking-widest w-full sm:w-40"
              required
            />
            <button
              type="submit"
              className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded hover:opacity-80 transition"
              disabled={loading}
            >
              {loading ? 'Zoeken...' : 'Zoek'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-10">
        {submitted && !loading && data && !isAllEmpty(data) && (
          <div className="w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm space-y-8">
            <StructuredSection title="Voertuiggegevens" data={data.base || {}} fields={{
              kenteken: 'Kenteken',
              merk: 'Merk',
              handelsbenaming: 'Model',
              voertuigsoort: 'Voertuigsoort',
              inrichting: 'Carrosserievorm',
              eerste_kleur: 'Kleur',
              tweede_kleur: 'Secundaire kleur',
              aantal_deuren: 'Aantal deuren',
              aantal_wielen: 'Aantal wielen',
              aantal_cilinders: 'Cilinders',
            }} />

            <StructuredSection title="Registratie & APK" data={data.base || {}} fields={{
              datum_eerste_toelating: 'Datum eerste toelating',
              datum_tenaamstelling: 'Datum tenaamstelling',
              vervaldatum_apk: 'APK vervaldatum',
              wam_verzekerd: 'WAM verzekerd',
              export_indicator: 'Geëxporteerd',
              openstaande_terugroepactie_indicator: 'Terugroepactie?',
              taxi_indicator: 'Taxi?',
              tenaamstellen_mogelijk: 'Tenaamstellen mogelijk',
            }} />

            <StructuredSection title="Gewicht & Afmetingen" data={data.base || {}} fields={{
              massa_ledig_voertuig: 'Leeggewicht',
              massa_rijklaar: 'Rijklaar gewicht',
              toegestane_maximum_massa_voertuig: 'Toegestane massa',
              maximum_massa_samenstelling: 'Max. massa samenstelling',
              maximum_massa_trekken_ongeremd: 'Trekken ongeremd',
              maximum_trekken_massa_geremd: 'Trekken geremd',
              wielbasis: 'Wielbasis (mm)',
            }} />

            <StructuredSection title="Motor & Emissie" data={data.fuel || {}} fields={{
              brandstof_omschrijving: 'Brandstof',
              uitlaatemissieniveau: 'Emissieniveau',
              nettomaximumvermogen: 'Vermogen (kW)',
              toerental_geluidsniveau: 'Toerental bij geluidsmeting',
              geluidsniveau_stationair: 'Stationair geluidsniveau (dB)',
              emissiecode_omschrijving: 'Emissiecode',
            }} />

            <StructuredSection title="Carrosserie Info" data={data.specs || {}} fields={{
              type_carrosserie_europese_omschrijving: 'Carrosserietype',
              carrosserietype: 'Typecode',
            }} />

            {data.apk && data.apk.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">APK Keuringen</h3>
                <div className="space-y-4 dark:text-gray-200">
                  {data.apk.map((insp, i) => (
                    <div key={i} className="p-4 border border-gray-300 dark:border-gray-700 rounded-md">
                      <DataRow label="Vervaldatum" value={formatDate(insp.vervaldatum_keuring)} />
                      <DataRow label="Resultaat" value={insp.keuringsresultaat} />
                      <DataRow label="Soort keuring" value={insp.soort_keuring} />
                      {data.defects[insp.rapportnummer] && data.defects[insp.rapportnummer].length > 0 && (
                        <>
                          <p className="mt-3 font-semibold text-sm text-red-500 dark:text-red-300">Gebreken:</p>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {data.defects[insp.rapportnummer].map((gebrek, gidx) => (
                              <li key={gidx}>
                                <strong>{gebrek.omschrijving || 'Onbekend gebrek'}</strong>
                                {(gebrek.soort || gebrek.locatie) && (
                                  <span className="text-gray-400">
                                    {' '}({[gebrek.soort, gebrek.locatie].filter(Boolean).join(', ')})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {submitted && !loading && (data === null || isAllEmpty(data)) && (
          <p className="text-gray-500 dark:text-gray-400 items-center text-center">
            Geen gegevens gevonden voor kenteken: {plate}
          </p>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 p-6">
        Gebaseerd op <a href="https://opendata.rdw.nl" className="underline">RDW Open Data</a>
      </footer>
    </div>
  );
}