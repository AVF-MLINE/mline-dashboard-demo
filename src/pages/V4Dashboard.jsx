import { useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const REPORT = {
  title: "Отчёт по эффективности АГ",
  region: "Амурская область",
  sourceFile: "отчет по эффективности_АГ_Амурская обл_с кол-вом измерений.xlsx",
  entities: {
    medicalOrgs: 9,
    doctors: 27,
    patients: 387
  },
  subject: {
    totalOnDate: 387,
    noMeasurements: 0,
    withMeasurements: 387,
    active28Days: 315,
    reachedTargetTotal: 273,
    keepsTarget: 164,
    hasSlipEpisodes: 231,
    notKeepingTarget: 109,
    criticalEpisodesTotal: 201,
    criticalEpisodes28: 31,
    partialCompliance: 228,
    insufficientMeasurements: 87
  },
  measurementStats: {
    last30DaysAvg: 67.7,
    last30DaysMedian: 51,
    noMeasurementsLast30: 71,
    lessThan12Last30: 112,
    lessThan24Last30: 134,
    monthlyAvg: 79.8,
    monthlyMedian: 70,
    monthlyLess12: 22
  },
  orgTopByVolume: [
    {
      name: "ГАУЗ АМУРСКОЙ ОБЛАСТИ \"ГП № 4\"",
      monitored: 65,
      active28: 61,
      reachedTarget: 61,
      keepsTarget: 54,
      criticalEpisodes: 26,
      criticalShare: 0.4
    },
    {
      name: "ГАУЗ АО \"КОНСТАНТИНОВСКАЯ БОЛЬНИЦА\"",
      monitored: 65,
      active28: 41,
      reachedTarget: 32,
      keepsTarget: 12,
      criticalEpisodes: 37,
      criticalShare: 0.569
    },
    {
      name: "ГАУЗ АО \"ИВАНОВСКАЯ РАЙОННАЯ БОЛЬНИЦА\"",
      monitored: 60,
      active28: 55,
      reachedTarget: 35,
      keepsTarget: 18,
      criticalEpisodes: 29,
      criticalShare: 0.483
    },
    {
      name: "ГАУЗ АМУРСКОЙ ОБЛАСТИ \"ГП №3\"",
      monitored: 59,
      active28: 52,
      reachedTarget: 41,
      keepsTarget: 16,
      criticalEpisodes: 33,
      criticalShare: 0.559
    },
    {
      name: "ГБУЗ АО \"СВОБОДНЕНСКАЯ ГП\"",
      monitored: 53,
      active28: 42,
      reachedTarget: 38,
      keepsTarget: 30,
      criticalEpisodes: 33,
      criticalShare: 0.623
    }
  ],
  orgRiskByCriticalShare: [
    { name: "ГАУЗ АО \"ТАМБОВСКАЯ БОЛЬНИЦА\"", criticalShare: 0.833, criticalEpisodes: 15, monitored: 18 },
    { name: "ГБУЗ АО \"СВОБОДНЕНСКАЯ ГП\"", criticalShare: 0.623, criticalEpisodes: 33, monitored: 53 },
    { name: "ГАУЗ АО \"КОНСТАНТИНОВСКАЯ БОЛЬНИЦА\"", criticalShare: 0.569, criticalEpisodes: 37, monitored: 65 },
    { name: "ГАУЗ АМУРСКОЙ ОБЛАСТИ \"ГП №3\"", criticalShare: 0.559, criticalEpisodes: 33, monitored: 59 },
    { name: "ГАУЗ АО \"ИВАНОВСКАЯ РАЙОННАЯ БОЛЬНИЦА\"", criticalShare: 0.483, criticalEpisodes: 29, monitored: 60 }
  ],
  topDoctors: [
    { name: "Булыгина Аделина Антоновна", panel: 40, reachedTarget: 37, reachedShare: 0.93, criticalShare: 0.4 },
    { name: "Сазонова Светлана Владимировна", panel: 31, reachedTarget: 22, reachedShare: 0.71, criticalShare: 0.645 },
    { name: "Добрынина Виктория Сергеевна", panel: 25, reachedTarget: 24, reachedShare: 0.96, criticalShare: 0.4 },
    { name: "Павленко Людмила Сергеевна", panel: 20, reachedTarget: 12, reachedShare: 0.6, criticalShare: 0.55 },
    { name: "Кириенко Ксения Александровна", panel: 20, reachedTarget: 6, reachedShare: 0.3, criticalShare: 0.55 }
  ]
};

function percent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function buildSummary(subject, period) {
  const activeShare = subject.active28Days / subject.totalOnDate;
  const targetShare = subject.reachedTargetTotal / subject.withMeasurements;
  const holdShare = subject.keepsTarget / subject.reachedTargetTotal;
  const criticalShare = subject.criticalEpisodesTotal / subject.withMeasurements;
  const critical28Share = subject.criticalEpisodes28 / subject.withMeasurements;

  return {
    title: `Сводка V4 (${period})`,
    generatedAt: new Date().toLocaleString("ru-RU"),
    highlights: [
      `На мониторинге ${subject.totalOnDate} пациентов; активные измерения за 28 дней — ${subject.active28Days} (${percent(activeShare)}).`,
      `ЦУ АД достигли ${subject.reachedTargetTotal} пациентов (${percent(targetShare)} от пациентов с измерениями).`,
      `Удерживают ЦУ АД ${subject.keepsTarget} пациентов (${percent(holdShare)} от достигших ЦУ АД).`
    ],
    risks: [
      `Эпизоды критического повышения АД за весь период: ${subject.criticalEpisodesTotal} (${percent(criticalShare)}).`,
      `Эпизоды критического повышения АД за последние 28 дней: ${subject.criticalEpisodes28} (${percent(critical28Share)}).`,
      `Эпизоды ускользания ЦУ АД: ${subject.hasSlipEpisodes} случаев.`
    ],
    actions: [
      "Усилить маршрутизацию по МО с максимальной долей критических эпизодов.",
      "Сфокусировать врачебный контроль на пациентах с низкой комплаентностью и недостатком измерений.",
      "Еженедельно отслеживать удержание ЦУ АД и динамику критических эпизодов по каждой МО."
    ]
  };
}

function V4Dashboard() {
  const [period, setPeriod] = useState("последние 30 дней");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const metrics = useMemo(() => {
    const s = REPORT.subject;
    return [
      {
        title: "На мониторинге",
        value: s.totalOnDate,
        subtitle: "пациентов на отчётную дату",
        tone: "v4-neutral"
      },
      {
        title: "Активные измерения (28 дн.)",
        value: `${s.active28Days} (${percent(s.active28Days / s.totalOnDate)})`,
        subtitle: "пациенты с измерениями в отчетном периоде",
        tone: "v4-good"
      },
      {
        title: "Достигли ЦУ АД",
        value: `${s.reachedTargetTotal} (${percent(s.reachedTargetTotal / s.withMeasurements)})`,
        subtitle: "от пациентов с измерениями",
        tone: "v4-good"
      },
      {
        title: "Удерживают ЦУ АД",
        value: `${s.keepsTarget} (${percent(s.keepsTarget / s.reachedTargetTotal)})`,
        subtitle: "от достигших ЦУ АД",
        tone: "v4-warning"
      },
      {
        title: "Критические эпизоды",
        value: `${s.criticalEpisodesTotal} (${percent(s.criticalEpisodesTotal / s.withMeasurements)})`,
        subtitle: "за весь период мониторинга",
        tone: "v4-danger"
      },
      {
        title: "Критические эпизоды (28 дн.)",
        value: `${s.criticalEpisodes28} (${percent(s.criticalEpisodes28 / s.withMeasurements)})`,
        subtitle: "за последние 28 дней",
        tone: "v4-warning"
      }
    ];
  }, []);

  const handleSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setSummary(buildSummary(REPORT.subject, period));
      setIsGenerating(false);
    }, 900);
  };

  return (
    <div className="v4-page page">
      <div className="v4-spot v4-spot-a" />
      <div className="v4-spot v4-spot-b" />

      <header className="panel v4-hero animate-in">
        <div className="v4-hero-head">
          <div className="brand-wrap">
            <BrandLogo />
            <div>
              <p className="eyebrow">V4 · Дашборд на основе реального отчёта</p>
              <h1>{REPORT.title} — {REPORT.region}</h1>
              <p className="subtitle">Источник: {REPORT.sourceFile}. Сущности в отчёте: {REPORT.entities.medicalOrgs} МО, {REPORT.entities.doctors} врачей, {REPORT.entities.patients} пациентов.</p>
            </div>
          </div>
          <div className="chips">
            <button className={period === "последние 30 дней" ? "chip active" : "chip"} onClick={() => setPeriod("последние 30 дней")}>
              30 дней
            </button>
            <button className={period === "весь период" ? "chip active" : "chip"} onClick={() => setPeriod("весь период")}>
              Весь период
            </button>
          </div>
        </div>
        <div className="v4-kpi-grid">
          {metrics.map((item) => (
            <article key={item.title} className={`v4-kpi ${item.tone}`}>
              <p>{item.title}</p>
              <strong>{item.value}</strong>
              <span>{item.subtitle}</span>
            </article>
          ))}
        </div>
      </header>

      <main className="v4-layout">
        <section className="v4-main">
          <section className="panel animate-in delay-1">
            <h2>МО по числу пациентов на мониторинге</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>МО</th>
                    <th>На мониторинге</th>
                    <th>Активные 28 дн.</th>
                    <th>Достигли ЦУ</th>
                    <th>Удерживают ЦУ</th>
                    <th>Критические эпизоды</th>
                    <th>Доля критич.</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT.orgTopByVolume.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.monitored}</td>
                      <td>{row.active28}</td>
                      <td>{row.reachedTarget}</td>
                      <td>{row.keepsTarget}</td>
                      <td>{row.criticalEpisodes}</td>
                      <td>{percent(row.criticalShare, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel animate-in delay-2">
            <h2>МО с максимальной долей критических эпизодов</h2>
            <div className="v4-risk-grid">
              {REPORT.orgRiskByCriticalShare.map((row) => (
                <article key={row.name} className="v4-risk-card">
                  <h3>{row.name}</h3>
                  <p>
                    Доля критических эпизодов: <strong>{percent(row.criticalShare, 1)}</strong>
                  </p>
                  <p>
                    Критические эпизоды: <strong>{row.criticalEpisodes}</strong> из {row.monitored}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel animate-in delay-3">
            <h2>Врачи с наибольшей нагрузкой</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Врач</th>
                    <th>Панель пациентов</th>
                    <th>Достигли ЦУ</th>
                    <th>Доля достигших</th>
                    <th>Доля критич.</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT.topDoctors.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.panel}</td>
                      <td>{row.reachedTarget}</td>
                      <td>{percent(row.reachedShare, 1)}</td>
                      <td>{percent(row.criticalShare, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="v4-side">
          <section className="panel animate-in delay-2">
            <h2>Качество измерений пациентов</h2>
            <div className="v4-stat-grid">
              <article className="v4-stat">
                <p>Среднее измерений за 30 дней</p>
                <strong>{REPORT.measurementStats.last30DaysAvg}</strong>
              </article>
              <article className="v4-stat">
                <p>Медиана за 30 дней</p>
                <strong>{REPORT.measurementStats.last30DaysMedian}</strong>
              </article>
              <article className="v4-stat">
                <p>Без измерений за 30 дней</p>
                <strong>{REPORT.measurementStats.noMeasurementsLast30}</strong>
              </article>
              <article className="v4-stat">
                <p>Менее 12 измерений за 30 дней</p>
                <strong>{REPORT.measurementStats.lessThan12Last30}</strong>
              </article>
            </div>
            <div className="v4-bars">
              <div>
                <span>Частично соблюдают методику</span>
                <div className="v4-bar"><i style={{ width: `${(REPORT.subject.partialCompliance / REPORT.subject.active28Days) * 100}%` }} /></div>
              </div>
              <div>
                <span>Недостаточно измерений</span>
                <div className="v4-bar warn"><i style={{ width: `${(REPORT.subject.insufficientMeasurements / REPORT.subject.active28Days) * 100}%` }} /></div>
              </div>
            </div>
          </section>

          <section className="panel animate-in delay-3">
            <h2>ИИ-сводка по отчёту</h2>
            <button className="summary-button" onClick={handleSummary} disabled={isGenerating}>
              {isGenerating ? "Готовим сводку..." : "Подготовить сводку данных"}
            </button>
            {summary && (
              <div className="v4-summary">
                <p className="v4-summary-title">{summary.title}</p>
                <p className="v3-note">Сформировано: {summary.generatedAt}</p>
                <h3>Что важно</h3>
                <ul>{summary.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>Риски</h3>
                <ul>{summary.risks.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>Рекомендации</h3>
                <ul>{summary.actions.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

export default V4Dashboard;
