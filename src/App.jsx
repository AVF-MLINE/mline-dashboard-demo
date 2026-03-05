import V1Dashboard from "./pages/V1Dashboard";
import V2Dashboard from "./pages/V2Dashboard";
import V3Dashboard from "./pages/V3Dashboard";

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
          V1 (текущая)
        </a>
        <a className={path === "/v2" ? "version-link active" : "version-link"} href="/v2">
          V2 (идеальная)
        </a>
        <a className={path === "/v3" ? "version-link active" : "version-link"} href="/v3">
          V3 (оптимальная)
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
          <h2>V1 (текущая)</h2>
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
          <h2>V2 (идеальная)</h2>
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
          <h2>V3 (оптимальная)</h2>
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
  if (path !== "/" && path !== "/v1" && path !== "/v2" && path !== "/v3") content = <ComparePage />;

  return (
    <>
      <VersionSwitcher path={path} />
      {content}
    </>
  );
}

export default App;
