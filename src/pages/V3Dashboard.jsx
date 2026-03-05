import { useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const ROLES = ["Врач", "Управленец"];
const PERIODS = ["7 дней", "30 дней", "90 дней"];
const QUEUE_FILTERS = ["Все", "Красный", "Желтый", "Зеленый"];

const V3_DATA = {
  snapshotDate: "05.03.2026",
  totalPatients: 1248,
  agTotal: 842,
  sdTotal: 516,
  focus: {
    critical24h: 37,
    overdueChecks: 112,
    activeTasksToday: 28,
    completedTasksToday: 17
  },
  queue: [
    { id: "Q-301", patientId: "P-10452", problem: "АД 178/102 и HbA1c 9.1", due: "до 14:00", owner: "Участковый врач", level: "Красный" },
    { id: "Q-302", patientId: "P-11840", problem: "3 гипогликемии за 7 дней", due: "до 16:00", owner: "Эндокринолог", level: "Красный" },
    { id: "Q-303", patientId: "P-10211", problem: "АД > 160/95 5 дней", due: "до 18:00", owner: "Кардиолог", level: "Красный" },
    { id: "Q-304", patientId: "P-13309", problem: "Низкая приверженность терапии", due: "до завтра", owner: "Школа пациента", level: "Желтый" },
    { id: "Q-305", patientId: "P-09155", problem: "Нет HbA1c > 6 мес", due: "до завтра", owner: "Колл-центр", level: "Желтый" },
    { id: "Q-306", patientId: "P-12207", problem: "Нет UACR/eGFR > 12 мес", due: "до завтра", owner: "Терапевт", level: "Желтый" },
    { id: "Q-307", patientId: "P-12066", problem: "Нет ретинального скрининга", due: "в течение 3 дней", owner: "Офтальмолог", level: "Зеленый" },
    { id: "Q-308", patientId: "P-11732", problem: "Нет осмотра стоп", due: "в течение 3 дней", owner: "Кабинет стопы", level: "Зеленый" }
  ],
  clinical: {
    ag: {
      inTargetPct: 58,
      aboveTargetPct: 42,
      veryHighRiskPct: 11,
      homeMonitoringPct: 71
    },
    sd: {
      hba1cTargetPct: 46,
      hba1cAbove8Pct: 34,
      cgmLowTirPct: 38,
      hypoRiskPct: 13
    }
  },
  gaps: [
    { id: "g1", title: "Нет UACR/eGFR в срок", due: 132, total: 516, owner: "Терапевт" },
    { id: "g2", title: "Нет HbA1c в срок", due: 88, total: 516, owner: "Эндокринолог" },
    { id: "g3", title: "Нет осмотра стоп", due: 146, total: 516, owner: "Кабинет стопы" },
    { id: "g4", title: "Нет офтальмоскрининга", due: 124, total: 516, owner: "Офтальмолог" }
  ],
  quality: {
    completenessPct: 93,
    freshnessHours: 7,
    sourceCoveragePct: 96,
    missingCriticalLabs: 18
  },
  load: [
    { specialist: "Кардиолог", waitingDays: 5.8, loadPct: 86 },
    { specialist: "Эндокринолог", waitingDays: 6.4, loadPct: 91 },
    { specialist: "Терапевт", waitingDays: 3.2, loadPct: 78 }
  ]
};

function getLevelClass(level) {
  if (level === "Красный") return "v3-level-red";
  if (level === "Желтый") return "v3-level-yellow";
  return "v3-level-green";
}

function buildV3Summary({ role, period, queue, quality, focus, gaps }) {
  const red = queue.filter((item) => item.level === "Красный").length;
  const yellow = queue.filter((item) => item.level === "Желтый").length;
  const top = queue.slice(0, 3);
  const topGap = gaps
    .slice()
    .sort((a, b) => b.due - a.due)[0];

  return {
    title: `Сводка V3 (${role}, период ${period})`,
    generatedAt: new Date().toLocaleString("ru-RU"),
    headline: `Сегодня в фокусе ${focus.activeTasksToday} задач, из них ${red} срочных.`,
    highlights: [
      `Критические пациенты за 24 часа: ${focus.critical24h}.`,
      `Просроченные обязательные обследования: ${focus.overdueChecks}.`,
      `Качество данных: полнота ${quality.completenessPct}%, свежесть ${quality.freshnessHours} ч.`
    ],
    priorities: top.map(
      (item) => `${item.patientId}: ${item.problem}; срок реакции ${item.due}; ответственный ${item.owner}.`
    ),
    actions:
      role === "Управленец"
        ? [
            `В первую очередь закрыть блок "${topGap.title}" (${topGap.due} пациентов).`,
            "Перераспределить нагрузку между кардиологами и эндокринологами на ближайшие 48 часов.",
            `Контролировать исполнение по желтому контуру (${yellow} задач) до конца недели.`
          ]
        : [
            "Закрыть красный контур сегодня в пределах смены.",
            "На следующем контакте назначать недостающие обследования из блока пробелов наблюдения.",
            "Фиксировать результат действия по каждой задаче в МИС сразу после контакта."
          ],
    limitations: [
      `Отсутствуют критические лаборатории: ${quality.missingCriticalLabs}.`,
      "Сводка аналитическая и не заменяет клиническое решение."
    ]
  };
}

function FocusTile({ title, value, subtitle, tone }) {
  return (
    <article className={`v3-focus-tile ${tone}`}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </article>
  );
}

function V3Dashboard() {
  const [role, setRole] = useState("Врач");
  const [period, setPeriod] = useState("30 дней");
  const [queueFilter, setQueueFilter] = useState("Все");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const filteredQueue = useMemo(() => {
    if (queueFilter === "Все") return V3_DATA.queue;
    return V3_DATA.queue.filter((item) => item.level === queueFilter);
  }, [queueFilter]);

  const completedPct = useMemo(() => {
    return Math.round((V3_DATA.focus.completedTasksToday / V3_DATA.focus.activeTasksToday) * 100);
  }, []);

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setSummary(
        buildV3Summary({
          role,
          period,
          queue: filteredQueue,
          quality: V3_DATA.quality,
          focus: V3_DATA.focus,
          gaps: V3_DATA.gaps
        })
      );
      setIsGenerating(false);
    }, 900);
  };

  return (
    <div className="v3-page page">
      <div className="v3-glow v3-glow-a" />
      <div className="v3-glow v3-glow-b" />

      <header className="panel v3-hero animate-in">
        <div className="v3-head-top">
          <div className="brand-wrap">
            <BrandLogo />
            <div>
              <p className="eyebrow">МИС V3 · Оптимальный сценарий</p>
              <h1>Дашборд АГ/СД с приоритетом действий на текущий день</h1>
              <p className="subtitle">Снимок данных: {V3_DATA.snapshotDate}. Сначала показываем риск и задачу, затем аналитику.</p>
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
        </div>

        <div className="v3-focus-grid">
          <FocusTile title="Критические за 24 часа" value={V3_DATA.focus.critical24h} subtitle={`из ${V3_DATA.totalPatients} пациентов`} tone="danger" />
          <FocusTile title="Просроченные обследования" value={V3_DATA.focus.overdueChecks} subtitle="нужна маршрутизация" tone="warning" />
          <FocusTile
            title="Задачи на сегодня"
            value={`${V3_DATA.focus.completedTasksToday}/${V3_DATA.focus.activeTasksToday}`}
            subtitle={`выполнено ${completedPct}%`}
            tone="good"
          />
        </div>
      </header>

      <main className="v3-layout">
        <section className="v3-main">
          <section className="panel animate-in delay-1">
            <div className="v3-section-head">
              <h2>Очередь приоритетных задач</h2>
              <div className="chips">
                {QUEUE_FILTERS.map((item) => (
                  <button key={item} className={item === queueFilter ? "chip active" : "chip"} onClick={() => setQueueFilter(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Пациент</th>
                    <th>Клинический триггер</th>
                    <th>Срок реакции</th>
                    <th>Ответственный</th>
                    <th>Приоритет</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.patientId}</td>
                      <td>{item.problem}</td>
                      <td>{item.due}</td>
                      <td>{item.owner}</td>
                      <td>
                        <span className={`v3-level ${getLevelClass(item.level)}`}>{item.level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel animate-in delay-2">
            <h2>Клинический срез по нозологиям</h2>
            <div className="v3-nosology-grid">
              <article className="v3-nosology-card">
                <h3>Артериальная гипертензия (АГ)</h3>
                <p className="v3-key-number">{V3_DATA.clinical.ag.inTargetPct}%</p>
                <p className="subtitle">в целевом диапазоне АД</p>
                <div className="v3-bars">
                  <div>
                    <span>В цели</span>
                    <div className="v3-bar"><i style={{ width: `${V3_DATA.clinical.ag.inTargetPct}%` }} /></div>
                  </div>
                  <div>
                    <span>Выше цели</span>
                    <div className="v3-bar warn"><i style={{ width: `${V3_DATA.clinical.ag.aboveTargetPct}%` }} /></div>
                  </div>
                  <div>
                    <span>Очень высокий риск</span>
                    <div className="v3-bar danger"><i style={{ width: `${V3_DATA.clinical.ag.veryHighRiskPct * 2}%` }} /></div>
                  </div>
                </div>
                <p className="v3-note">Домашний мониторинг АД: {V3_DATA.clinical.ag.homeMonitoringPct}% пациентов.</p>
              </article>

              <article className="v3-nosology-card">
                <h3>Сахарный диабет (СД)</h3>
                <p className="v3-key-number">{V3_DATA.clinical.sd.hba1cTargetPct}%</p>
                <p className="subtitle">в целевом диапазоне HbA1c</p>
                <div className="v3-bars">
                  <div>
                    <span>HbA1c в цели</span>
                    <div className="v3-bar"><i style={{ width: `${V3_DATA.clinical.sd.hba1cTargetPct}%` }} /></div>
                  </div>
                  <div>
                    <span>HbA1c &gt; 8</span>
                    <div className="v3-bar warn"><i style={{ width: `${V3_DATA.clinical.sd.hba1cAbove8Pct}%` }} /></div>
                  </div>
                  <div>
                    <span>Время в диапазоне &lt; 70%</span>
                    <div className="v3-bar danger"><i style={{ width: `${V3_DATA.clinical.sd.cgmLowTirPct}%` }} /></div>
                  </div>
                </div>
                <p className="v3-note">Риск гипогликемии: {V3_DATA.clinical.sd.hypoRiskPct}% пациентов.</p>
              </article>
            </div>
          </section>

          <section className="panel animate-in delay-3">
            <h2>Пробелы наблюдения</h2>
            <div className="v3-gaps-grid">
              {V3_DATA.gaps.map((gap) => {
                const pct = Math.round((gap.due / gap.total) * 100);
                return (
                  <article key={gap.id} className="v3-gap-card">
                    <h3>{gap.title}</h3>
                    <p>
                      <strong>{gap.due}</strong> из {gap.total}
                    </p>
                    <div className="v3-bar"><i style={{ width: `${pct}%` }} /></div>
                    <p className="v3-note">Ответственный: {gap.owner}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <aside className="v3-side">
          <section className="panel animate-in delay-2">
            <h2>ИИ-сводка</h2>
            <button className="summary-button" onClick={handleGenerateSummary} disabled={isGenerating}>
              {isGenerating ? "Готовим сводку..." : "Подготовить сводку данных"}
            </button>
            <p className="summary-note">Кратко: главное, приоритет, что сделать сегодня.</p>

            {summary && (
              <div className="v3-summary">
                <p className="v3-summary-title">{summary.title}</p>
                <p>{summary.headline}</p>
                <ul>
                  {summary.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>Приоритетные пациенты</h3>
                <ul>
                  {summary.priorities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>Действия на сегодня</h3>
                <ul>
                  {summary.actions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>Ограничения</h3>
                <ul>
                  {summary.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="v3-note">Сформировано: {summary.generatedAt}</p>
              </div>
            )}
          </section>

          <section className="panel animate-in delay-3">
            <h2>Качество данных</h2>
            <div className="v3-quality-grid">
              <article className="v3-quality-card">
                <p>Полнота</p>
                <strong>{V3_DATA.quality.completenessPct}%</strong>
              </article>
              <article className="v3-quality-card">
                <p>Свежесть</p>
                <strong>{V3_DATA.quality.freshnessHours} ч</strong>
              </article>
              <article className="v3-quality-card">
                <p>Покрытие источников</p>
                <strong>{V3_DATA.quality.sourceCoveragePct}%</strong>
              </article>
              <article className="v3-quality-card">
                <p>Отсутствуют критические лаборатории</p>
                <strong>{V3_DATA.quality.missingCriticalLabs}</strong>
              </article>
            </div>
          </section>

          <section className="panel animate-in delay-4">
            <h2>Нагрузка специалистов</h2>
            <div className="v3-load-list">
              {V3_DATA.load.map((item) => (
                <article key={item.specialist} className="v3-load-item">
                  <div>
                    <h3>{item.specialist}</h3>
                    <p>Ожидание: {item.waitingDays} дня</p>
                  </div>
                  <div className="v3-bar">
                    <i style={{ width: `${item.loadPct}%` }} />
                  </div>
                  <p>Загрузка: {item.loadPct}%</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default V3Dashboard;
