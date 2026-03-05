import { useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const V5_DATA = {
  snapshotDate: "05.03.2026",
  profile: {
    sex: "Мужской",
    age: 65,
    height: 184,
    weight: 100,
    waist: 100,
    bmi: 30
  },
  monitored: {
    bloodPressure: {
      date: "10.11.2025",
      systolic: 160,
      diastolic: 90,
      pulse: 76,
      target: "110-135 / 70-85 / 60-80"
    },
    glucose: {
      date: "10.11.2025",
      value: 8.6,
      unit: "ммоль/л",
      target: "4.4-6.1 ммоль/л"
    }
  },
  trends: {
    systolic: [178, 176, 173, 170, 168, 166, 164, 165, 163, 161, 159, 160, 158, 160],
    glucose: [10.1, 9.9, 9.7, 9.4, 9.2, 9.0, 8.8, 9.0, 8.9, 8.7, 8.5, 8.7, 8.8, 8.6]
  },
  majorDiseases: [
    "Сахарный диабет (E10-E14)",
    "Артериальная гипертензия (I10-I15)",
    "Ишемическая болезнь сердца (I20-I25)",
    "Хроническая болезнь почек (N18.0-N18.9)"
  ],
  labs: [
    { name: "Гликированный гемоглобин", value: "8.6", reference: "4-6", date: "10.11.2025", trend: "up", tone: "critical" },
    { name: "Глюкоза крови", value: "8.6", reference: "4-6", date: "10.11.2025", trend: "up", tone: "warning" },
    { name: "Креатинин", value: "8.6", reference: "< 5.2", date: "10.11.2025", trend: "flat", tone: "warning" },
    { name: "Микроальбуминурия", value: "8.6", reference: "< 5.2", date: "10.11.2025", trend: "up", tone: "warning" },
    { name: "Холестерин", value: "8.6", reference: "< 5.2", date: "10.11.2025", trend: "flat", tone: "warning" },
    { name: "ЛПНП", value: "3.4", reference: "< 3", date: "10.11.2025", trend: "up", tone: "warning" },
    { name: "ЛПВП", value: "1.5", reference: "> 1.2", date: "10.11.2025", trend: "flat", tone: "ok" },
    { name: "Триглицериды", value: "3.2", reference: "< 1.7", date: "10.11.2025", trend: "up", tone: "critical" }
  ],
  consultations: [
    { name: "Кардиолог", code: "I10-I15", date: "10.10.2025" },
    { name: "Терапевт", code: "E10-E14", date: "08.08.2025" },
    { name: "Терапевт", code: "I10-I15", date: "10.06.2025" },
    { name: "Другое", code: "", date: "-" }
  ],
  instrumental: [
    { name: "ЭКГ", date: "15.05.2025", note: "доступен полный протокол" },
    { name: "ЭХО-КГ", date: "08.08.2025", note: "динамика без отрицательных изменений" },
    { name: "УЗИ брюшной полости", date: "08.08.2025", note: "контроль через 6 месяцев" },
    { name: "Другое", date: "-", note: "нет новых данных" }
  ],
  laboratoryStudies: [
    { name: "ОАК", date: "15.05.2025", status: "готов" },
    { name: "Биохимический анализ крови", date: "08.08.2025", status: "готов" },
    { name: "Другие", date: "08.08.2025", status: "ожидается" },
    { name: "Другие", date: "-", status: "не назначено" }
  ],
  comorbidTherapy: {
    title: "Медикаментозная терапия сопутствующих заболеваний",
    date: "10.10.2025",
    icd: "N18.0",
    diagnosis: "Хроническая болезнь почек",
    recommendations: [
      "Контроль креатинина и СКФ каждые 3 месяца",
      "Ограничение соли до 5 г/сут",
      "Ежедневный контроль АД"
    ]
  },
  diseaseTherapy: [
    {
      name: "Артериальная гипертензия",
      icd: "I10-I15",
      date: "10.10.2025",
      code: "I10",
      diagnosis: "Артериальная гипертензия",
      meds: [
        "Бисопролол 2.5 мг утром",
        "Спиронолактон 12.5 мг утром",
        "Дапаглифлозин 10 мг утром",
        "Периндоприл 10 мг вечером (не принимать при АД < 110/70)"
      ]
    },
    {
      name: "Сахарный диабет",
      icd: "E10-E14",
      date: "10.10.2025",
      code: "E10",
      diagnosis: "Инсулинозависимый сахарный диабет",
      meds: [
        "Левемир по схеме титрации",
        "Метформин 1000 мг 2 раза в день",
        "Контроль глюкозы не менее 4 измерений/сут"
      ]
    }
  ],
  oakPreview: {
    metric: "Гемоглобин",
    fromDate: "10.10.2024",
    toDate: "15.08.2025",
    fromValue: "130 (120-160)",
    toValue: "128 (120-160)"
  }
};

function toneMeta(tone) {
  if (tone === "critical") return { label: "Критично", cls: "v5x-badge critical" };
  if (tone === "warning") return { label: "Внимание", cls: "v5x-badge warning" };
  return { label: "Норма", cls: "v5x-badge ok" };
}

function trendArrow(trend) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

function toSparkPoints(values, width, height, padding = 8) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function Sparkline({ values, color, label }) {
  const width = 160;
  const height = 60;
  const points = toSparkPoints(values, width, height);

  return (
    <svg className="v5x-spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" points={points} />
      <circle cx={width - 8} cy={points.split(" ").at(-1).split(",")[1]} r="4" fill={color} />
    </svg>
  );
}

function StatusDonut({ critical, warning, ok }) {
  const total = critical + warning + ok || 1;
  const criticalDeg = (critical / total) * 360;
  const warningDeg = (warning / total) * 360;
  const normalPct = Math.round((ok / total) * 100);
  const style = {
    background: `conic-gradient(#d45858 0deg ${criticalDeg}deg, #d49b36 ${criticalDeg}deg ${criticalDeg + warningDeg}deg, #2d9d78 ${criticalDeg + warningDeg}deg 360deg)`
  };

  return (
    <div className="v5x-donut" style={style}>
      <div className="v5x-donut-center">
        <strong>{normalPct}%</strong>
        <span>в норме</span>
      </div>
    </div>
  );
}

function MultiTrendChart({ bpValues, glucoseValues }) {
  const width = 460;
  const height = 180;
  const padding = 18;
  const toCoords = (values) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    return values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });
  };

  const toPointString = (coords) => coords.map(({ x, y }) => `${x},${y}`).join(" ");

  const bpCoords = toCoords(bpValues);
  const glucoseCoords = toCoords(glucoseValues);
  const bpPoints = toPointString(bpCoords);
  const glucosePoints = toPointString(glucoseCoords);
  const bpLast = bpCoords.at(-1);
  const glucoseLast = glucoseCoords.at(-1);

  return (
    <svg
      className="v5x-trend-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="График динамики АД и глюкозы (нормализованные шкалы)"
    >
      <polyline className="v5x-grid-line" points={`${padding},${height - padding} ${width - padding},${height - padding}`} />
      <polyline className="v5x-grid-line" points={`${padding},${height / 2} ${width - padding},${height / 2}`} />
      <polyline className="v5x-line-bp" points={bpPoints} />
      <polyline className="v5x-line-glucose" points={glucosePoints} />
      {bpLast && <circle cx={bpLast.x} cy={bpLast.y} r="3.5" fill="#2a9f7a" />}
      {glucoseLast && <circle cx={glucoseLast.x} cy={glucoseLast.y} r="3.5" fill="#2b82ca" />}
    </svg>
  );
}

function buildV5Summary(data) {
  const criticalLabs = data.labs.filter((item) => item.tone === "critical").length;
  const warningLabs = data.labs.filter((item) => item.tone === "warning").length;
  const bpOutOfTarget = data.monitored.bloodPressure.systolic > 135 || data.monitored.bloodPressure.diastolic > 85;
  const glucoseOutOfTarget = data.monitored.glucose.value > 6.1;

  return {
    title: "V5 Сводка по пациенту",
    generatedAt: new Date().toLocaleString("ru-RU"),
    highlights: [
      `Профиль: ${data.profile.sex}, ${data.profile.age} лет; ИМТ ${data.profile.bmi}.`,
      `АД ${data.monitored.bloodPressure.systolic}/${data.monitored.bloodPressure.diastolic}, пульс ${data.monitored.bloodPressure.pulse}.`,
      `Глюкоза крови ${data.monitored.glucose.value} ${data.monitored.glucose.unit}.`
    ],
    risks: [
      `${criticalLabs} критичных лабораторных показателя и ${warningLabs} со статусом «Внимание».`,
      bpOutOfTarget ? "Артериальное давление выше целевого диапазона." : "АД в пределах целевых значений.",
      glucoseOutOfTarget ? "Гликемия выше целевого уровня." : "Гликемия в целевом диапазоне."
    ],
    actions: [
      "Скорректировать антигипертензивную терапию и повторно оценить АД в ближайшие 3-5 дней.",
      "Усилить самоконтроль глюкозы и проверить приверженность сахароснижающей терапии.",
      "Перепроверить липиды и альбуминурию, затем уточнить план нефро- и кардиопротекции."
    ]
  };
}

function V5Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const stats = useMemo(() => {
    const critical = V5_DATA.labs.filter((item) => item.tone === "critical").length;
    const warning = V5_DATA.labs.filter((item) => item.tone === "warning").length;
    const ok = V5_DATA.labs.filter((item) => item.tone === "ok").length;
    return { critical, warning, ok, total: V5_DATA.labs.length };
  }, []);

  const eventsTotal = V5_DATA.consultations.length + V5_DATA.instrumental.length + V5_DATA.laboratoryStudies.length;

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setSummary(buildV5Summary(V5_DATA));
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="v5x-page page">
      <div className="v5x-glow v5x-glow-a" />
      <div className="v5x-glow v5x-glow-b" />

      <header className="panel v5x-hero animate-in">
        <div className="v5x-hero-main">
          <div className="brand-wrap">
            <BrandLogo />
            <div>
              <p className="eyebrow">МИС · V5 · Визуально усиленный клинический дашборд</p>
              <h1>Пациент АГ/СД: фокус на риски, тренды и действия</h1>
              <p className="subtitle">
                Снимок данных: {V5_DATA.snapshotDate}. Экран переработан под презентацию заказчику: меньше «табличности»,
                больше визуальной аналитики.
              </p>
            </div>
          </div>

          <article className="v5x-risk-card">
            <p>Индекс клинического риска</p>
            <strong>Высокий</strong>
            <span>{stats.critical} критичных + {stats.warning} предупреждений</span>
          </article>
        </div>

        <div className="v5x-metric-grid">
          <article className="v5x-metric danger">
            <p>Критичные лаборатории</p>
            <strong>{stats.critical}</strong>
          </article>
          <article className="v5x-metric warning">
            <p>Требуют внимания</p>
            <strong>{stats.warning}</strong>
          </article>
          <article className="v5x-metric neutral">
            <p>События в карточке</p>
            <strong>{eventsTotal}</strong>
          </article>
        </div>
      </header>

      <main className="v5x-flow">
        <section className="panel animate-in delay-1">
          <div className="v5x-clinical-grid">
            <article className="v5x-card">
              <h2>Общие данные</h2>
              <div className="v5x-profile-grid">
                <div><span>Пол</span><strong>{V5_DATA.profile.sex}</strong></div>
                <div><span>Возраст</span><strong>{V5_DATA.profile.age} лет</strong></div>
                <div><span>Рост</span><strong>{V5_DATA.profile.height} см</strong></div>
                <div><span>Вес</span><strong>{V5_DATA.profile.weight} кг</strong></div>
                <div><span>Окружность талии</span><strong>{V5_DATA.profile.waist} см</strong></div>
                <div><span>ИМТ</span><strong>{V5_DATA.profile.bmi}</strong></div>
              </div>
            </article>

            <article className="v5x-card">
              <h2>Мониторируемые показатели</h2>
              <div className="v5x-vitals-grid">
                <div className="v5x-vital">
                  <header>
                    <strong>Артериальное давление</strong>
                    <span>{V5_DATA.monitored.bloodPressure.date}</span>
                  </header>
                  <p>
                    <b>{V5_DATA.monitored.bloodPressure.systolic}/{V5_DATA.monitored.bloodPressure.diastolic}</b> мм рт.ст., пульс <b>{V5_DATA.monitored.bloodPressure.pulse}</b>
                  </p>
                  <small>ЦУ: {V5_DATA.monitored.bloodPressure.target}</small>
                  <Sparkline values={V5_DATA.trends.systolic} color="#2a9f7a" label="Тренд АД" />
                </div>
                <div className="v5x-vital">
                  <header>
                    <strong>Глюкоза крови</strong>
                    <span>{V5_DATA.monitored.glucose.date}</span>
                  </header>
                  <p>
                    <b>{V5_DATA.monitored.glucose.value}</b> {V5_DATA.monitored.glucose.unit}
                  </p>
                  <small>Целевой диапазон: {V5_DATA.monitored.glucose.target}</small>
                  <Sparkline values={V5_DATA.trends.glucose} color="#2b82ca" label="Тренд глюкозы" />
                </div>
              </div>
            </article>

            <article className="v5x-card">
              <h2>Значимые заболевания</h2>
              <ul className="v5x-list">
                {V5_DATA.majorDiseases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="panel animate-in delay-2">
          <div className="v5x-section-head">
            <h2>Динамика ключевых показателей</h2>
            <p>АД и глюкоза, последние {V5_DATA.trends.systolic.length} замеров (нормализовано)</p>
          </div>
          <div className="v5x-trend-wrap">
            <MultiTrendChart bpValues={V5_DATA.trends.systolic} glucoseValues={V5_DATA.trends.glucose} />
            <div className="v5x-trend-legend">
              <p><i className="bp" />САД (мм рт.ст.)</p>
              <p><i className="glucose" />Глюкоза (ммоль/л)</p>
            </div>
          </div>
        </section>

        <section className="panel animate-in delay-2">
          <div className="v5x-section-head">
            <h2>Лабораторный контур</h2>
            <p>{V5_DATA.labs.length} показателей с приоритизацией по риску</p>
          </div>
          <div className="v5x-lab-layout">
            <article className="v5x-card v5x-lab-status-card">
              <h3>Статус лабораторий</h3>
              <div className="v5x-status-wrap">
                <StatusDonut critical={stats.critical} warning={stats.warning} ok={stats.ok} />
                <ul className="v5x-legend">
                  <li><i className="danger" />Критично: {stats.critical}</li>
                  <li><i className="warning" />Внимание: {stats.warning}</li>
                  <li><i className="ok" />Норма: {stats.ok}</li>
                </ul>
              </div>
            </article>
            <div className="v5x-labs-grid">
              {V5_DATA.labs.map((item) => {
                const badge = toneMeta(item.tone);
                return (
                  <article className="v5x-lab-card" key={item.name}>
                    <div className="v5x-lab-head">
                      <h3>{item.name}</h3>
                      <span className={badge.cls}>{badge.label}</span>
                    </div>
                    <p className="v5x-lab-value">{trendArrow(item.trend)} {item.value} <span>({item.reference})</span></p>
                    <p className="v5x-date">Дата: {item.date}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="panel animate-in delay-3">
          <div className="v5x-section-head">
            <h2>События пациента</h2>
            <p>{eventsTotal}</p>
          </div>
          <div className="v5x-events-grid">
            <article className="v5x-events-card">
              <h3>Консультации</h3>
              <ul className="v5x-events">
                {V5_DATA.consultations.map((item, index) => (
                  <li key={`consult-${item.name}-${index}`}>
                    <strong>{item.name} {item.code ? `(${item.code})` : ""}</strong>
                    <span>{item.date}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="v5x-events-card">
              <h3>Инструментальные исследования</h3>
              <ul className="v5x-events">
                {V5_DATA.instrumental.map((item) => (
                  <li key={`inst-${item.name}`}>
                    <strong>{item.name}</strong>
                    <span>{item.date}</span>
                    <span>{item.note}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="v5x-events-card">
              <h3>Лабораторные исследования</h3>
              <ul className="v5x-events">
                {V5_DATA.laboratoryStudies.map((item, index) => (
                  <li key={`labs-${item.name}-${index}`}>
                    <strong>{item.name}</strong>
                    <span>{item.date}</span>
                    <span>Статус: {item.status}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="panel animate-in delay-3">
          <h2>Медикаментозная терапия</h2>
          <div className="v5x-therapy-grid">
            {V5_DATA.diseaseTherapy.map((item) => (
              <article className="v5x-therapy-card" key={item.name}>
                <header>
                  <h3>{item.name} <span>({item.icd})</span></h3>
                  <p>{item.date}</p>
                </header>
                <p>МКБ-10: <strong>{item.code}</strong></p>
                <p>Диагноз: <strong>{item.diagnosis}</strong></p>
                <h4>Назначения</h4>
                <ul className="v5x-list">
                  {item.meds.map((med) => (
                    <li key={med}>{med}</li>
                  ))}
                </ul>
              </article>
            ))}

            <article className="v5x-therapy-card">
              <header>
                <h3>{V5_DATA.comorbidTherapy.title}</h3>
                <p>{V5_DATA.comorbidTherapy.date}</p>
              </header>
              <p>МКБ-10: <strong>{V5_DATA.comorbidTherapy.icd}</strong></p>
              <p>Диагноз: <strong>{V5_DATA.comorbidTherapy.diagnosis}</strong></p>
              <h4>Рекомендации</h4>
              <ul className="v5x-list">
                {V5_DATA.comorbidTherapy.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="v5x-bottom-grid">
          <section className="panel v5x-summary-panel animate-in delay-4">
            <div className="v5x-summary-head">
              <h2>ИИ-сводка по пациенту</h2>
              <p>Коротко: ключевые риски и тактика на ближайший период</p>
            </div>

            <button className="summary-button" onClick={handleGenerateSummary} disabled={isGenerating}>
              {isGenerating ? "Готовим сводку..." : "Подготовить summary / сводку данных"}
            </button>

            {summary && (
              <div className="v5x-summary-grid">
                <article>
                  <h3>{summary.title}</h3>
                  <p className="v5x-date">Сформировано: {summary.generatedAt}</p>
                  <ul className="v5x-list">
                    {summary.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Риски</h3>
                  <ul className="v5x-list">
                    {summary.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <h3>Действия</h3>
                  <ul className="v5x-list">
                    {summary.actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            )}
          </section>

          <section className="panel animate-in delay-4">
            <h2>Быстрый просмотр ОАК</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Показатель</th>
                    <th>{V5_DATA.oakPreview.fromDate}</th>
                    <th>{V5_DATA.oakPreview.toDate}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{V5_DATA.oakPreview.metric}</td>
                    <td>{V5_DATA.oakPreview.fromValue}</td>
                    <td>{V5_DATA.oakPreview.toValue}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="v5x-date">При нажатии на показатель открывается график тренда дата/значение.</p>
          </section>
        </section>
      </main>
    </div>
  );
}

export default V5Dashboard;
