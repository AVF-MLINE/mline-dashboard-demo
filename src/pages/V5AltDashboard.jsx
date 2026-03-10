import { useMemo, useRef, useState } from "react";
import BrandLogo from "../components/BrandLogo";

const V5_BASE_DATA = {
  snapshotDate: "05.03.2026",
  profile: {
    fullName: "Кузнецов Андрей Викторович",
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
  trendDates: [
    "05.08.2024",
    "22.08.2024",
    "10.09.2024",
    "01.10.2024",
    "21.10.2024",
    "08.11.2024",
    "29.11.2024",
    "20.12.2024",
    "15.01.2025",
    "07.02.2025",
    "28.02.2025",
    "20.03.2025",
    "10.04.2025",
    "10.11.2025"
  ],
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
    { name: "Кардиолог", code: "I10-I15", date: "10.10.2025", linkTones: ["critical", "warning"] },
    { name: "Эндокринолог", code: "E10-E14", date: "28.09.2025", linkTones: ["critical", "warning"] },
    { name: "Терапевт", code: "E10-E14", date: "08.08.2025", linkTones: ["warning"] },
    { name: "Терапевт", code: "I10-I15", date: "10.06.2025", linkTones: ["warning"] },
    { name: "Другое", code: "", date: "-", linkTones: ["ok"] }
  ],
  instrumental: [
    { name: "ЭКГ", date: "15.05.2025", note: "доступен полный протокол", linkTones: ["ok"] },
    { name: "ЭХО-КГ", date: "08.08.2025", note: "динамика без отрицательных изменений", linkTones: ["ok", "warning"] },
    { name: "УЗИ брюшной полости", date: "08.08.2025", note: "контроль через 6 месяцев", linkTones: ["warning"] },
    { name: "СМАД", date: "22.09.2025", note: "среднесуточное АД выше целевого", linkTones: ["critical", "warning"] },
    { name: "Другое", date: "-", note: "нет новых данных", linkTones: ["ok"] }
  ],
  laboratoryStudies: [
    { name: "ОАК", date: "15.05.2025", status: "готов", linkTones: ["ok"] },
    { name: "Биохимический анализ крови", date: "08.08.2025", status: "готов", linkTones: ["ok", "warning"] },
    { name: "HbA1c", date: "10.11.2025", status: "готов", linkTones: ["warning"] },
    { name: "Липидный профиль", date: "10.11.2025", status: "готов", linkTones: ["warning"] },
    { name: "Другие", date: "08.08.2025", status: "ожидается", linkTones: ["critical", "warning"] },
    { name: "Другие", date: "-", status: "не назначено", linkTones: ["critical"] }
  ],
  comorbidTherapy: {
    title: "Медикаментозная терапия сопутствующих заболеваний",
    date: "10.10.2025",
    icd: "N18.0",
    linkTones: ["warning"],
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
      linkTones: ["critical", "warning"],
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
      linkTones: ["critical", "warning"],
      diagnosis: "Инсулинозависимый сахарный диабет",
      meds: [
        "Левемир по схеме титрации",
        "Метформин 1000 мг 2 раза в день",
        "Контроль глюкозы не менее 4 измерений/сут"
      ]
    }
  ],
  oakPreview: {
    indicators: [
      {
        metric: "Гемоглобин",
        unit: "г/л",
        reference: "120-160",
        color: "#2b82ca",
        history: [
          { date: "10.10.2024", value: 130 },
          { date: "12.12.2024", value: 129 },
          { date: "15.02.2025", value: 131 },
          { date: "10.04.2025", value: 128 },
          { date: "20.06.2025", value: 127 },
          { date: "15.08.2025", value: 128 }
        ]
      },
      {
        metric: "Лейкоциты",
        unit: "10^9/л",
        reference: "4-9",
        color: "#2a9f7a",
        history: [
          { date: "10.10.2024", value: 7.8 },
          { date: "12.12.2024", value: 7.3 },
          { date: "15.02.2025", value: 6.9 },
          { date: "10.04.2025", value: 6.7 },
          { date: "20.06.2025", value: 6.5 },
          { date: "15.08.2025", value: 6.4 }
        ]
      },
      {
        metric: "Тромбоциты",
        unit: "10^9/л",
        reference: "150-400",
        color: "#b9801d",
        history: [
          { date: "10.10.2024", value: 250 },
          { date: "12.12.2024", value: 246 },
          { date: "15.02.2025", value: 239 },
          { date: "10.04.2025", value: 234 },
          { date: "20.06.2025", value: 229 },
          { date: "15.08.2025", value: 225 }
        ]
      }
    ]
  }
};

const V5_SCENARIO_2 = {
  snapshotDate: "12.03.2026",
  profile: {
    fullName: "Соколова Мария Дмитриевна",
    sex: "Женский",
    age: 58,
    height: 167,
    weight: 79,
    waist: 92,
    bmi: 28.3
  },
  monitored: {
    bloodPressure: {
      date: "11.03.2026",
      systolic: 146,
      diastolic: 86,
      pulse: 72,
      target: "110-135 / 70-85 / 60-80"
    },
    glucose: {
      date: "11.03.2026",
      value: 7.4,
      unit: "ммоль/л",
      target: "4.4-6.1 ммоль/л"
    }
  },
  trends: {
    systolic: [156, 154, 153, 151, 149, 148, 146, 145, 147, 145, 144, 146, 145, 146],
    glucose: [8.3, 8.1, 8.0, 7.9, 7.7, 7.6, 7.4, 7.5, 7.3, 7.2, 7.1, 7.3, 7.2, 7.4]
  },
  trendDates: V5_BASE_DATA.trendDates,
  majorDiseases: [
    "Сахарный диабет (E10-E14)",
    "Артериальная гипертензия (I10-I15)",
    "Диабетическая нефропатия (N08.3)",
    "Ожирение (E66.9)"
  ],
  labs: [
    { name: "Гликированный гемоглобин", value: "8.1", reference: "4-6", date: "11.03.2026", trend: "up", tone: "critical" },
    { name: "Глюкоза крови", value: "7.4", reference: "4-6", date: "11.03.2026", trend: "up", tone: "warning" },
    { name: "Креатинин", value: "96", reference: "< 97", date: "11.03.2026", trend: "flat", tone: "ok" },
    { name: "Микроальбуминурия", value: "38", reference: "< 30", date: "11.03.2026", trend: "up", tone: "warning" },
    { name: "Холестерин", value: "5.8", reference: "< 5.2", date: "11.03.2026", trend: "up", tone: "warning" },
    { name: "ЛПНП", value: "3.0", reference: "< 2.6", date: "11.03.2026", trend: "up", tone: "warning" },
    { name: "ЛПВП", value: "1.2", reference: "> 1.2", date: "11.03.2026", trend: "flat", tone: "ok" },
    { name: "Триглицериды", value: "1.9", reference: "< 1.7", date: "11.03.2026", trend: "up", tone: "warning" }
  ],
  consultations: [
    { name: "Эндокринолог", code: "E10-E14", date: "11.03.2026", linkTones: ["critical", "warning"] },
    { name: "Кардиолог", code: "I10-I15", date: "20.02.2026", linkTones: ["warning"] },
    { name: "Нефролог", code: "N08.3", date: "03.02.2026", linkTones: ["critical", "warning"] },
    { name: "Школа диабета", code: "Z71.3", date: "25.01.2026", linkTones: ["warning"] },
    { name: "Другое", code: "", date: "-", linkTones: ["ok"] }
  ],
  instrumental: [
    { name: "ЭКГ", date: "05.03.2026", note: "синусовый ритм, без острой динамики", linkTones: ["ok"] },
    { name: "СМАД", date: "28.02.2026", note: "ночное АД выше целевого", linkTones: ["critical", "warning"] },
    { name: "УЗИ почек", date: "14.02.2026", note: "контроль микроальбуминурии через 3 месяца", linkTones: ["warning"] },
    { name: "ЭХО-КГ", date: "20.01.2026", note: "гипертрофия ЛЖ без прогрессии", linkTones: ["warning"] },
    { name: "Другое", date: "-", note: "нет новых данных", linkTones: ["ok"] }
  ],
  laboratoryStudies: [
    { name: "HbA1c", date: "11.03.2026", status: "готов", linkTones: ["critical", "warning"] },
    { name: "Биохимический анализ крови", date: "11.03.2026", status: "готов", linkTones: ["warning"] },
    { name: "Липидный профиль", date: "11.03.2026", status: "готов", linkTones: ["warning"] },
    { name: "СКФ (eGFR)", date: "11.03.2026", status: "готов", linkTones: ["warning"] },
    { name: "Другие", date: "06.03.2026", status: "ожидается", linkTones: ["critical", "warning"] },
    { name: "Другие", date: "-", status: "не назначено", linkTones: ["critical"] }
  ],
  comorbidTherapy: {
    title: "Медикаментозная терапия сопутствующих заболеваний",
    date: "11.03.2026",
    icd: "E66.9",
    linkTones: ["warning"],
    diagnosis: "Ожирение",
    recommendations: [
      "Снижение массы тела на 5-7% в течение 6 месяцев",
      "Ограничение соли до 5 г/сут",
      "Ходьба не менее 150 минут в неделю"
    ]
  },
  diseaseTherapy: [
    {
      name: "Артериальная гипертензия",
      icd: "I10-I15",
      date: "11.03.2026",
      code: "I10",
      linkTones: ["critical", "warning"],
      diagnosis: "Артериальная гипертензия",
      meds: [
        "Телмисартан 40 мг утром",
        "Индапамид ретард 1.5 мг утром",
        "Амлодипин 5 мг вечером",
        "Самоконтроль АД 2 раза/сут с дневником"
      ]
    },
    {
      name: "Сахарный диабет",
      icd: "E10-E14",
      date: "11.03.2026",
      code: "E11",
      linkTones: ["critical", "warning"],
      diagnosis: "Сахарный диабет 2 типа",
      meds: [
        "Метформин 1000 мг 2 раза в день",
        "Дапаглифлозин 10 мг утром",
        "Контроль глюкозы не менее 4 измерений/сут"
      ]
    }
  ],
  oakPreview: {
    indicators: [
      {
        metric: "Гемоглобин",
        unit: "г/л",
        reference: "120-160",
        color: "#2b82ca",
        history: [
          { date: "10.10.2024", value: 124 },
          { date: "12.12.2024", value: 122 },
          { date: "15.02.2025", value: 123 },
          { date: "10.04.2025", value: 121 },
          { date: "20.06.2025", value: 120 },
          { date: "11.03.2026", value: 121 }
        ]
      },
      {
        metric: "Лейкоциты",
        unit: "10^9/л",
        reference: "4-9",
        color: "#2a9f7a",
        history: [
          { date: "10.10.2024", value: 8.1 },
          { date: "12.12.2024", value: 7.8 },
          { date: "15.02.2025", value: 7.5 },
          { date: "10.04.2025", value: 7.2 },
          { date: "20.06.2025", value: 7.0 },
          { date: "11.03.2026", value: 6.8 }
        ]
      },
      {
        metric: "Тромбоциты",
        unit: "10^9/л",
        reference: "150-400",
        color: "#b9801d",
        history: [
          { date: "10.10.2024", value: 255 },
          { date: "12.12.2024", value: 251 },
          { date: "15.02.2025", value: 246 },
          { date: "10.04.2025", value: 241 },
          { date: "20.06.2025", value: 236 },
          { date: "11.03.2026", value: 232 }
        ]
      }
    ]
  }
};

const V5_SCENARIO_3 = {
  snapshotDate: "20.03.2026",
  profile: {
    fullName: "Петухов Сергей Олегович",
    sex: "Мужской",
    age: 49,
    height: 179,
    weight: 84,
    waist: 94,
    bmi: 26.2
  },
  monitored: {
    bloodPressure: {
      date: "19.03.2026",
      systolic: 126,
      diastolic: 78,
      pulse: 67,
      target: "110-135 / 70-85 / 60-80"
    },
    glucose: {
      date: "19.03.2026",
      value: 5.6,
      unit: "ммоль/л",
      target: "4.4-6.1 ммоль/л"
    }
  },
  trends: {
    systolic: [134, 132, 130, 129, 128, 127, 128, 126, 125, 127, 126, 124, 126, 126],
    glucose: [6.4, 6.2, 6.0, 5.9, 5.8, 5.7, 5.8, 5.6, 5.5, 5.7, 5.6, 5.5, 5.6, 5.6]
  },
  trendDates: V5_BASE_DATA.trendDates,
  majorDiseases: [
    "Артериальная гипертензия (I10-I15)",
    "Сахарный диабет (E10-E14)",
    "Дислипидемия (E78.5)",
    "Избыточная масса тела (E66.3)"
  ],
  labs: [
    { name: "Гликированный гемоглобин", value: "6.4", reference: "4-6", date: "19.03.2026", trend: "flat", tone: "warning" },
    { name: "Глюкоза крови", value: "5.6", reference: "4-6", date: "19.03.2026", trend: "flat", tone: "ok" },
    { name: "Креатинин", value: "84", reference: "< 97", date: "19.03.2026", trend: "flat", tone: "ok" },
    { name: "Микроальбуминурия", value: "24", reference: "< 30", date: "19.03.2026", trend: "down", tone: "ok" },
    { name: "Холестерин", value: "4.8", reference: "< 5.2", date: "19.03.2026", trend: "down", tone: "ok" },
    { name: "ЛПНП", value: "2.3", reference: "< 2.6", date: "19.03.2026", trend: "down", tone: "ok" },
    { name: "ЛПВП", value: "1.4", reference: "> 1.2", date: "19.03.2026", trend: "up", tone: "ok" },
    { name: "Триглицериды", value: "1.8", reference: "< 1.7", date: "19.03.2026", trend: "up", tone: "warning" }
  ],
  consultations: [
    { name: "Терапевт", code: "I10-I15", date: "19.03.2026", linkTones: ["warning"] },
    { name: "Эндокринолог", code: "E10-E14", date: "10.02.2026", linkTones: ["warning"] },
    { name: "Кардиолог", code: "I10-I15", date: "15.12.2025", linkTones: ["ok"] },
    { name: "Школа пациента", code: "Z71.9", date: "01.12.2025", linkTones: ["ok"] },
    { name: "Другое", code: "", date: "-", linkTones: ["ok"] }
  ],
  instrumental: [
    { name: "ЭКГ", date: "15.03.2026", note: "без патологической динамики", linkTones: ["ok"] },
    { name: "ЭХО-КГ", date: "21.01.2026", note: "структурных изменений не выявлено", linkTones: ["ok"] },
    { name: "УЗИ брюшной полости", date: "25.12.2025", note: "без существенных отклонений", linkTones: ["ok"] },
    { name: "СМАД", date: "14.11.2025", note: "суточный профиль АД в целевом диапазоне", linkTones: ["ok"] },
    { name: "Другое", date: "-", note: "нет новых данных", linkTones: ["ok"] }
  ],
  laboratoryStudies: [
    { name: "ОАК", date: "19.03.2026", status: "готов", linkTones: ["ok"] },
    { name: "Биохимический анализ крови", date: "19.03.2026", status: "готов", linkTones: ["ok"] },
    { name: "HbA1c", date: "19.03.2026", status: "готов", linkTones: ["warning"] },
    { name: "Липидный профиль", date: "19.03.2026", status: "готов", linkTones: ["warning"] },
    { name: "Другие", date: "15.03.2026", status: "ожидается", linkTones: ["warning"] },
    { name: "Другие", date: "-", status: "не назначено", linkTones: ["ok"] }
  ],
  comorbidTherapy: {
    title: "Медикаментозная терапия сопутствующих заболеваний",
    date: "19.03.2026",
    icd: "E66.3",
    linkTones: ["ok"],
    diagnosis: "Избыточная масса тела",
    recommendations: [
      "Сохранять дефицит калорий 300-400 ккал/сут",
      "Аэробная нагрузка не менее 5 дней в неделю",
      "Контроль массы тела и окружности талии еженедельно"
    ]
  },
  diseaseTherapy: [
    {
      name: "Артериальная гипертензия",
      icd: "I10-I15",
      date: "19.03.2026",
      code: "I10",
      linkTones: ["warning"],
      diagnosis: "Артериальная гипертензия",
      meds: [
        "Телмисартан 40 мг утром",
        "Индапамид ретард 1.5 мг утром",
        "Самоконтроль АД 1-2 раза/сут"
      ]
    },
    {
      name: "Сахарный диабет",
      icd: "E10-E14",
      date: "19.03.2026",
      code: "E11",
      linkTones: ["warning"],
      diagnosis: "Сахарный диабет 2 типа",
      meds: [
        "Метформин 1000 мг 2 раза в день",
        "Эмпаглифлозин 10 мг утром",
        "Контроль глюкозы натощак и после ужина"
      ]
    }
  ],
  oakPreview: {
    indicators: [
      {
        metric: "Гемоглобин",
        unit: "г/л",
        reference: "120-160",
        color: "#2b82ca",
        history: [
          { date: "10.10.2024", value: 136 },
          { date: "12.12.2024", value: 137 },
          { date: "15.02.2025", value: 135 },
          { date: "10.04.2025", value: 136 },
          { date: "20.06.2025", value: 134 },
          { date: "19.03.2026", value: 135 }
        ]
      },
      {
        metric: "Лейкоциты",
        unit: "10^9/л",
        reference: "4-9",
        color: "#2a9f7a",
        history: [
          { date: "10.10.2024", value: 6.4 },
          { date: "12.12.2024", value: 6.2 },
          { date: "15.02.2025", value: 6.1 },
          { date: "10.04.2025", value: 6.0 },
          { date: "20.06.2025", value: 5.8 },
          { date: "19.03.2026", value: 5.9 }
        ]
      },
      {
        metric: "Тромбоциты",
        unit: "10^9/л",
        reference: "150-400",
        color: "#b9801d",
        history: [
          { date: "10.10.2024", value: 228 },
          { date: "12.12.2024", value: 226 },
          { date: "15.02.2025", value: 224 },
          { date: "10.04.2025", value: 222 },
          { date: "20.06.2025", value: 220 },
          { date: "19.03.2026", value: 219 }
        ]
      }
    ]
  }
};

const V5_SCENARIOS = [
  { id: "scenario-1", label: "Вариант 1", hint: "Декомпенсация", data: V5_BASE_DATA },
  { id: "scenario-2", label: "Вариант 2", hint: "Частичный контроль", data: V5_SCENARIO_2 },
  { id: "scenario-3", label: "Вариант 3", hint: "Стабилизация", data: V5_SCENARIO_3 }
];

const V5_ADMIN_NAMES = [
  "Козлова Ирина Сергеевна",
  "Мельников Павел Александрович",
  "Сорокина Наталья Юрьевна",
  "Ильин Дмитрий Константинович"
];

function pickRandomName(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const V5_ADMIN_HEADER = {
  title: "Личный кабинет администратора",
  fullName: pickRandomName(V5_ADMIN_NAMES)
};

const V5_ADMIN_ICON_GLYPHS = {
  user: "\ue903",
  settings: "\ue905",
  close: "\ue910"
};

const LAB_TONE_META = {
  critical: { label: "Критично", color: "#e35d66", cls: "v5x-badge critical" },
  warning: { label: "Внимание", color: "#f0b429", cls: "v5x-badge warning" },
  ok: { label: "Норма", color: "#42b883", cls: "v5x-badge ok" }
};

function toneMeta(tone) {
  return LAB_TONE_META[tone] ?? LAB_TONE_META.ok;
}

function toneLabel(tone) {
  return toneMeta(tone).label;
}

function splitPrimaryAndOtherEvents(items) {
  return items.reduce(
    (acc, item) => {
      if (item.name.toLowerCase().startsWith("друг")) {
        acc.other.push(item);
      } else {
        acc.primary.push(item);
      }
      return acc;
    },
    { primary: [], other: [] }
  );
}

function labStudyStatusTone(status) {
  if (status === "готов") return "ok";
  if (status === "ожидается") return "warning";
  return "neutral";
}

function formatDisplayDate(date) {
  return date === "-" ? "—" : date;
}

function formatDisplayNumber(value) {
  return String(value).replace(".", ",");
}

function formatValueWithUnit(value, unit) {
  return `${formatDisplayNumber(value)} ${unit}`;
}

function formatReference(reference) {
  return String(reference).replace(/\s+/g, " ").trim();
}

function hasToneLink(item, tone) {
  if (tone === "all") return true;
  return item.linkTones?.includes(tone) ?? false;
}

function toneMatchClass(item, tone) {
  if (tone === "all") return "";
  return hasToneLink(item, tone) ? " v5a-linked" : " v5a-muted";
}

function trendArrow(trend) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

function formatTrendValue(value) {
  if (Number.isInteger(value)) return `${value}`;
  return value.toFixed(1).replace(".", ",");
}

function shortDate(date) {
  const [day, month] = date.split(".");
  return `${day}.${month}`;
}

function formatTick(value, precision = 0) {
  return value.toFixed(precision).replace(".", ",");
}

function buildLinearTicks(min, max, steps = 4, precision = 0) {
  const range = max - min || 1;
  const margin = range * 0.12;
  const from = min - margin;
  const to = max + margin;
  const tickStep = (to - from) / steps;

  return Array.from({ length: steps + 1 }, (_, index) => Number((from + tickStep * index).toFixed(precision + 1)));
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
  const width = 220;
  const height = 84;
  const points = toSparkPoints(values, width, height);

  return (
    <svg className="v5x-spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" points={points} />
      <circle cx={width - 8} cy={points.split(" ").at(-1).split(",")[1]} r="4" fill={color} />
    </svg>
  );
}

function StatusDonut({ critical, warning, ok, activeTone, hoveredTone, onHoverTone, onToggleTone }) {
  const segments = [
    { key: "critical", count: critical },
    { key: "warning", count: warning },
    { key: "ok", count: ok }
  ];
  const total = segments.reduce((sum, item) => sum + item.count, 0) || 1;
  const size = 188;
  const radius = 72;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcData = segments.map((segment) => {
    const length = (segment.count / total) * circumference;
    const currentOffset = offset;
    offset += length;
    return { ...segment, length, offset: currentOffset };
  });

  const focusedTone = hoveredTone ?? (activeTone !== "all" ? activeTone : null);
  const focusedSegment = arcData.find((item) => item.key === focusedTone) ?? null;
  const centerMain = focusedSegment ? `${Math.round((focusedSegment.count / total) * 100)}%` : `${Math.round((ok / total) * 100)}%`;
  const centerLabel = focusedSegment ? toneLabel(focusedSegment.key) : "В норме";
  const centerSub = focusedSegment ? `${focusedSegment.count} из ${total}` : `${ok} из ${total}`;

  return (
    <div className="v5x-donut-wrap">
      <svg className="v5x-donut-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Статус лабораторий по приоритету">
        <circle className="v5x-donut-track" cx={size / 2} cy={size / 2} r={radius} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcData.map((segment) => {
            const meta = toneMeta(segment.key);
            const isFocused = focusedTone === segment.key;
            return (
              <circle
                key={segment.key}
                className={`v5x-donut-segment${isFocused ? " active" : ""}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={meta.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                strokeDashoffset={-segment.offset}
                onMouseEnter={() => onHoverTone(segment.key)}
                onMouseLeave={() => onHoverTone(null)}
                onClick={() => onToggleTone(segment.key)}
              />
            );
          })}
        </g>
      </svg>
      <div className="v5x-donut-center">
        <strong>{centerMain}</strong>
        <span>{centerLabel}</span>
        <small>{centerSub}</small>
      </div>
    </div>
  );
}

function trendStatus(value, range) {
  if (typeof range.min === "number" && value < range.min) return "ниже цели";
  if (typeof range.max === "number" && value > range.max) return "выше цели";
  return "в цели";
}

function MultiTrendChart({
  bpValues,
  glucoseValues,
  dates,
  bpTarget = { min: 110, max: 135 },
  glucoseTarget = { min: 4.4, max: 6.1 }
}) {
  const svgRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const width = 820;
  const height = 278;
  const margin = { top: 26, right: 52, bottom: 52, left: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const safeLength = Math.max(bpValues.length - 1, 1);

  const bpTicks = buildLinearTicks(Math.min(...bpValues), Math.max(...bpValues), 4, 0);
  const glucoseTicks = buildLinearTicks(Math.min(...glucoseValues), Math.max(...glucoseValues), 4, 1);
  const bpMin = bpTicks[0];
  const bpMax = bpTicks.at(-1);
  const glucoseMin = glucoseTicks[0];
  const glucoseMax = glucoseTicks.at(-1);

  const getX = (index) => margin.left + (index / safeLength) * plotWidth;
  const getYBp = (value) => margin.top + ((bpMax - value) / (bpMax - bpMin || 1)) * plotHeight;
  const getYGlucose = (value) => margin.top + ((glucoseMax - value) / (glucoseMax - glucoseMin || 1)) * plotHeight;

  const bpPoints = bpValues.map((value, index) => ({ x: getX(index), y: getYBp(value), value }));
  const glucosePoints = glucoseValues.map((value, index) => ({ x: getX(index), y: getYGlucose(value), value }));
  const bpLine = bpPoints.map((item) => `${item.x},${item.y}`).join(" ");
  const glucoseLine = glucosePoints.map((item) => `${item.x},${item.y}`).join(" ");
  const xLabelStep = dates.length > 10 ? 3 : 2;
  const hasActivePoint = activeIndex !== null;
  const safeIndex = hasActivePoint ? activeIndex : Math.max(bpValues.length - 1, 0);
  const activeBpPoint = bpPoints[safeIndex];
  const activeGlucosePoint = glucosePoints[safeIndex];
  const activeDate = dates[safeIndex];
  const bpStateLabel = trendStatus(activeBpPoint?.value ?? bpValues.at(-1), bpTarget);
  const glucoseStateLabel = trendStatus(activeGlucosePoint?.value ?? glucoseValues.at(-1), glucoseTarget);
  const tooltipWidth = 248;
  const tooltipHeight = 74;
  const tooltipX = Math.min(
    Math.max((activeBpPoint?.x ?? margin.left) - tooltipWidth / 2, margin.left + 4),
    width - margin.right - tooltipWidth - 4
  );
  const tooltipY = margin.top + 8;

  const updateActiveByClientX = (clientX) => {
    const svgNode = svgRef.current;
    if (!svgNode) return;
    const rect = svgNode.getBoundingClientRect();
    if (!rect.width) return;
    const scaledX = ((clientX - rect.left) / rect.width) * width;
    const nextIndex = Math.max(
      0,
      Math.min(
        bpValues.length - 1,
        Math.round(((scaledX - margin.left) / (plotWidth || 1)) * safeLength)
      )
    );
    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  };

  const handleMouseMove = (event) => {
    updateActiveByClientX(event.clientX);
  };

  const handleTouch = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    updateActiveByClientX(touch.clientX);
  };

  return (
    <svg
      ref={svgRef}
      className="v5x-trend-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="График динамики САД и глюкозы"
    >
      {bpTicks.map((tick) => {
        const y = getYBp(tick);
        return (
          <line
            key={`grid-${tick}`}
            className="v5x-grid-line"
            x1={margin.left}
            y1={y}
            x2={width - margin.right}
            y2={y}
          />
        );
      })}

      <line className="v5x-axis-line" x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} />
      <line className="v5x-axis-line" x1={width - margin.right} y1={margin.top} x2={width - margin.right} y2={margin.top + plotHeight} />
      <line
        className="v5x-axis-line"
        x1={margin.left}
        y1={margin.top + plotHeight}
        x2={width - margin.right}
        y2={margin.top + plotHeight}
      />

      {bpTicks.map((tick) => (
        <text key={`bp-tick-${tick}`} className="v5x-axis-tick left" x={margin.left - 8} y={getYBp(tick) + 4}>
          {formatTick(tick, 0)}
        </text>
      ))}
      {glucoseTicks.map((tick) => (
        <text key={`glucose-tick-${tick}`} className="v5x-axis-tick right" x={width - margin.right + 8} y={getYGlucose(tick) + 4}>
          {formatTick(tick, 1)}
        </text>
      ))}

      <text className="v5x-axis-label left" x={margin.left} y={14}>САД, мм рт.ст.</text>
      <text className="v5x-axis-label right" x={width - margin.right} y={14}>Глюкоза, ммоль/л</text>

      <polyline className="v5x-line-bp" points={bpLine} />
      <polyline className="v5x-line-glucose" points={glucoseLine} />

      {bpPoints.map((point, index) => (
        <circle
          key={`bp-point-${index}`}
          className={`v5x-trend-point${hasActivePoint && index === safeIndex ? " active bp" : ""}`}
          cx={point.x}
          cy={point.y}
          r={hasActivePoint && index === safeIndex ? "5.1" : "3.3"}
          fill="#2a9f7a"
        />
      ))}
      {glucosePoints.map((point, index) => (
        <circle
          key={`glucose-point-${index}`}
          className={`v5x-trend-point${hasActivePoint && index === safeIndex ? " active glucose" : ""}`}
          cx={point.x}
          cy={point.y}
          r={hasActivePoint && index === safeIndex ? "5.1" : "3.3"}
          fill="#2b82ca"
        />
      ))}

      {hasActivePoint && (
        <>
          <line
            className="v5x-trend-hover-line"
            x1={activeBpPoint.x}
            y1={margin.top}
            x2={activeBpPoint.x}
            y2={margin.top + plotHeight}
          />
          <g className="v5x-trend-tooltip" transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect className="v5x-trend-tooltip-box" width={tooltipWidth} height={tooltipHeight} rx="9" />
            <text className="v5x-trend-tooltip-date" x="10" y="16">
              {`Дата: ${formatDisplayDate(activeDate)}`}
            </text>
            <circle cx="11" cy="34" r="3.1" fill="#2a9f7a" />
            <text className="v5x-trend-tooltip-row" x="19" y="37">
              {`САД: ${formatTick(activeBpPoint.value, 0)} мм рт.ст. · ${bpStateLabel}`}
            </text>
            <circle cx="11" cy="53" r="3.1" fill="#2b82ca" />
            <text className="v5x-trend-tooltip-row" x="19" y="56">
              {`Глюкоза: ${formatTick(activeGlucosePoint.value, 1)} ммоль/л · ${glucoseStateLabel}`}
            </text>
          </g>
        </>
      )}

      <rect
        className="v5x-trend-hit-area"
        x={margin.left}
        y={margin.top}
        width={plotWidth}
        height={plotHeight}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={() => setActiveIndex(null)}
        onClick={handleMouseMove}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
      />

      {dates.map((date, index) => {
        if (index % xLabelStep !== 0 && index !== dates.length - 1) return null;
        return (
          <text key={`x-${date}-${index}`} className="v5x-axis-date" x={getX(index)} y={height - 14}>
            {shortDate(date)}
          </text>
        );
      })}
    </svg>
  );
}

function OakTrendChart({ history, color }) {
  const width = 560;
  const height = 210;
  const paddingX = 26;
  const plotTop = 18;
  const plotBottom = 148;

  const values = history.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const margin = Math.max((maxValue - minValue) * 0.15, 1);
  const domainMin = minValue - margin;
  const domainMax = maxValue + margin;
  const range = domainMax - domainMin || 1;
  const steps = Math.max(history.length - 1, 1);

  const points = history.map((item, index) => {
    const x = paddingX + (index / steps) * (width - paddingX * 2);
    const y = plotBottom - ((item.value - domainMin) / range) * (plotBottom - plotTop);
    return { ...item, x, y };
  });

  const pointString = points.map((item) => `${item.x},${item.y}`).join(" ");
  const gridY = [plotTop, (plotTop + plotBottom) / 2, plotBottom];

  return (
    <svg className="v5x-oak-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График тренда ОАК по датам">
      {gridY.map((y) => (
        <line key={y} className="v5x-oak-grid" x1={paddingX} y1={y} x2={width - paddingX} y2={y} />
      ))}
      <polyline className="v5x-oak-line" style={{ stroke: color }} points={pointString} />
      {points.map((point) => (
        <g key={point.date}>
          <circle className="v5x-oak-point" cx={point.x} cy={point.y} r="4" fill={color} />
          <text className="v5x-oak-value-label" x={point.x} y={point.y - 9}>
            {formatTrendValue(point.value)}
          </text>
          <text className="v5x-oak-date-label" x={point.x} y={height - 16}>
            {shortDate(point.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function buildV5Summary(data) {
  const criticalLabs = data.labs.filter((item) => item.tone === "critical").length;
  const warningLabs = data.labs.filter((item) => item.tone === "warning").length;
  const bpOutOfTarget = data.monitored.bloodPressure.systolic > 135 || data.monitored.bloodPressure.diastolic > 85;
  const glucoseOutOfTarget = data.monitored.glucose.value > 6.1;

  return {
    title: "V5 (альтернативная) · сводка по пациенту",
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

function V5AltDashboard() {
  const [scenarioId, setScenarioId] = useState(V5_SCENARIOS[0].id);
  const activeScenario = useMemo(
    () => V5_SCENARIOS.find((item) => item.id === scenarioId) ?? V5_SCENARIOS[0],
    [scenarioId]
  );
  const V5_DATA = activeScenario.data;
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryMeta, setSummaryMeta] = useState({ generatedAt: null, total: 0 });
  const [selectedOakMetric, setSelectedOakMetric] = useState(V5_SCENARIOS[0].data.oakPreview.indicators[0]?.metric ?? "");
  const [labToneFilter, setLabToneFilter] = useState("all");
  const [hoveredLabTone, setHoveredLabTone] = useState(null);
  const [showClinicalLinks, setShowClinicalLinks] = useState(false);

  const consultationEvents = splitPrimaryAndOtherEvents(V5_DATA.consultations);
  const instrumentalEvents = splitPrimaryAndOtherEvents(V5_DATA.instrumental);
  const laboratoryEvents = splitPrimaryAndOtherEvents(V5_DATA.laboratoryStudies);

  const stats = useMemo(() => {
    const critical = V5_DATA.labs.filter((item) => item.tone === "critical").length;
    const warning = V5_DATA.labs.filter((item) => item.tone === "warning").length;
    const ok = V5_DATA.labs.filter((item) => item.tone === "ok").length;
    return { critical, warning, ok, total: V5_DATA.labs.length };
  }, [V5_DATA]);

  const eventsTotal = V5_DATA.consultations.length + V5_DATA.instrumental.length + V5_DATA.laboratoryStudies.length;
  const eventsAttentionCount = useMemo(() => {
    const waitingLabs = V5_DATA.laboratoryStudies.filter((item) => item.status !== "готов").length;
    const pendingConsultations = V5_DATA.consultations.filter((item) => !item.code || item.date === "-").length;
    const pendingInstrumental = V5_DATA.instrumental.filter((item) => item.date === "-").length;
    return waitingLabs + pendingConsultations + pendingInstrumental;
  }, [V5_DATA]);
  const otherEventsCount = consultationEvents.other.length + instrumentalEvents.other.length + laboratoryEvents.other.length;
  const selectedOakIndicator = useMemo(
    () => V5_DATA.oakPreview.indicators.find((item) => item.metric === selectedOakMetric) ?? V5_DATA.oakPreview.indicators[0],
    [selectedOakMetric, V5_DATA]
  );
  const filteredLabs = useMemo(() => {
    if (labToneFilter === "all") return V5_DATA.labs;
    return V5_DATA.labs.filter((item) => item.tone === labToneFilter);
  }, [labToneFilter, V5_DATA]);
  const activeClinicalTone = hoveredLabTone ?? (labToneFilter === "all" ? "all" : labToneFilter);
  const linkedTone = showClinicalLinks ? activeClinicalTone : "all";
  const riskLevel = stats.critical >= 2 ? "Высокий" : stats.critical === 1 || stats.warning >= 4 ? "Средний" : "Низкий";
  const riskClass = riskLevel === "Высокий" ? "high" : riskLevel === "Средний" ? "medium" : "low";

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      const nextSummary = buildV5Summary(V5_DATA);
      setSummary(nextSummary);
      setSummaryMeta((prev) => ({
        generatedAt: nextSummary.generatedAt,
        total: prev.total + 1
      }));
      setIsGenerating(false);
    }, 800);
  };

  const handleToggleLabTone = (tone) => {
    setLabToneFilter((prev) => (prev === tone ? "all" : tone));
  };

  const handleSelectScenario = (nextId) => {
    const nextScenario = V5_SCENARIOS.find((item) => item.id === nextId);
    if (!nextScenario) return;
    setScenarioId(nextId);
    setSummary(null);
    setSummaryMeta({ generatedAt: null, total: 0 });
    setSelectedOakMetric(nextScenario.data.oakPreview.indicators[0]?.metric ?? "");
    setLabToneFilter("all");
    setHoveredLabTone(null);
    setShowClinicalLinks(false);
  };

  return (
    <div className="v5x-page v5a-page page">
      <div className="v5x-glow v5x-glow-a" />
      <div className="v5x-glow v5x-glow-b" />

      <section className="panel v5a-unified-header animate-in">
        <header className="v5a-admin-header">
          <div className="v5a-admin-logo">
            <BrandLogo />
          </div>
          <div className="v5a-admin-center">
            <h2>{V5_ADMIN_HEADER.title}</h2>
            <p>{V5_ADMIN_HEADER.fullName}</p>
          </div>
          <div className="v5a-admin-actions" aria-label="Быстрые действия">
            <button type="button" className="v5a-admin-btn v5a-admin-help" aria-label="Справка">
              <svg className="v5a-admin-glyph" viewBox="0 0 24 24" role="img" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            <button type="button" className="v5a-admin-btn v5a-admin-font" aria-label="Размер шрифта">
              <span className="v5a-admin-font-a">A</span>
              <span className="v5a-admin-font-controls"><b>-</b><b>+</b></span>
            </button>
            <button type="button" className="v5a-admin-btn v5a-admin-icon v5a-admin-user" aria-label="Профиль">
              <span className="v5a-admin-icon-font" aria-hidden="true">
                {V5_ADMIN_ICON_GLYPHS.user}
              </span>
            </button>
            <button type="button" className="v5a-admin-btn v5a-admin-icon v5a-admin-gear" aria-label="Настройки">
              <span className="v5a-admin-icon-font" aria-hidden="true">
                {V5_ADMIN_ICON_GLYPHS.settings}
              </span>
            </button>
            <button type="button" className="v5a-admin-btn v5a-admin-icon v5a-admin-close" aria-label="Закрыть">
              <svg className="v5a-admin-close-glyph" viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" />
              </svg>
            </button>
          </div>
        </header>

        <div className="v5a-header-divider" />

        <div className="v5x-hero v5a-hero-content">
        <div className="v5x-hero-main">
          <div className="v5a-patient-wrap">
            <span className="v5a-patient-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <circle cx="12" cy="7.2" r="3.1" />
                <path d="M4.8 19.8c1.9-3.5 4.4-5.2 7.2-5.2s5.3 1.7 7.2 5.2" />
              </svg>
            </span>
            <div>
              <h1>{V5_DATA.profile.fullName}</h1>
              <p className="v5a-hero-subline">Снимок ЭМК: {V5_DATA.snapshotDate} · приоритет по критическим рискам</p>
            </div>
          </div>

          <article className={`v5x-risk-card v5a-risk-${riskClass}`}>
            <p>Индекс клинического риска</p>
            <strong>{riskLevel}</strong>
            <span>{stats.critical} критичных + {stats.warning} предупреждений</span>
          </article>
        </div>

        <div className="v5a-scenario-switch">
          <p>Демо-набор данных:</p>
          <div className="v5a-scenario-tabs">
            {V5_SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`v5a-scenario-tab${scenarioId === item.id ? " active" : ""}`}
                onClick={() => handleSelectScenario(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="v5x-metric-grid v5a-metric-grid">
          <article className="v5x-metric danger v5a-metric-primary">
            <p>Критичные лаборатории</p>
            <strong>{stats.critical}</strong>
            <span>строго по лабораторному блоку</span>
          </article>
          <article className="v5x-metric warning">
            <p>Требуют внимания</p>
            <strong>{stats.warning}</strong>
            <span>показателей с риском декомпенсации</span>
          </article>
          <article className="v5x-metric neutral">
            <p>Связанные срочные действия</p>
            <strong>{eventsAttentionCount}</strong>
            <span>событий требуют уточнения</span>
          </article>
        </div>
        <div className="v5a-link-note">
          <p>Всего событий в карточке: {eventsTotal}.</p>
          <label className="v5a-link-toggle">
            <input type="checkbox" checked={showClinicalLinks} onChange={(event) => setShowClinicalLinks(event.target.checked)} />
            Показать клинические связи
          </label>
          <span>
            {showClinicalLinks
              ? (activeClinicalTone === "all"
                ? "Подсветка связей включена. Выберите сегмент риска в лабораторном статусе."
                : `Подсветка связей активна: ${toneLabel(activeClinicalTone)}.`)
              : "Подсветка связей выключена: числа в KPI интерпретируются без расширенной связки."}
          </span>
        </div>
        </div>
      </section>

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
                    <span>{formatDisplayDate(V5_DATA.monitored.bloodPressure.date)}</span>
                  </header>
                  <p>
                    <b>{V5_DATA.monitored.bloodPressure.systolic}/{V5_DATA.monitored.bloodPressure.diastolic}</b> мм рт.ст., пульс <b>{V5_DATA.monitored.bloodPressure.pulse}</b>
                  </p>
                  <small>ЦУ: {formatReference(V5_DATA.monitored.bloodPressure.target)}</small>
                  <Sparkline values={V5_DATA.trends.systolic} color="#2a9f7a" label="Тренд АД" />
                </div>
                <div className="v5x-vital">
                  <header>
                    <strong>Глюкоза крови</strong>
                    <span>{formatDisplayDate(V5_DATA.monitored.glucose.date)}</span>
                  </header>
                  <p>
                    <b>{formatDisplayNumber(V5_DATA.monitored.glucose.value)}</b> {V5_DATA.monitored.glucose.unit}
                  </p>
                  <small>Целевой диапазон: {formatReference(V5_DATA.monitored.glucose.target)}</small>
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
            <p>САД и глюкоза за период наблюдения ({V5_DATA.trendDates.length} замеров)</p>
          </div>
          <div className="v5x-trend-wrap">
            <MultiTrendChart bpValues={V5_DATA.trends.systolic} glucoseValues={V5_DATA.trends.glucose} dates={V5_DATA.trendDates} />
            <div className="v5x-trend-legend">
              <p><i className="bp" />САД (мм рт.ст.)</p>
              <p><i className="glucose" />Глюкоза (ммоль/л)</p>
            </div>
          </div>
        </section>

        <section className="panel animate-in delay-2">
          <div className="v5x-section-head">
            <h2>Лабораторный статус и показатели</h2>
            <p>
              {labToneFilter === "all"
                ? `${V5_DATA.labs.length} показателей с приоритизацией по риску`
                : `Фильтр: ${toneLabel(labToneFilter)} (${filteredLabs.length})`}
            </p>
          </div>
          <div className="v5x-lab-layout">
            <article className="v5x-card v5x-lab-status-card">
              <h3>Статус лабораторий</h3>
              <div className="v5x-status-wrap">
                <StatusDonut
                  critical={stats.critical}
                  warning={stats.warning}
                  ok={stats.ok}
                  activeTone={labToneFilter}
                  hoveredTone={hoveredLabTone}
                  onHoverTone={setHoveredLabTone}
                  onToggleTone={handleToggleLabTone}
                />
                <ul className="v5x-legend">
                  <li>
                    <button type="button" className={`v5x-legend-btn${labToneFilter === "all" ? " active" : ""}`} onClick={() => setLabToneFilter("all")}>
                      Все: {V5_DATA.labs.length}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`v5x-legend-btn${labToneFilter === "critical" ? " active" : ""}`}
                      onClick={() => handleToggleLabTone("critical")}
                    >
                      <i className="danger" />
                      Критично: {stats.critical}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`v5x-legend-btn${labToneFilter === "warning" ? " active" : ""}`}
                      onClick={() => handleToggleLabTone("warning")}
                    >
                      <i className="warning" />
                      Внимание: {stats.warning}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`v5x-legend-btn${labToneFilter === "ok" ? " active" : ""}`}
                      onClick={() => handleToggleLabTone("ok")}
                    >
                      <i className="ok" />
                      Норма: {stats.ok}
                    </button>
                  </li>
                </ul>
              </div>
            </article>
            <div className="v5x-labs-grid">
              {filteredLabs.map((item) => {
                const badge = toneMeta(item.tone);
                return (
                  <article
                    className={`v5x-lab-card${item.name === "Гликированный гемоглобин" ? " v5x-lab-card-hba1c" : ""}`}
                    key={item.name}
                  >
                    <div className="v5x-lab-head">
                      <h3>{item.name}</h3>
                      <span className={badge.cls}>{badge.label}</span>
                    </div>
                    <p className="v5x-lab-value">{trendArrow(item.trend)} {formatDisplayNumber(item.value)} <span>({formatReference(item.reference)})</span></p>
                    <p className="v5x-date">Дата: {formatDisplayDate(item.date)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="panel v5x-events-section animate-in delay-3">
          <div className="v5x-section-head v5x-section-head-events">
            <h2>События пациента</h2>
            <div className="v5x-events-kpi">
              <p><strong>{eventsTotal}</strong> событий</p>
              <span>{eventsAttentionCount} требуют уточнения · {otherEventsCount} в прочем</span>
            </div>
          </div>
          <div className="v5x-events-grid">
            <article className="v5x-events-card consultations">
              <div className="v5x-events-card-head">
                <h3>Консультации</h3>
                <span>{V5_DATA.consultations.length}</span>
              </div>
              <ul className="v5x-events">
                {consultationEvents.primary.map((item, index) => {
                  const matchClass = toneMatchClass(item, linkedTone);
                  return (
                    <li className={matchClass.trim()} key={`consult-${item.name}-${index}`}>
                      <strong>{item.name}</strong>
                      <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                      <span className="v5x-event-note">{item.code ? `Профиль: ${item.code}` : "Профиль не указан"}</span>
                    </li>
                  );
                })}
              </ul>
              {consultationEvents.other.length > 0 && (
                <details className="v5x-events-more">
                  <summary>Прочее ({consultationEvents.other.length})</summary>
                  <ul className="v5x-events v5x-events-compact">
                    {consultationEvents.other.map((item, index) => {
                      const matchClass = toneMatchClass(item, linkedTone);
                      return (
                        <li className={matchClass.trim()} key={`consult-other-${item.name}-${index}`}>
                          <strong>{item.name}</strong>
                          <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                          <span className="v5x-event-note">{item.code ? `Профиль: ${item.code}` : "Профиль не указан"}</span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </article>

            <article className="v5x-events-card instrumental">
              <div className="v5x-events-card-head">
                <h3>Инструментальные исследования</h3>
                <span>{V5_DATA.instrumental.length}</span>
              </div>
              <ul className="v5x-events">
                {instrumentalEvents.primary.map((item, index) => {
                  const matchClass = toneMatchClass(item, linkedTone);
                  return (
                    <li className={matchClass.trim()} key={`inst-${item.name}-${index}`}>
                      <strong>{item.name}</strong>
                      <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                      <span className="v5x-event-note">{item.note}</span>
                    </li>
                  );
                })}
              </ul>
              {instrumentalEvents.other.length > 0 && (
                <details className="v5x-events-more">
                  <summary>Прочее ({instrumentalEvents.other.length})</summary>
                  <ul className="v5x-events v5x-events-compact">
                    {instrumentalEvents.other.map((item, index) => {
                      const matchClass = toneMatchClass(item, linkedTone);
                      return (
                        <li className={matchClass.trim()} key={`inst-other-${item.name}-${index}`}>
                          <strong>{item.name}</strong>
                          <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                          <span className="v5x-event-note">{item.note}</span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </article>

            <article className="v5x-events-card laboratory">
              <div className="v5x-events-card-head">
                <h3>Лабораторные исследования</h3>
                <span>{V5_DATA.laboratoryStudies.length}</span>
              </div>
              <ul className="v5x-events">
                {laboratoryEvents.primary.map((item, index) => {
                  const matchClass = toneMatchClass(item, linkedTone);
                  return (
                    <li className={matchClass.trim()} key={`labs-${item.name}-${index}`}>
                      <strong>{item.name}</strong>
                      <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                      <span className={`v5x-event-status ${labStudyStatusTone(item.status)}`}>
                        Статус: {item.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {laboratoryEvents.other.length > 0 && (
                <details className="v5x-events-more">
                  <summary>Прочее ({laboratoryEvents.other.length})</summary>
                  <ul className="v5x-events v5x-events-compact">
                    {laboratoryEvents.other.map((item, index) => {
                      const matchClass = toneMatchClass(item, linkedTone);
                      return (
                        <li className={matchClass.trim()} key={`labs-other-${item.name}-${index}`}>
                          <strong>{item.name}</strong>
                          <span className="v5x-event-date">{formatDisplayDate(item.date)}</span>
                          <span className={`v5x-event-status ${labStudyStatusTone(item.status)}`}>
                            Статус: {item.status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </article>
          </div>
        </section>

        <section className="panel v5x-therapy-section animate-in delay-3">
          <h2>Медикаментозная терапия</h2>
          <div className="v5x-therapy-grid">
            {V5_DATA.diseaseTherapy.map((item) => (
              <article className={`v5x-therapy-card ${item.code === "I10" ? "ag" : "sd"}${toneMatchClass(item, linkedTone)}`} key={item.name}>
                <header>
                  <h3>{item.name} <span>({item.icd})</span></h3>
                  <p>{formatDisplayDate(item.date)}</p>
                </header>
                <div className="v5x-therapy-meta">
                  <p>МКБ-10: <strong>{item.code}</strong></p>
                  <p>Диагноз: <strong>{item.diagnosis}</strong></p>
                </div>
                <h4>Назначения</h4>
                <ul className="v5x-list">
                  {item.meds.map((med) => (
                    <li key={med}>{med}</li>
                  ))}
                </ul>
              </article>
            ))}

            <article className={`v5x-therapy-card comorbid${toneMatchClass(V5_DATA.comorbidTherapy, linkedTone)}`}>
              <header>
                <h3>{V5_DATA.comorbidTherapy.title}</h3>
                <p>{formatDisplayDate(V5_DATA.comorbidTherapy.date)}</p>
              </header>
              <div className="v5x-therapy-meta">
                <p>МКБ-10: <strong>{V5_DATA.comorbidTherapy.icd}</strong></p>
                <p>Диагноз: <strong>{V5_DATA.comorbidTherapy.diagnosis}</strong></p>
              </div>
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
          <section className="panel animate-in delay-4">
            <h2>Быстрый просмотр ОАК</h2>
            <div className="table-wrap v5x-oak-table-wrap">
              <table className="v5x-oak-table">
                <thead>
                  <tr>
                    <th>Показатель</th>
                    <th>Последнее значение</th>
                    <th>Референс</th>
                    <th>Последняя дата</th>
                  </tr>
                </thead>
                <tbody>
                  {V5_DATA.oakPreview.indicators.map((item) => {
                    const lastPoint = item.history.at(-1);
                    const isSelected = item.metric === selectedOakMetric;
                    return (
                      <tr key={item.metric} className={isSelected ? "v5x-oak-row-active" : ""}>
                        <td>
                          <button
                            type="button"
                            className={`v5x-oak-row-button${isSelected ? " active" : ""}`}
                            onClick={() => setSelectedOakMetric(item.metric)}
                          >
                            {item.metric}
                          </button>
                        </td>
                        <td>{lastPoint ? formatValueWithUnit(formatTrendValue(lastPoint.value), item.unit) : "—"}</td>
                        <td>{formatReference(item.reference)}</td>
                        <td>{formatDisplayDate(lastPoint?.date ?? "-")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selectedOakIndicator && (
              <div className="v5x-oak-trend-panel">
                <div className="v5x-oak-trend-head">
                  <h3>{selectedOakIndicator.metric}: тренд дата/значение</h3>
                  <p>Референс: {formatReference(selectedOakIndicator.reference)} {selectedOakIndicator.unit}</p>
                </div>
                <OakTrendChart history={selectedOakIndicator.history} color={selectedOakIndicator.color} />
              </div>
            )}
            <p className="v5x-date">Нажмите на показатель, чтобы открыть график тренда дата/значение.</p>
          </section>

          <section className="panel v5x-summary-panel animate-in delay-4">
            <div className="v5x-summary-head">
              <h2>ИИ-сводка по пациенту</h2>
              <p className="v5a-summary-meta">
                {summaryMeta.generatedAt
                  ? `Последняя сводка: ${summaryMeta.generatedAt} · запусков: ${summaryMeta.total}`
                  : "Сводка еще не формировалась"}
              </p>
            </div>

            <button className="summary-button" onClick={handleGenerateSummary} disabled={isGenerating}>
              {isGenerating ? "Формируем ИИ-сводку..." : "Сформировать ИИ-сводку"}
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
        </section>
      </main>
    </div>
  );
}

export default V5AltDashboard;
