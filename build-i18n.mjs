/* ============================================================
   Genera una versión estática por idioma de la landing.
   Fuente única: index.html (español, canonical). Para cada
   idioma crea /<lang>/index.html con el <head> traducido
   (title, description, Open Graph, Twitter, canonical, hreflang,
   og:locale, JSON-LD inLanguage) y rutas de recursos absolutas.
   El cuerpo lo traduce i18n.js en cliente según el prefijo /xx/.
   Se ejecuta en el build (deploy.yml) y también en local.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(`${ROOT}/index.html`, "utf8");

// Traducciones del <head>. El <title> reutiliza los del diccionario de i18n.js.
const META = {
  en: {
    locale: "en_US",
    title: "Rhabit — Calendar, habits and discipline app | Jump today",
    ogTitle: "Rhabit — Calendar, habits and discipline app",
    desc: "Rhabit is a calendar app that brings together your habits, workouts, study and goals and turns them into a daily streak. The habits and discipline app to stay consistent. Join the waitlist and get exclusive gifts at launch.",
    ogDesc: "The calendar app that unites your habits, workouts, study and goals into a daily streak. Discipline and consistency in one app. Join the waitlist — exclusive gifts for the first ones.",
    twDesc: "The calendar, habits and discipline app that unites workouts, study and goals into a daily streak. Join the waitlist.",
  },
  de: {
    locale: "de_DE",
    title: "Rhabit — Kalender-, Gewohnheits- und Disziplin-App | Spring heute",
    ogTitle: "Rhabit — Kalender-, Gewohnheits- und Disziplin-App",
    desc: "Rhabit ist eine Kalender-App, die deine Gewohnheiten, Workouts, dein Lernen und deine Ziele vereint und in eine tägliche Serie verwandelt. Die App für Gewohnheiten und Disziplin, um dranzubleiben. Trag dich in die Warteliste ein und sichere dir exklusive Geschenke zum Start.",
    ogDesc: "Die Kalender-App, die deine Gewohnheiten, Workouts, dein Lernen und deine Ziele zu einer täglichen Serie vereint. Disziplin und Beständigkeit in einer App. Jetzt auf die Warteliste — exklusive Geschenke für die Ersten.",
    twDesc: "Die Kalender-, Gewohnheits- und Disziplin-App, die Workouts, Lernen und Ziele zu einer täglichen Serie vereint. Trag dich in die Warteliste ein.",
  },
  fr: {
    locale: "fr_FR",
    title: "Rhabit — App de calendrier, habitudes et discipline | Saute aujourd'hui",
    ogTitle: "Rhabit — App de calendrier, habitudes et discipline",
    desc: "Rhabit est une app de calendrier qui réunit tes habitudes, tes entraînements, tes révisions et tes objectifs et les transforme en une série quotidienne. L'app d'habitudes et de discipline pour rester régulier. Inscris-toi sur la liste d'attente et reçois des cadeaux exclusifs au lancement.",
    ogDesc: "L'app de calendrier qui réunit tes habitudes, entraînements, révisions et objectifs en une série quotidienne. Discipline et régularité dans une seule app. Inscris-toi sur la liste d'attente — cadeaux exclusifs pour les premiers.",
    twDesc: "L'app de calendrier, d'habitudes et de discipline qui réunit entraînements, révisions et objectifs en une série quotidienne. Inscris-toi sur la liste d'attente.",
  },
  it: {
    locale: "it_IT",
    title: "Rhabit — App di calendario, abitudini e disciplina | Salta oggi",
    ogTitle: "Rhabit — App di calendario, abitudini e disciplina",
    desc: "Rhabit è un'app di calendario che unisce le tue abitudini, gli allenamenti, lo studio e gli obiettivi e li trasforma in una serie quotidiana. L'app di abitudini e disciplina per essere costante. Iscriviti alla lista d'attesa e ricevi regali esclusivi al lancio.",
    ogDesc: "L'app di calendario che unisce le tue abitudini, allenamenti, studio e obiettivi in una serie quotidiana. Disciplina e costanza in un'unica app. Iscriviti alla lista d'attesa — regali esclusivi per i primi.",
    twDesc: "L'app di calendario, abitudini e disciplina che unisce allenamenti, studio e obiettivi in una serie quotidiana. Iscriviti alla lista d'attesa.",
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function build(lang, m) {
  let h = SRC;
  const base = `https://rhabit.app/${lang}/`;

  h = h.replace('<html lang="es">', `<html lang="${lang}">`);
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${esc(m.desc)}" />`
  );
  h = h.replace(
    '<link rel="canonical" href="https://rhabit.app/" />',
    `<link rel="canonical" href="${base}" />`
  );
  h = h.replace(
    '<meta property="og:site_name" content="Rhabit" />\n  <meta property="og:locale" content="es_ES" />',
    `<meta property="og:site_name" content="Rhabit" />\n  <meta property="og:locale" content="${m.locale}" />`
  );
  h = h.replace('<meta property="og:url" content="https://rhabit.app/" />', `<meta property="og:url" content="${base}" />`);
  h = h.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${esc(m.ogTitle)}" />`
  );
  h = h.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${esc(m.ogDesc)}" />`
  );
  h = h.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${esc(m.ogTitle)}" />`
  );
  h = h.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${esc(m.twDesc)}" />`
  );
  h = h.replace(/"inLanguage": "es"/g, `"inLanguage": "${lang}"`);

  // Rutas de recursos -> absolutas (el archivo vive en /<lang>/).
  h = h.replace(/(href|src|poster)="assets\//g, '$1="/assets/');
  h = h.replace('href="favicon.ico"', 'href="/favicon.ico"');
  h = h.replace('href="site.webmanifest"', 'href="/site.webmanifest"');
  h = h.replace('href="styles.css"', 'href="/styles.css"');
  h = h.replace('src="i18n.js"', 'src="/i18n.js"');
  h = h.replace('src="script.js"', 'src="/script.js"');
  // Enlaces internos.
  h = h.replace('href="/"', `href="/${lang}/"`);
  h = h.replace('href="donar.html"', 'href="/donar.html"');

  mkdirSync(`${ROOT}/${lang}`, { recursive: true });
  writeFileSync(`${ROOT}/${lang}/index.html`, h);
  console.log(`✓ /${lang}/index.html`);
}

for (const [lang, m] of Object.entries(META)) build(lang, m);
