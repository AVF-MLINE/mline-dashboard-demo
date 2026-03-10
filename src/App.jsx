import V1Dashboard from "./pages/V1Dashboard";
import V2Dashboard from "./pages/V2Dashboard";
import V3Dashboard from "./pages/V3Dashboard";
import V4Dashboard from "./pages/V4Dashboard";
import V5Dashboard from "./pages/V5Dashboard";
import V5AltDashboard from "./pages/V5AltDashboard";

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function VersionSwitcher({ path }) {
  return (
    <header className="version-nav-wrap">
      <nav className="panel version-nav">
        <a className={path === "/" ? "version-link active" : "version-link"} href="/">
          Сравнение
        </a>
        <a className={path === "/v1" ? "version-link active" : "version-link"} href="/v1">
          V1
        </a>
        <a className={path === "/v2" ? "version-link active" : "version-link"} href="/v2">
          V2
        </a>
        <a className={path === "/v3" ? "version-link active" : "version-link"} href="/v3">
          V3
        </a>
        <a className={path === "/v4" ? "version-link active" : "version-link"} href="/v4">
          V4
        </a>
        <a className={path === "/v5" ? "version-link active" : "version-link"} href="/v5">
          V5
        </a>
        <a className={path === "/v5-alt" ? "version-link active" : "version-link"} href="/v5-alt">
          V5 (альт)
        </a>
      </nav>
    </header>
  );
}

function ComparePage() {
  return (
    <main className="compare-page page">
      <section className="panel compare-head animate-in">
        <p className="eyebrow">МИС · A/B сравнение</p>
        <h1>Сравнение дашбордов АГ/СД</h1>
        <p className="subtitle">
          Доступны независимые версии на разных адресах. Это позволяет показывать заказчику эволюцию интерфейса без
          потери текущего варианта.
        </p>
      </section>

      <section className="compare-grid">
        <article className="panel compare-card animate-in delay-1">
          <h2>V1</h2>
          <p>Адрес: `/v1`</p>
          <ul>
            <li>Базовый сводный экран</li>
            <li>Нозологии АГ/СД, лаборатория, приоритеты</li>
            <li>Кнопка формирования сводки с кратким выводом</li>
          </ul>
          <a className="compare-button" href="/v1">
            Открыть V1
          </a>
        </article>

        <article className="panel compare-card animate-in delay-2">
          <h2>V2</h2>
          <p>Адрес: `/v2`</p>
          <ul>
            <li>Ролевые приоритеты: врач/управленец</li>
            <li>Критические сигналы, пробелы наблюдения, терапевтическая инерция</li>
            <li>Очередь задач, качество данных, аудит запросов сводки</li>
            <li>Детализация показателей и настраиваемые клинические пороги</li>
          </ul>
          <a className="compare-button" href="/v2">
            Открыть V2
          </a>
        </article>

        <article className="panel compare-card animate-in delay-3">
          <h2>V3</h2>
          <p>Адрес: `/v3`</p>
          <ul>
            <li>Максимально чистая иерархия: сначала риск и задача, потом аналитика</li>
            <li>Компактный клинический срез АГ/СД без перегрузки интерфейса</li>
            <li>Русскоязычный контур и улучшенная читаемость для ежедневной работы</li>
          </ul>
          <a className="compare-button" href="/v3">
            Открыть V3
          </a>
        </article>

        <article className="panel compare-card animate-in delay-4">
          <h2>V4</h2>
          <p>Адрес: `/v4`</p>
          <ul>
            <li>Построен на реальном отчёте по эффективности АГ</li>
            <li>Сводные KPI региона, риск-профиль МО и срез по врачам</li>
            <li>Блок качества измерений и генерация ИИ-сводки по данным</li>
          </ul>
          <a className="compare-button" href="/v4">
            Открыть V4
          </a>
        </article>

        <article className="panel compare-card animate-in delay-4">
          <h2>V5</h2>
          <p>Адрес: `/v5`</p>
          <ul>
            <li>Тот же набор блоков, что в исходном макете личного кабинета</li>
            <li>Презентационный визуальный стиль с клинической читаемостью</li>
            <li>ИИ-сводка по пациенту с фокусом на риски и действия</li>
          </ul>
          <a className="compare-button" href="/v5">
            Открыть V5
          </a>
        </article>

        <article className="panel compare-card animate-in delay-4">
          <h2>V5 (альтернативная)</h2>
          <p>Адрес: `/v5-alt`</p>
          <ul>
            <li>Финальный polish-проход: типографика, иерархия и визуальная чистота</li>
            <li>Связка риск-фильтров с событиями пациента и терапией</li>
            <li>ИИ-сводка с состоянием последнего формирования и временем обновления</li>
          </ul>
          <a className="compare-button" href="/v5-alt">
            Открыть V5 (альт)
          </a>
        </article>
      </section>
    </main>
  );
}

function App() {
  const path = normalizePath(window.location.pathname);

  let content = <ComparePage />;
  if (path === "/v1") content = <V1Dashboard />;
  if (path === "/v2") content = <V2Dashboard />;
  if (path === "/v3") content = <V3Dashboard />;
  if (path === "/v4") content = <V4Dashboard />;
  if (path === "/v5") content = <V5Dashboard />;
  if (path === "/v5-alt") content = <V5AltDashboard />;
  if (path !== "/" && path !== "/v1" && path !== "/v2" && path !== "/v3" && path !== "/v4" && path !== "/v5" && path !== "/v5-alt") content = <ComparePage />;

  return (
    <>
      <VersionSwitcher path={path} />
      {content}
    </>
  );
}

export default App;
