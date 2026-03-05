import { useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const PERIODS = ["7 дней", "30 дней", "90 дней"];
const ROLES = ["Врач", "Управленец"];
const VIEWS = ["Сводный", "Клинический", "Операционный"];

const DASHBOARD_DATA = {
  snapshotDate: "05.03.2026",
  totalPatients: 1248,
  hypertension: {
    patients: 842,
    controlledPct: 58,
    uncontrolledCount: 193,
    criticalCount: 27,
    avgSystolic: 146,
    avgDiastolic: 91,
    pulseAvg: 78,
    trend: [154, 152, 150, 151, 149, 148, 146]
  },
  diabetes: {
    patients: 516,
    hba1cControlledPct: 46,
    highRiskCount: 88,
    hypoEpisodesMonth: 31,
    avgGlucose: 8.4,
    trend: [9.3, 9.1, 8.9, 8.8, 8.7, 8.5, 8.4]
  },
  labs: [
    { name: "HbA1c", value: 8.2, target: "< 7.0", unit: "%", status: "critical", delta: "+0.4" },
    { name: "Глюкоза натощак", value: 8.6, target: "< 7.0", unit: "ммоль/л", status: "warning", delta: "+0.5" },
    { name: "Креатинин", value: 94, target: "< 106", unit: "мкмоль/л", status: "ok", delta: "-2" },
    { name: "Микроальбуминурия", value: 46, target: "< 30", unit: "мг/г", status: "warning", delta: "+8" },
    { name: "ЛПНП", value: 3.4, target: "< 2.6", unit: "ммоль/л", status: "warning", delta: "+0.2" },
    { name: "Триглицериды", value: 2.1, target: "< 1.7", unit: "ммоль/л", status: "warning", delta: "+0.1" }
  ],
  riskQueue: [
    {
      patientId: "P-10452",
      age: 67,
      nosology: "АГ + СД",
      risk: "Очень высокий",
      reason: "АД 178/102, HbA1c 9.1",
      lastContact: "Вчера"
    },
    {
      patientId: "P-11840",
      age: 59,
      nosology: "СД",
      risk: "Высокий",
      reason: "3 эпизода гипогликемии за 7 дней",
      lastContact: "2 дня назад"
    },
    {
      patientId: "P-10211",
      age: 71,
      nosology: "АГ",
      risk: "Высокий",
      reason: "Устойчивое АД > 160/95",
      lastContact: "Сегодня"
    },
    {
      patientId: "P-13309",
      age: 64,
      nosology: "АГ + СД",
      risk: "Средний",
      reason: "Низкая приверженность терапии",
      lastContact: "3 дня назад"
    }
  ],
  consultations: [
    { type: "Кардиолог", date: "03.03.2026", count: 115 },
    { type: "Эндокринолог", date: "04.03.2026", count: 98 },
    { type: "Терапевт", date: "04.03.2026", count: 264 }
  ],
  studies: [
    { name: "ЭКГ", date: "01.03.2026", count: 204 },
    { name: "Эхо-КГ", date: "27.02.2026", count: 61 },
    { name: "УЗИ брюшной полости", date: "26.02.2026", count: 54 }
  ],
  facilitiesLoad: [
    { facility: "ГП №4", overloadPct: 18, waitingDays: 6 },
    { facility: "ГП №9", overloadPct: 12, waitingDays: 5 },
    { facility: "ГБ №2", overloadPct: 9, waitingDays: 4 }
  ],
  medication: {
    ag: [
      "Периндоприл 10 мг утром",
      "Индапамид 1.5 мг утром",
      "Амлодипин 5 мг вечером"
    ],
    sd: [
      "Метформин 1000 мг 2 раза в день",
      "Дапаглифлозин 10 мг утром",
      "Базальный инсулин по схеме титрации"
    ]
  },
  therapyInsights: [
    "АГ: у 34% пациентов не достигнут целевой уровень АД при текущей схеме.",
    "СД: у 29% пациентов HbA1c > 8.0 в течение 3+ месяцев.",
    "Комбинированная нозология (АГ+СД): 22% имеют высокий риск ССО."
  ]
};

function getTrendDirection(values) {
  if (!values.length) return "flat";
  const diff = values[values.length - 1] - values[0];
  if (diff > 0.1) return "up";
  if (diff < -0.1) return "down";
  return "flat";
}

function getStatusMeta(status) {
  if (status === "critical") return { label: "Критично", cls: "status-critical" };
  if (status === "warning") return { label: "Внимание", cls: "status-warning" };
  return { label: "Норма", cls: "status-ok" };
}

function Sparkline({ data, color }) {
  const width = 260;
  const height = 92;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, idx) => {
      const x = (idx / (data.length - 1)) * (width - 16) + 8;
      const y = height - ((value - min) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");
  const lastPointX = width - 8;
  const lastPointY = height - ((data[data.length - 1] - min) / range) * (height - 16) - 8;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Тренд показателя">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" points={points} />
      <circle cx={lastPointX} cy={lastPointY} r="4" fill={color} />
    </svg>
  );
}

function buildSummary(data, role, period, view) {
  const agCriticalShare = Math.round((data.hypertension.criticalCount / data.hypertension.patients) * 100);
  const sdRiskShare = Math.round((data.diabetes.highRiskCount / data.diabetes.patients) * 100);
  const topRiskPatients = data.riskQueue.slice(0, 3);
  const agTrend = getTrendDirection(data.hypertension.trend);
  const sdTrend = getTrendDirection(data.diabetes.trend);

  const keyFindings = [
    `В анализе ${data.totalPatients} пациентов за период ${period}; из них по АГ — ${data.hypertension.patients}, по СД — ${data.diabetes.patients}.`,
    `По АГ целевого контроля достигают ${data.hypertension.controlledPct}%, при этом ${agCriticalShare}% находятся в критической зоне.`,
    `По СД уровень контроля HbA1c достигнут у ${data.diabetes.hba1cControlledPct}%; высокий риск у ${sdRiskShare}% пациентов.`
  ];

  const trendFindings = [
    agTrend === "down"
      ? "Среднее САД/ДАД снижается, но остается выше целевого диапазона."
      : "По АГ нет устойчивого улучшения: требуется коррекция маршрутизации и терапии.",
    sdTrend === "down"
      ? "По СД наблюдается позитивный тренд гликемии, однако темп снижения недостаточен."
      : "По СД отмечен неблагоприятный тренд гликемии; растет нагрузка на эндокринологов."
  ];

  const priorityChecks = topRiskPatients.map(
    (item) => `${item.patientId} (${item.nosology}) — ${item.reason}. Последний контакт: ${item.lastContact}.`
  );

  const actions =
    role === "Управленец"
      ? [
          "Перераспределить поток пациентов АГ/СД между перегруженными ЛПУ и усилить слотирование к кардиологу/эндокринологу.",
          "Инициировать целевой аудит пациентов с HbA1c > 8 и АД > 160/95 в разрезе учреждений.",
          "Проверить соблюдение протоколов диспансерного наблюдения и частоту контрольных визитов."
        ]
      : [
          "Приоритизировать очный контакт с пациентами очень высокого риска в ближайшие 24 часа.",
          "Пересмотреть схемы терапии у пациентов с устойчивым АД > 160/95 и HbA1c > 8.0.",
          "Назначить внеплановый лабораторный контроль (HbA1c, ЛПНП, МАУ) для группы риска."
        ];

  return {
    generatedAt: new Date().toLocaleString("ru-RU"),
    title: `Summary (${role}, ${view.toLowerCase()} режим)`,
    keyFindings,
    trendFindings,
    priorityChecks,
    actions
  };
}

function V1Dashboard() {
  const [role, setRole] = useState("Врач");
  const [period, setPeriod] = useState("30 дней");
  const [view, setView] = useState("Сводный");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const agTrendDirection = useMemo(() => getTrendDirection(DASHBOARD_DATA.hypertension.trend), []);
  const sdTrendDirection = useMemo(() => getTrendDirection(DASHBOARD_DATA.diabetes.trend), []);

  const kpis = useMemo(
    () => [
      { label: "Всего пациентов", value: DASHBOARD_DATA.totalPatients, tone: "neutral" },
      { label: "Критические случаи", value: DASHBOARD_DATA.hypertension.criticalCount + DASHBOARD_DATA.diabetes.highRiskCount, tone: "danger" },
      { label: "Контроль АГ", value: `${DASHBOARD_DATA.hypertension.controlledPct}%`, tone: "good" },
      { label: "Контроль СД", value: `${DASHBOARD_DATA.diabetes.hba1cControlledPct}%`, tone: "warning" }
    ],
    []
  );

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setSummary(buildSummary(DASHBOARD_DATA, role, period, view));
      setIsGenerating(false);
    }, 1100);
  };

  return (
    <div className="page">
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <header className="header panel animate-in">
        <div>
          <div className="brand-wrap">
            <BrandLogo />
            <div>
              <p className="eyebrow">Медицинская информационная система</p>
              <h1>Дашборд по нозологиям АГ и СД</h1>
              <p className="subtitle">Снимок данных: {DASHBOARD_DATA.snapshotDate}. Интеграция под клинический и управленческий контур.</p>
            </div>
          </div>
        </div>
        <div className="controls">
          <div className="segmented">
            {ROLES.map((item) => (
              <button key={item} className={item === role ? "seg active" : "seg"} onClick={() => setRole(item)}>
                {item}
              </button>
            ))}
          </div>
          <select className="view-select" value={view} onChange={(event) => setView(event.target.value)}>
            {VIEWS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <div className="chips">
            {PERIODS.map((item) => (
              <button key={item} className={item === period ? "chip active" : "chip"} onClick={() => setPeriod(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="main-column">
          <section className="panel animate-in delay-1">
            <h2>Ключевые метрики</h2>
            <div className="kpi-grid">
              {kpis.map((item) => (
                <article key={item.label} className={`kpi-card ${item.tone}`}>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="panel animate-in delay-2">
            <h2>Мониторинг нозологий</h2>
            <div className="nosology-grid">
              <article className="nosology-card">
                <header>
                  <h3>Артериальная гипертензия (АГ)</h3>
                  <span className={agTrendDirection === "down" ? "trend good" : "trend warning"}>
                    {agTrendDirection === "down" ? "Тренд улучшается" : "Требуется внимание"}
                  </span>
                </header>
                <p>
                  Среднее АД: <strong>{DASHBOARD_DATA.hypertension.avgSystolic}/{DASHBOARD_DATA.hypertension.avgDiastolic}</strong> мм рт. ст.
                </p>
                <p>
                  Средний пульс: <strong>{DASHBOARD_DATA.hypertension.pulseAvg}</strong> уд/мин
                </p>
                <p>
                  Неконтролируемое АД: <strong>{DASHBOARD_DATA.hypertension.uncontrolledCount}</strong> пациентов
                </p>
                <Sparkline data={DASHBOARD_DATA.hypertension.trend} color="#0b8f74" />
              </article>

              <article className="nosology-card">
                <header>
                  <h3>Сахарный диабет (СД)</h3>
                  <span className={sdTrendDirection === "down" ? "trend good" : "trend warning"}>
                    {sdTrendDirection === "down" ? "Тренд улучшается" : "Требуется внимание"}
                  </span>
                </header>
                <p>
                  Средняя глюкоза: <strong>{DASHBOARD_DATA.diabetes.avgGlucose}</strong> ммоль/л
                </p>
                <p>
                  Высокий риск декомпенсации: <strong>{DASHBOARD_DATA.diabetes.highRiskCount}</strong> пациентов
                </p>
                <p>
                  Эпизоды гипогликемии за месяц: <strong>{DASHBOARD_DATA.diabetes.hypoEpisodesMonth}</strong>
                </p>
                <Sparkline data={DASHBOARD_DATA.diabetes.trend} color="#1a7ec8" />
              </article>
            </div>
          </section>

          {view !== "Операционный" && (
            <section className="panel animate-in delay-3">
              <h2>Лабораторные показатели</h2>
              <div className="labs-grid">
                {DASHBOARD_DATA.labs.map((lab) => {
                  const statusMeta = getStatusMeta(lab.status);
                  return (
                    <article key={lab.name} className="lab-card">
                      <div className="lab-head">
                        <h3>{lab.name}</h3>
                        <span className={`status ${statusMeta.cls}`}>{statusMeta.label}</span>
                      </div>
                      <p className="lab-value">
                        {lab.value} <span>{lab.unit}</span>
                      </p>
                      <p>Цель: {lab.target}</p>
                      <p>Δ к прошлому периоду: {lab.delta}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="panel animate-in delay-4">
            <h2>Приоритет пациентов для контроля</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Возраст</th>
                    <th>Нозология</th>
                    <th>Риск</th>
                    <th>Основание</th>
                    <th>Последний контакт</th>
                  </tr>
                </thead>
                <tbody>
                  {DASHBOARD_DATA.riskQueue.map((row) => (
                    <tr key={row.patientId}>
                      <td>{row.patientId}</td>
                      <td>{row.age}</td>
                      <td>{row.nosology}</td>
                      <td>
                        <span className={row.risk === "Очень высокий" ? "risk-badge risk-highest" : row.risk === "Высокий" ? "risk-badge risk-high" : "risk-badge risk-mid"}>
                          {row.risk}
                        </span>
                      </td>
                      <td>{row.reason}</td>
                      <td>{row.lastContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {view !== "Операционный" && (
            <section className="panel animate-in delay-4">
              <h2>Медикаментозная терапия (активные схемы)</h2>
              <div className="med-grid">
                <article className="med-card">
                  <h3>АГ</h3>
                  <ul>
                    {DASHBOARD_DATA.medication.ag.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                <article className="med-card">
                  <h3>СД</h3>
                  <ul>
                    {DASHBOARD_DATA.medication.sd.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          )}
        </section>

        <aside className="side-column">
          <section className="panel animate-in delay-2">
            <h2>Консультации</h2>
            <ul className="list">
              {DASHBOARD_DATA.consultations.map((item) => (
                <li key={item.type}>
                  <strong>{item.type}</strong>
                  <span>{item.date}</span>
                  <span>{item.count} визитов</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel animate-in delay-3">
            <h2>Нагрузка ЛПУ</h2>
            <ul className="list">
              {DASHBOARD_DATA.facilitiesLoad.map((item) => (
                <li key={item.facility}>
                  <strong>{item.facility}</strong>
                  <span>Перегрузка: {item.overloadPct}%</span>
                  <span>Ожидание: {item.waitingDays} дней</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel animate-in delay-3">
            <h2>Инструментальные исследования</h2>
            <ul className="list">
              {DASHBOARD_DATA.studies.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.date}</span>
                  <span>{item.count} исследований</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel animate-in delay-4">
            <h2>Терапевтические инсайты</h2>
            <ul className="insights">
              {DASHBOARD_DATA.therapyInsights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </aside>
      </main>

      <div className="summary-cta panel animate-in delay-4">
        <button className="summary-button" onClick={handleGenerateSummary} disabled={isGenerating}>
          {isGenerating ? "AI анализирует данные..." : "Подготовить summary / сводку данных"}
        </button>
        <p className="summary-note">Сводка формируется по текущим фильтрам, роли пользователя и выбранному режиму дашборда.</p>
      </div>

      {summary && (
        <section className="panel summary-panel animate-in delay-2">
          <div className="summary-head">
            <h2>{summary.title}</h2>
            <span>Сформировано: {summary.generatedAt}</span>
          </div>

          <div className="summary-grid">
            <article>
              <h3>Что важно сейчас</h3>
              <ul>
                {summary.keyFindings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Тренды</h3>
              <ul>
                {summary.trendFindings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Кого проверить в первую очередь</h3>
              <ul>
                {summary.priorityChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Рекомендуемые действия</h3>
              <ul>
                {summary.actions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="disclaimer">
            AI summary носит аналитический характер и не заменяет клиническое решение врача.
          </p>
        </section>
      )}
    </div>
  );
}

export default V1Dashboard;
