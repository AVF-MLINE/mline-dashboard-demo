import { useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const ROLES = ["Врач", "Управленец"];
const PERIODS = ["7 дней", "30 дней", "90 дней"];

const V2_DATA = {
  snapshotDate: "05.03.2026",
  totalPatients: 1248,
  agPatients: 842,
  sdPatients: 516,
  dataQuality: {
    completenessPct: 93,
    freshnessHours: 7,
    missingCriticalLabs: 18,
    sourceCoveragePct: 96
  },
  safetyNow: [
    {
      id: "critical24h",
      label: "Критические за 24ч",
      value: 37,
      tone: "danger",
      numerator: 37,
      denominator: 1248,
      source: "МИС + телемониторинг",
      formula: "Пациенты с красным триггером риска за 24 часа",
      patients: ["P-10452", "P-12114", "P-09341", "P-11840", "P-10211"]
    },
    {
      id: "newDecomp",
      label: "Новые декомпенсации",
      value: 64,
      tone: "warning",
      numerator: 64,
      denominator: 1248,
      source: "Карты наблюдения",
      formula: "Новые эпизоды >160/95 или HbA1c > 8 / гипогликемии",
      patients: ["P-10452", "P-11840", "P-10211", "P-13309", "P-12576"]
    },
    {
      id: "overdueExams",
      label: "Просроченные обследования",
      value: 112,
      tone: "warning",
      numerator: 112,
      denominator: 516,
      source: "Лабораторный контур",
      formula: "Нет обязательного контроля HbA1c/UACR/eGFR в целевом окне",
      patients: ["P-09155", "P-11432", "P-08761", "P-07422", "P-12207"]
    },
    {
      id: "smpCalls",
      label: "СМП/госпитализации",
      value: 23,
      tone: "neutral",
      numerator: 23,
      denominator: 1248,
      source: "ЕРИС + стационар",
      formula: "Вызовы СМП и экстренные госпитализации за 7 дней",
      patients: ["P-08219", "P-12017", "P-10452", "P-09178", "P-11755"]
    }
  ],
  careGaps: [
    { id: "uacrEgfr", label: "Нет UACR/eGFR ≤ 12 мес", due: 132, total: 516, owner: "Терапевт", priority: "high" },
    { id: "hba1c", label: "Нет HbA1c в срок", due: 88, total: 516, owner: "Эндокринолог", priority: "high" },
    { id: "footExam", label: "Нет осмотра стоп ≤ 12 мес", due: 146, total: 516, owner: "Кабинет диабетической стопы", priority: "medium" },
    { id: "retina", label: "Нет офтальмоскрининга ≤ 12 мес", due: 124, total: 516, owner: "Офтальмолог", priority: "medium" }
  ],
  therapyInertia: [
    { id: "agInertia", label: "АГ выше цели без интенсификации >30 дней", count: 121, total: 842, medianDays: 47 },
    { id: "sdInertia", label: "HbA1c > цели без коррекции >90 дней", count: 96, total: 516, medianDays: 128 },
    { id: "lipidInertia", label: "ЛПНП > цели без коррекции >60 дней", count: 113, total: 516, medianDays: 82 }
  ],
  actionQueue: [
    { id: "AQ-001", patientId: "P-10452", nosology: "АГ + СД", trigger: "АД 178/102, HbA1c 9.1", deadline: "до 14:00", owner: "Участковый врач", status: "Не начато" },
    { id: "AQ-002", patientId: "P-11840", nosology: "СД", trigger: "3 гипогликемии за 7 дней", deadline: "до 16:00", owner: "Эндокринолог", status: "В работе" },
    { id: "AQ-003", patientId: "P-10211", nosology: "АГ", trigger: "АД > 160/95 5 дней", deadline: "до 18:00", owner: "Кардиолог", status: "Не начато" },
    { id: "AQ-004", patientId: "P-13309", nosology: "АГ + СД", trigger: "Низкая приверженность терапии", deadline: "до завтра", owner: "Школа пациента", status: "В работе" },
    { id: "AQ-005", patientId: "P-09155", nosology: "СД", trigger: "Нет HbA1c > 6 мес", deadline: "до завтра", owner: "Колл-центр", status: "Не начато" },
    { id: "AQ-006", patientId: "P-12207", nosology: "СД", trigger: "Нет UACR/eGFR > 12 мес", deadline: "до завтра", owner: "Терапевт", status: "Назначено" }
  ],
  managerKpi: [
    { id: "waitCardio", label: "Среднее ожидание кардиолога", value: "5.8 дня", delta: "+0.7", numerator: 1334, denominator: 230, formula: "Все дни ожидания / число консультаций", source: "Расписание ЛПУ" },
    { id: "waitEndo", label: "Среднее ожидание эндокринолога", value: "6.4 дня", delta: "+0.5", numerator: 1216, denominator: 190, formula: "Все дни ожидания / число консультаций", source: "Расписание ЛПУ" },
    { id: "protocolVisits", label: "Выполнение протокольных визитов", value: "71%", delta: "-3 п.п.", numerator: 887, denominator: 1248, formula: "Выполненные визиты / план визитов", source: "МИС" },
    { id: "interFacilityVariance", label: "Вариабельность контроля по ЛПУ", value: "24 п.п.", delta: "+2 п.п.", numerator: 24, denominator: 100, formula: "Разница между максимальным и минимальным уровнем контроля по ЛПУ", source: "Свод по учреждениям" }
  ],
  metricPatients: {
    agControl: ["P-10112", "P-11604", "P-12011", "P-08122", "P-09165"],
    agAboveTarget: ["P-10452", "P-10211", "P-13309", "P-08865", "P-11002"],
    sdAtTarget: ["P-09761", "P-08542", "P-10902", "P-11208", "P-09441"],
    sdAbove8: ["P-10452", "P-11840", "P-09155", "P-12207", "P-12489"],
    cgmTirLow: ["P-11840", "P-10672", "P-10987", "P-12230", "P-12590"]
  }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getToneClass(tone) {
  if (tone === "danger") return "v2-tone-danger";
  if (tone === "warning") return "v2-tone-warning";
  if (tone === "good") return "v2-tone-good";
  return "v2-tone-neutral";
}

function buildSummary({
  role,
  period,
  safetyCards,
  dataQuality,
  agControlPct,
  sdControlPct,
  actionQueue,
  careGaps
}) {
  const critical = safetyCards.find((item) => item.id === "critical24h");
  const decomp = safetyCards.find((item) => item.id === "newDecomp");
  const overdue = safetyCards.find((item) => item.id === "overdueExams");
  const topQueue = actionQueue.slice(0, 3);
  const highGaps = careGaps.filter((item) => item.priority === "high");
  const confidence = clamp(0.65 + dataQuality.completenessPct / 300, 0.72, 0.94);

  const summary = {
    generatedAt: new Date().toLocaleString("ru-RU"),
    title: `Сводка V2 (${role}, период ${period})`,
    criticalNow: [
      `Критические события: ${critical.value} из ${critical.denominator} пациентов за 24 часа.`,
      `Новые декомпенсации: ${decomp.value} случаев; доля от когорты ${Math.round((decomp.value / decomp.denominator) * 100)}%.`,
      `Просроченные обязательные обследования: ${overdue.value} (приоритетно для маршрутизации).`
    ],
    trends: [
      `Контроль АГ по текущему профилю порогов: ${agControlPct}% (цель по профилю САД/ДАД).`,
      `Контроль СД по текущему порогу HbA1c: ${sdControlPct}% (индивидуализация целей обязательна).`,
      `Качество данных: полнота ${dataQuality.completenessPct}%, свежесть ${dataQuality.freshnessHours} ч.`
    ],
    firstToCheck: topQueue.map(
      (item) => `${item.patientId}: ${item.trigger}; срок реакции ${item.deadline}; ответственный ${item.owner}.`
    ),
    actions:
      role === "Управленец"
        ? [
            `Закрыть приоритетные клинические пробелы (${highGaps.length} направлений) через недельный план по ЛПУ.`,
            "Выделить дополнительные слоты к кардиологу и эндокринологу в перегруженных учреждениях.",
            "Провести аудит терапевтической инерции и контроль исполнения протокольных визитов."
          ]
        : [
            "Выполнить контакт с пациентами из красной очереди в пределах текущей смены.",
            "Провести коррекцию лечения у пациентов с устойчивым АД/HbA1c выше цели.",
            "Закрыть назначение обязательных обследований по клиническим пробелам при следующем контакте."
          ],
    confidence,
    limitations: [
      `Не хватает критических лабораторий: ${dataQuality.missingCriticalLabs}.`,
      "Доля данных из внешних источников ниже 100%: возможна задержка синхронизации.",
      "Сводка носит аналитический характер и не заменяет клиническое решение."
    ]
  };

  return summary;
}

function MetricTile({ title, value, subtitle, tone, meta, onOpen }) {
  return (
    <button type="button" className={`v2-metric-tile ${getToneClass(tone)}`} onClick={onOpen}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
      <div className="v2-metric-meta">
        <span>{`${meta.numerator}/${meta.denominator}`}</span>
        <span>{meta.period}</span>
      </div>
    </button>
  );
}

function V2Dashboard() {
  const [role, setRole] = useState("Врач");
  const [period, setPeriod] = useState("30 дней");
  const [bpSys, setBpSys] = useState(130);
  const [bpDia, setBpDia] = useState(80);
  const [hba1cTarget, setHba1cTarget] = useState(7.0);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLog, setSummaryLog] = useState([]);

  const agControlPct = useMemo(() => {
    const base = 58 + (bpSys - 130) * 0.45 + (bpDia - 80) * 0.35;
    return Math.round(clamp(base, 38, 84));
  }, [bpSys, bpDia]);

  const sdControlPct = useMemo(() => {
    const base = 46 + (hba1cTarget - 7) * 14;
    return Math.round(clamp(base, 30, 76));
  }, [hba1cTarget]);

  const agStats = useMemo(() => {
    const controlled = Math.round((V2_DATA.agPatients * agControlPct) / 100);
    const aboveTarget = V2_DATA.agPatients - controlled;
    return { controlled, aboveTarget };
  }, [agControlPct]);

  const sdStats = useMemo(() => {
    const atTarget = Math.round((V2_DATA.sdPatients * sdControlPct) / 100);
    const aboveTarget = V2_DATA.sdPatients - atTarget;
    const above8 = Math.round(aboveTarget * 0.62);
    return { atTarget, above8 };
  }, [sdControlPct]);

  const safetyCards = useMemo(
    () =>
      V2_DATA.safetyNow.map((item) => ({
        ...item,
        meta: {
          numerator: item.numerator,
          denominator: item.denominator,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: item.source,
          formula: item.formula
        }
      })),
    [period]
  );

  const clinicalMetrics = useMemo(
    () => [
      {
        id: "agControl",
        title: "АГ: в цели",
        value: `${agControlPct}%`,
        subtitle: `${agStats.controlled} пациентов`,
        tone: "good",
        patients: V2_DATA.metricPatients.agControl,
        meta: {
          numerator: agStats.controlled,
          denominator: V2_DATA.agPatients,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "МИС + домашние измерения",
          formula: `САД < ${bpSys} и ДАД < ${bpDia}`
        }
      },
      {
        id: "agAboveTarget",
        title: "АГ: выше цели",
        value: `${Math.round((agStats.aboveTarget / V2_DATA.agPatients) * 100)}%`,
        subtitle: `${agStats.aboveTarget} пациентов`,
        tone: "danger",
        patients: V2_DATA.metricPatients.agAboveTarget,
        meta: {
          numerator: agStats.aboveTarget,
          denominator: V2_DATA.agPatients,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "МИС + домашние измерения",
          formula: `САД >= ${bpSys} или ДАД >= ${bpDia}`
        }
      },
      {
        id: "sdAtTarget",
        title: "СД: HbA1c в цели",
        value: `${sdControlPct}%`,
        subtitle: `${sdStats.atTarget} пациентов`,
        tone: "good",
        patients: V2_DATA.metricPatients.sdAtTarget,
        meta: {
          numerator: sdStats.atTarget,
          denominator: V2_DATA.sdPatients,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "Лабораторная МИС",
          formula: `HbA1c <= ${hba1cTarget.toFixed(1)}%`
        }
      },
      {
        id: "sdAbove8",
        title: "СД: HbA1c > 8",
        value: `${Math.round((sdStats.above8 / V2_DATA.sdPatients) * 100)}%`,
        subtitle: `${sdStats.above8} пациентов`,
        tone: "warning",
        patients: V2_DATA.metricPatients.sdAbove8,
        meta: {
          numerator: sdStats.above8,
          denominator: V2_DATA.sdPatients,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "Лабораторная МИС",
          formula: "HbA1c > 8.0%"
        }
      },
      {
        id: "cgmTirLow",
        title: "НМГ: время в диапазоне < 70%",
        value: "38%",
        subtitle: "196 пациентов с НМГ",
        tone: "warning",
        patients: V2_DATA.metricPatients.cgmTirLow,
        meta: {
          numerator: 196,
          denominator: 516,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "Платформа телемониторинга",
          formula: "Время в целевом диапазоне < 70%"
        }
      },
      {
        id: "homeMonitoring",
        title: "Домашний мониторинг АД",
        value: "71%",
        subtitle: "активные ежедневные загрузки",
        tone: "neutral",
        patients: ["P-10452", "P-10211", "P-09761", "P-08122", "P-11002"],
        meta: {
          numerator: 598,
          denominator: 842,
          period,
          updatedAt: V2_DATA.snapshotDate,
          source: "Телемониторинг",
          formula: ">=4 измерения АД в неделю"
        }
      }
    ],
    [agControlPct, agStats, hba1cTarget, period, sdControlPct, sdStats]
  );

  const focusCards = role === "Управленец" ? V2_DATA.managerKpi : V2_DATA.careGaps;

  const metricDetails = selectedMetric
    ? [
        ...safetyCards,
        ...clinicalMetrics
      ].find((item) => item.id === selectedMetric)
    : null;

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      const next = buildSummary({
        role,
        period,
        safetyCards,
        dataQuality: V2_DATA.dataQuality,
        agControlPct,
        sdControlPct,
        actionQueue: V2_DATA.actionQueue,
        careGaps: V2_DATA.careGaps
      });

      setSummary(next);
      setSummaryLog((prev) => [
        {
          id: `SUM-${Date.now().toString().slice(-6)}`,
          requestedAt: next.generatedAt,
          role,
          period,
          modelVersion: "MIS-LLM-3.2",
          promptVersion: "summary-v2.4.1",
          confidence: next.confidence
        },
        ...prev
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="v2-page page">
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <header className="header panel animate-in">
        <div className="brand-wrap">
          <BrandLogo />
          <div>
            <p className="eyebrow">МИС V2 · Клинико-управленческий профиль</p>
            <h1>Единый дашборд АГ/СД с клиническими пробелами и очередью действий</h1>
            <p className="subtitle">
              Снимок данных: {V2_DATA.snapshotDate}. Пороговые цели настраиваются и влияют на расчеты метрик.
            </p>
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
          <div className="chips">
            {PERIODS.map((item) => (
              <button key={item} className={item === period ? "chip active" : "chip"} onClick={() => setPeriod(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="v2-layout">
        <section className="v2-main">
          <section className="panel animate-in delay-1">
            <h2>Критические сигналы и приоритеты</h2>
            <div className="v2-metrics-grid">
              {safetyCards.map((item) => (
                <MetricTile
                  key={item.id}
                  title={item.label}
                  value={item.value}
                  subtitle={`Источник: ${item.source}`}
                  tone={item.tone}
                  meta={item.meta}
                  onOpen={() => setSelectedMetric(item.id)}
                />
              ))}
            </div>
          </section>

          <section className="panel animate-in delay-2">
            <h2>Профиль порогов (конфигурируемый)</h2>
            <div className="v2-thresholds">
              <label>
                Цель САД
                <input type="number" min="110" max="160" value={bpSys} onChange={(event) => setBpSys(Number(event.target.value || 130))} />
              </label>
              <label>
                Цель ДАД
                <input type="number" min="60" max="100" value={bpDia} onChange={(event) => setBpDia(Number(event.target.value || 80))} />
              </label>
              <label>
                Цель HbA1c (%)
                <input type="number" step="0.1" min="6.0" max="9.0" value={hba1cTarget} onChange={(event) => setHba1cTarget(Number(event.target.value || 7))} />
              </label>
            </div>
          </section>

          <section className="panel animate-in delay-2">
            <h2>Контроль нозологий и стратификация</h2>
            <div className="v2-metrics-grid">
              {clinicalMetrics.map((item) => (
                <MetricTile
                  key={item.id}
                  title={item.title}
                  value={item.value}
                  subtitle={item.subtitle}
                  tone={item.tone}
                  meta={item.meta}
                  onOpen={() => setSelectedMetric(item.id)}
                />
              ))}
            </div>
          </section>

          <section className="panel animate-in delay-3">
            <h2>Очередь приоритетных задач</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Пациент</th>
                    <th>Нозология</th>
                    <th>Триггер</th>
                    <th>Срок реакции</th>
                    <th>Ответственный</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {V2_DATA.actionQueue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.patientId}</td>
                      <td>{item.nosology}</td>
                      <td>{item.trigger}</td>
                      <td>{item.deadline}</td>
                      <td>{item.owner}</td>
                      <td>
                        <span className={item.status === "Не начато" ? "risk-badge risk-highest" : item.status === "В работе" ? "risk-badge risk-high" : "risk-badge risk-mid"}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel animate-in delay-4">
            <h2>Терапевтическая инерция</h2>
            <div className="v2-inertia-grid">
              {V2_DATA.therapyInertia.map((item) => (
                <article key={item.id} className="v2-inline-card">
                  <h3>{item.label}</h3>
                  <p>
                    <strong>{item.count}</strong> из {item.total}
                  </p>
                  <p>Медиана задержки коррекции: {item.medianDays} дней</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel summary-panel animate-in delay-4">
            <button className="summary-button" onClick={handleGenerateSummary} disabled={isGenerating}>
              {isGenerating ? "ИИ анализирует данные..." : "Подготовить сводку данных"}
            </button>
            <p className="summary-note">
              Вывод содержит контекст, уверенность и ограничения данных. Лог запроса сохраняется в аудите ниже.
            </p>

            {summary && (
              <div className="v2-summary-grid">
                <article>
                  <h3>Что критично сейчас</h3>
                  <ul>{summary.criticalNow.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <h3>Тренды и контекст</h3>
                  <ul>{summary.trends.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <h3>Кого проверить первым</h3>
                  <ul>{summary.firstToCheck.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <h3>Действия на сегодня</h3>
                  <ul>{summary.actions.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <h3>Ограничения</h3>
                  <ul>{summary.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <h3>Качество сводки</h3>
                  <p>{summary.title}</p>
                  <p>Сформировано: {summary.generatedAt}</p>
                  <p>Уверенность: {(summary.confidence * 100).toFixed(0)}%</p>
                </article>
              </div>
            )}
          </section>
        </section>

        <aside className="v2-side">
          <section className="panel animate-in delay-2">
            <h2>Качество данных</h2>
            <div className="v2-inline-card">
              <p>Полнота данных</p>
              <strong>{V2_DATA.dataQuality.completenessPct}%</strong>
              <p>Свежесть: {V2_DATA.dataQuality.freshnessHours} ч</p>
              <p>Покрытие источников: {V2_DATA.dataQuality.sourceCoveragePct}%</p>
              <p>Отсутствуют критические лаборатории: {V2_DATA.dataQuality.missingCriticalLabs}</p>
            </div>
          </section>

          <section className="panel animate-in delay-3">
            <h2>{role === "Управленец" ? "Процессные показатели" : "Пробелы наблюдения"}</h2>
            <div className="v2-focus-list">
              {focusCards.map((item) =>
                role === "Управленец" ? (
                  <article key={item.id} className="v2-inline-card">
                    <h3>{item.label}</h3>
                    <p>
                      <strong>{item.value}</strong> <span>{item.delta}</span>
                    </p>
                    <p>{item.formula}</p>
                    <p>Источник: {item.source}</p>
                  </article>
                ) : (
                  <article key={item.id} className="v2-inline-card">
                    <h3>{item.label}</h3>
                    <p>
                      <strong>{item.due}</strong> из {item.total}
                    </p>
                    <p>Ответственный: {item.owner}</p>
                    <p>Приоритет: {item.priority === "high" ? "Высокий" : "Средний"}</p>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="panel animate-in delay-4">
            <h2>Аудит запросов сводки</h2>
            {summaryLog.length === 0 ? (
              <p className="subtitle">Запросов сводки пока нет.</p>
            ) : (
              <ul className="v2-audit-list">
                {summaryLog.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.id}</strong>
                    <span>{entry.requestedAt}</span>
                    <span>
                      {entry.role} · {entry.period}
                    </span>
                    <span>
                      {entry.modelVersion} / {entry.promptVersion}
                    </span>
                    <span>Уверенность {(entry.confidence * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </main>

      {metricDetails && (
        <section className="panel v2-drawer animate-in">
          <div className="v2-drawer-head">
            <div>
              <h2>{metricDetails.title || metricDetails.label}</h2>
              <p className="subtitle">{metricDetails.meta.formula}</p>
            </div>
            <button className="chip" onClick={() => setSelectedMetric(null)}>
              Закрыть
            </button>
          </div>
          <div className="v2-drawer-grid">
            <article className="v2-inline-card">
              <h3>Метаданные метрики</h3>
              <p>{`${metricDetails.meta.numerator}/${metricDetails.meta.denominator}`}</p>
              <p>Период: {metricDetails.meta.period}</p>
              <p>Обновлено: {metricDetails.meta.updatedAt}</p>
              <p>Источник: {metricDetails.meta.source}</p>
            </article>
            <article className="v2-inline-card">
              <h3>Детализация (пример ID)</h3>
              <ul className="v2-mini-list">
                {(metricDetails.patients || []).map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}

export default V2Dashboard;
