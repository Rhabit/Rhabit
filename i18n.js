/* ============================================================
   i18n de la landing de Rhabit.
   Idiomas: es (base), en, de, fr, it.
   - t(key, vars)  -> cadenas estáticas (data-i18n en el HTML y JS).
   - tx(str)       -> frases dinámicas del mockup, buscadas por su
                      texto en español (meses, ejercicios, músculos…).
   Al cambiar de idioma se guarda en localStorage y se recarga.
   ============================================================ */
(function () {
  // URL limpia: si se cargó como /index.html, quítalo de la barra sin recargar.
  // Solo en http(s): en file:// replaceState lanza SecurityError (origen "null").
  if (location.pathname.endsWith("/index.html") &&
      (location.protocol === "http:" || location.protocol === "https:")) {
    try {
      history.replaceState(null, "", location.pathname.slice(0, -"index.html".length) + location.search);
    } catch (e) { /* noop */ }
  }

  const LANGS = ["es", "en", "de", "fr", "it"];
  const LANG_URL = { es: "/", en: "/en/", de: "/de/", fr: "/fr/", it: "/it/" };

  // Prefijo de idioma en la URL (/en/, /de/…). "" si estamos en la raíz.
  const PATH_PREFIX = (location.pathname.match(/^\/(en|de|fr|it)(\/|$)/) || [])[1] || "";
  const IS_HOME = location.pathname === "/" || location.pathname === "/index.html";
  // Las URLs por idioma (/xx/ y la home española) fijan el idioma por la URL;
  // solo otras páginas sueltas (p. ej. donar.html) usan preferencia/navegador.
  const URL_DRIVEN = !!PATH_PREFIX || IS_HOME;

  function detectLang() {
    if (PATH_PREFIX && LANGS.includes(PATH_PREFIX)) return PATH_PREFIX;
    if (IS_HOME) return "es"; // canonical española; el idioma vive en /xx/
    const saved = localStorage.getItem("rhabit_lang");
    if (saved && LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : "es";
  }
  const LANG = detectLang();

  // ── Cadenas estáticas: key -> { es, en, de, fr, it } ──────────
  const DICT = {
    "meta.title": {
      es: "Rhabit — App de calendario, hábitos y disciplina | Salta hoy",
      en: "Rhabit — Calendar, habits and discipline app | Jump today",
      de: "Rhabit — Kalender-, Gewohnheits- und Disziplin-App | Spring heute",
      fr: "Rhabit — App de calendrier, habitudes et discipline | Saute aujourd'hui",
      it: "Rhabit — App di calendario, abitudini e disciplina | Salta oggi",
    },
    "meta.titleDonate": {
      es: "Apoya Rhabit — Dona con Ko-fi",
      en: "Support Rhabit — Donate with Ko-fi",
      de: "Rhabit unterstützen — Mit Ko-fi spenden",
      fr: "Soutiens Rhabit — Fais un don avec Ko-fi",
      it: "Sostieni Rhabit — Dona con Ko-fi",
    },
    "donate.back": { es: "Volver", en: "Back", de: "Zurück", fr: "Retour", it: "Indietro" },
    "skip":     { es: "Saltar al contenido", en: "Skip to content", de: "Zum Inhalt springen", fr: "Aller au contenu", it: "Vai al contenuto" },
    "nav.how":  { es: "Cómo funciona", en: "How it works", de: "So funktioniert's", fr: "Comment ça marche", it: "Come funziona" },
    "nav.app":  { es: "La app", en: "The app", de: "Die App", fr: "L'app", it: "L'app" },
    "nav.join": { es: "Apúntate", en: "Join", de: "Mitmachen", fr: "Rejoindre", it: "Iscriviti" },
    "badge":    { es: "Próximamente · Lista de espera abierta", en: "Coming soon · Waitlist open", de: "Bald verfügbar · Warteliste offen", fr: "Bientôt · Liste d'attente ouverte", it: "Presto · Lista d'attesa aperta" },

    "hero.title": {
      es: `Salta <span class="grad">hoy</span>.<br /> Mañana estarás más cerca.`,
      en: `Jump <span class="grad">today</span>.<br /> Tomorrow you'll be closer.`,
      de: `Spring <span class="grad">heute</span>.<br /> Morgen bist du näher dran.`,
      fr: `Saute <span class="grad">aujourd'hui</span>.<br /> Demain tu seras plus près.`,
      it: `Salta <span class="grad">oggi</span>.<br /> Domani sarai più vicino.`,
    },
    "hero.sub": {
      es: `Rhabit es un calendario que une tus <strong>hábitos</strong>, <strong>entrenos</strong>, <strong>estudio</strong> y <strong>metas</strong>, y los convierte en una racha que no querrás romper.`,
      en: `Rhabit is a calendar that brings together your <strong>habits</strong>, <strong>workouts</strong>, <strong>study</strong> and <strong>goals</strong>, and turns them into a streak you won't want to break.`,
      de: `Rhabit ist ein Kalender, der deine <strong>Gewohnheiten</strong>, <strong>Workouts</strong>, dein <strong>Lernen</strong> und deine <strong>Ziele</strong> vereint und in eine Serie verwandelt, die du nicht brechen willst.`,
      fr: `Rhabit est un calendrier qui réunit tes <strong>habitudes</strong>, tes <strong>entraînements</strong>, tes <strong>études</strong> et tes <strong>objectifs</strong>, et les transforme en une série que tu ne voudras pas briser.`,
      it: `Rhabit è un calendario che riunisce le tue <strong>abitudini</strong>, i tuoi <strong>allenamenti</strong>, lo <strong>studio</strong> e i tuoi <strong>obiettivi</strong>, trasformandoli in una serie che non vorrai interrompere.`,
    },
    "form.emailPh":   { es: "tu@correo.com", en: "you@email.com", de: "du@mail.com", fr: "toi@email.com", it: "tu@email.com" },
    "form.emailAria": { es: "Tu correo electrónico", en: "Your email", de: "Deine E-Mail", fr: "Ton e-mail", it: "La tua email" },
    "form.notify":    { es: "Avísame al salir", en: "Notify me at launch", de: "Zum Start benachrichtigen", fr: "Préviens-moi au lancement", it: "Avvisami al lancio" },
    "hero.hint": {
      es: `Los que se apunten ahora reciben <strong>regalos exclusivos</strong> el día del lanzamiento.`,
      en: `Those who join now get <strong>exclusive gifts</strong> on launch day.`,
      de: `Wer sich jetzt anmeldet, erhält am Starttag <strong>exklusive Geschenke</strong>.`,
      fr: `Ceux qui s'inscrivent maintenant reçoivent des <strong>cadeaux exclusifs</strong> le jour du lancement.`,
      it: `Chi si iscrive ora riceve <strong>regali esclusivi</strong> il giorno del lancio.`,
    },
    "altch.sep":    { es: "o avísame por otra vía", en: "or notify me another way", de: "oder anders benachrichtigen", fr: "ou préviens-moi autrement", it: "o avvisami in altro modo" },
    "altch.notify": { es: "Avísame", en: "Notify me", de: "Benachrichtigen", fr: "Préviens-moi", it: "Avvisami" },
    "altch.hint": {
      es: `Te avisaremos por <strong id="altch-name">WhatsApp</strong> el día del lanzamiento.`,
      en: `We'll notify you on <strong id="altch-name">WhatsApp</strong> on launch day.`,
      de: `Wir benachrichtigen dich am Starttag über <strong id="altch-name">WhatsApp</strong>.`,
      fr: `Nous te préviendrons sur <strong id="altch-name">WhatsApp</strong> le jour du lancement.`,
      it: `Ti avviseremo su <strong id="altch-name">WhatsApp</strong> il giorno del lancio.`,
    },
    "success.title": { es: "¡Estás dentro!", en: "You're in!", de: "Du bist dabei!", fr: "Tu es inscrit !", it: "Ci sei!" },
    "success.text": {
      es: `Te avisaremos en cuanto Rhabit esté disponible. Prepárate para tus <strong>regalos de bienvenida</strong>`,
      en: `We'll let you know as soon as Rhabit is available. Get ready for your <strong>welcome gifts</strong>`,
      de: `Wir melden uns, sobald Rhabit verfügbar ist. Freu dich auf deine <strong>Willkommensgeschenke</strong>`,
      fr: `Nous te préviendrons dès que Rhabit sera disponible. Prépare-toi pour tes <strong>cadeaux de bienvenue</strong>`,
      it: `Ti avviseremo appena Rhabit sarà disponibile. Preparati per i tuoi <strong>regali di benvenuto</strong>`,
    },
    "trust1": { es: "Sin spam, solo el aviso de lanzamiento", en: "No spam, just the launch alert", de: "Kein Spam, nur die Start-Info", fr: "Pas de spam, juste l'alerte de lancement", it: "Niente spam, solo l'avviso di lancio" },
    "trust2": { es: "Tu correo se guarda cifrado", en: "Your email is stored encrypted", de: "Deine E-Mail wird verschlüsselt gespeichert", fr: "Ton e-mail est stocké chiffré", it: "La tua email è salvata cifrata" },
    "trust3": { es: "Regalos garantizados para los primeros", en: "Guaranteed gifts for the first ones", de: "Garantierte Geschenke für die Ersten", fr: "Cadeaux garantis pour les premiers", it: "Regali garantiti per i primi" },

    "strip1": { es: "Estadísticas de un año", en: "A year of stats", de: "Statistiken über ein Jahr", fr: "Statistiques sur un an", it: "Statistiche di un anno" },
    "strip2": { es: "+600 ejercicios animados", en: "+600 animated exercises", de: "+600 animierte Übungen", fr: "+600 exercices animés", it: "+600 esercizi animati" },
    "strip3": { es: "+150 hábitos", en: "+150 habits", de: "+150 Gewohnheiten", fr: "+150 habitudes", it: "+150 abitudini" },
    "strip4": { es: "Metas y calendario", en: "Goals and calendar", de: "Ziele und Kalender", fr: "Objectifs et calendrier", it: "Obiettivi e calendario" },

    "feat.eyebrow": { es: "Cómo funciona", en: "How it works", de: "So funktioniert's", fr: "Comment ça marche", it: "Come funziona" },
    "feat.title":   { es: "Simple de usar. Difícil de dejar.", en: "Simple to use. Hard to quit.", de: "Einfach zu nutzen. Schwer aufzuhören.", fr: "Simple à utiliser. Difficile à lâcher.", it: "Semplice da usare. Difficile da lasciare." },
    "feat.sub": {
      es: "Eliges tu objetivo, Rhabit te propone hábitos a tu medida y tú solo tienes que ir marcando. Un salto no es nada. Saltar cada día lo es todo.",
      en: "You choose your goal, Rhabit suggests habits tailored to you, and all you have to do is check them off. One jump is nothing. Jumping every day is everything.",
      de: "Du wählst dein Ziel, Rhabit schlägt dir passende Gewohnheiten vor und du hakst sie einfach ab. Ein Sprung ist nichts. Jeden Tag zu springen ist alles.",
      fr: "Tu choisis ton objectif, Rhabit te propose des habitudes sur mesure et tu n'as qu'à les cocher. Un saut n'est rien. Sauter chaque jour, c'est tout.",
      it: "Scegli il tuo obiettivo, Rhabit ti propone abitudini su misura e tu devi solo spuntarle. Un salto non è nulla. Saltare ogni giorno è tutto.",
    },
    "step1.t": { es: "Cuéntanos tu objetivo", en: "Tell us your goal", de: "Nenn uns dein Ziel", fr: "Dis-nous ton objectif", it: "Raccontaci il tuo obiettivo" },
    "step1.p": {
      es: "Salud, forma física, estudio, calma… El onboarding te arma un plan de hábitos personalizado en segundos.",
      en: "Health, fitness, study, calm… Onboarding builds a personalized habit plan in seconds.",
      de: "Gesundheit, Fitness, Lernen, Ruhe… Das Onboarding erstellt in Sekunden einen persönlichen Gewohnheitsplan.",
      fr: "Santé, forme, études, calme… L'onboarding te crée un plan d'habitudes personnalisé en quelques secondes.",
      it: "Salute, forma fisica, studio, calma… L'onboarding crea un piano di abitudini personalizzato in pochi secondi.",
    },
    "step2.t": { es: "Marca tu día", en: "Check off your day", de: "Hak deinen Tag ab", fr: "Coche ta journée", it: "Spunta la tua giornata" },
    "step2.p": {
      es: "Un toque para completar cada hábito, entreno o sesión. Sin fricción, sin menús eternos.",
      en: "One tap to complete each habit, workout or session. No friction, no endless menus.",
      de: "Ein Tippen für jede Gewohnheit, jedes Workout oder jede Sitzung. Keine Reibung, keine endlosen Menüs.",
      fr: "Un toucher pour valider chaque habitude, entraînement ou séance. Sans friction, sans menus interminables.",
      it: "Un tocco per completare ogni abitudine, allenamento o sessione. Senza attriti, senza menu infiniti.",
    },
    "step3.t": { es: "Mantén la racha", en: "Keep the streak", de: "Halte die Serie", fr: "Garde la série", it: "Mantieni la serie" },
    "step3.p": {
      es: "Ve tu progreso, celebra tus logros y no rompas la cadena. La constancia se vuelve adictiva.",
      en: "See your progress, celebrate your wins and don't break the chain. Consistency becomes addictive.",
      de: "Sieh deinen Fortschritt, feiere deine Erfolge und brich die Kette nicht. Beständigkeit macht süchtig.",
      fr: "Vois ta progression, célèbre tes réussites et ne romps pas la chaîne. La régularité devient addictive.",
      it: "Vedi i tuoi progressi, festeggia i traguardi e non spezzare la catena. La costanza dà dipendenza.",
    },

    "show.eyebrow": { es: "Dentro de la app", en: "Inside the app", de: "In der App", fr: "Dans l'app", it: "Dentro l'app" },
    "show.title":   { es: "Todo lo que Rhabit hace por ti", en: "Everything Rhabit does for you", de: "Alles, was Rhabit für dich tut", fr: "Tout ce que Rhabit fait pour toi", it: "Tutto ciò che Rhabit fa per te" },
    "show.sub": {
      es: "Entrenos animados, un calendario enfocado en disciplina y tus hábitos del día — todo en un diseño oscuro y elegante. Interactúa con las pantallas (solo son una muestra, sin funcionalidad real).",
      en: "Animated workouts, a discipline-focused calendar and your daily habits — all in a sleek dark design. Play with the screens (they're just a demo, no real functionality).",
      de: "Animierte Workouts, ein disziplinorientierter Kalender und deine täglichen Gewohnheiten — alles in elegantem Dark Design. Interagiere mit den Screens (nur eine Demo, ohne echte Funktion).",
      fr: "Des entraînements animés, un calendrier axé sur la discipline et tes habitudes du jour — le tout dans un design sombre et élégant. Interagis avec les écrans (ce n'est qu'une démo, sans fonctionnalité réelle).",
      it: "Allenamenti animati, un calendario incentrato sulla disciplina e le tue abitudini del giorno — tutto in un design scuro ed elegante. Interagisci con le schermate (sono solo una demo, senza funzionalità reali).",
    },
    "row1.pill": { es: "Entrenos", en: "Workouts", de: "Workouts", fr: "Entraînements", it: "Allenamenti" },
    "row1.t":    { es: "Entrena con guía visual", en: "Train with visual guidance", de: "Trainiere mit visueller Anleitung", fr: "Entraîne-toi avec un guide visuel", it: "Allenati con una guida visiva" },
    "row1.p": {
      es: "Más de 600 ejercicios con animaciones en 3D que te muestran la técnica exacta. Registra series, repeticiones y peso, y deja que Rhabit lleve la cuenta de tu progreso.",
      en: "Over 600 exercises with 3D animations that show you the exact technique. Log sets, reps and weight, and let Rhabit track your progress.",
      de: "Über 600 Übungen mit 3D-Animationen, die dir die exakte Technik zeigen. Erfasse Sätze, Wiederholungen und Gewicht und lass Rhabit deinen Fortschritt verfolgen.",
      fr: "Plus de 600 exercices avec des animations 3D qui te montrent la technique exacte. Enregistre séries, répétitions et poids, et laisse Rhabit suivre ta progression.",
      it: "Oltre 600 esercizi con animazioni 3D che ti mostrano la tecnica esatta. Registra serie, ripetizioni e peso e lascia che Rhabit tenga traccia dei tuoi progressi.",
    },
    "row2.pill": { es: "Organización", en: "Organization", de: "Organisation", fr: "Organisation", it: "Organizzazione" },
    "row2.t":    { es: "Tu mes entero de un vistazo", en: "Your whole month at a glance", de: "Dein ganzer Monat auf einen Blick", fr: "Ton mois entier d'un coup d'œil", it: "Tutto il mese a colpo d'occhio" },
    "row2.p": {
      es: "El calendario reúne tus hábitos y rachas en una sola vista: cada día se colorea según lo que completaste. Y debajo, tus franjas horarias con lo que toca hoy. Toca un día o cambia de mes para explorarlo.",
      en: "The calendar gathers your habits and streaks in a single view: each day is colored by what you completed. And below, your time slots with today's plan. Tap a day or change month to explore.",
      de: "Der Kalender bündelt deine Gewohnheiten und Serien in einer Ansicht: Jeder Tag wird nach dem eingefärbt, was du geschafft hast. Darunter deine Zeitfenster mit dem heutigen Plan. Tippe auf einen Tag oder wechsle den Monat.",
      fr: "Le calendrier réunit tes habitudes et séries dans une seule vue : chaque jour se colore selon ce que tu as accompli. En dessous, tes créneaux avec le programme du jour. Touche un jour ou change de mois pour explorer.",
      it: "Il calendario riunisce abitudini e serie in un'unica vista: ogni giorno si colora in base a ciò che hai completato. Sotto, le tue fasce orarie con il programma di oggi. Tocca un giorno o cambia mese per esplorare.",
    },
    "row3.pill": { es: "Hábitos", en: "Habits", de: "Gewohnheiten", fr: "Habitudes", it: "Abitudini" },
    "row3.t":    { es: "Repasa tu día con un swipe", en: "Review your day with a swipe", de: "Prüfe deinen Tag mit einem Swipe", fr: "Passe ta journée en revue d'un swipe", it: "Rivedi la giornata con uno swipe" },
    "row3.p": {
      es: "Cada noche, Rhabit te muestra tus hábitos como tarjetas. Desliza a la derecha si lo hiciste, a la izquierda si no, o arriba para dejarlo para más tarde. Rápido, adictivo y satisfactorio. Pruébalo aquí mismo.",
      en: "Each night, Rhabit shows your habits as cards. Swipe right if you did it, left if you didn't, or up to leave it for later. Fast, addictive and satisfying. Try it right here.",
      de: "Jeden Abend zeigt dir Rhabit deine Gewohnheiten als Karten. Wische nach rechts, wenn du es geschafft hast, nach links, wenn nicht, oder nach oben für später. Schnell, süchtig machend und befriedigend. Probier es gleich hier aus.",
      fr: "Chaque soir, Rhabit affiche tes habitudes sous forme de cartes. Glisse à droite si tu l'as fait, à gauche sinon, ou vers le haut pour plus tard. Rapide, addictif et satisfaisant. Essaie ici même.",
      it: "Ogni sera Rhabit ti mostra le abitudini come carte. Scorri a destra se l'hai fatto, a sinistra se no, o in alto per rimandare. Veloce, coinvolgente e soddisfacente. Provalo qui.",
    },
    "row4.pill": { es: "Entrenos", en: "Workouts", de: "Workouts", fr: "Entraînements", it: "Allenamenti" },
    "row4.t":    { es: "Registra cada serie", en: "Log every set", de: "Erfasse jeden Satz", fr: "Enregistre chaque série", it: "Registra ogni serie" },
    "row4.p": {
      es: "Anota el peso y las repeticiones, marca cada serie completada y consulta la técnica del ejercicio en vídeo. Rhabit suma tu volumen y tus series al instante. Edita los valores y marca las series aquí mismo.",
      en: "Note the weight and reps, check off each completed set and watch the exercise technique on video. Rhabit adds up your volume and sets instantly. Edit the values and check sets right here.",
      de: "Notiere Gewicht und Wiederholungen, hake jeden erledigten Satz ab und sieh dir die Technik im Video an. Rhabit summiert Volumen und Sätze sofort. Bearbeite die Werte und hake die Sätze gleich hier ab.",
      fr: "Note le poids et les répétitions, coche chaque série terminée et regarde la technique en vidéo. Rhabit additionne ton volume et tes séries instantanément. Modifie les valeurs et coche les séries ici même.",
      it: "Segna peso e ripetizioni, spunta ogni serie completata e guarda la tecnica dell'esercizio in video. Rhabit somma volume e serie all'istante. Modifica i valori e spunta le serie qui.",
    },

    "cal.filter": { es: "Todos los hábitos", en: "All habits", de: "Alle Gewohnheiten", fr: "Toutes les habitudes", it: "Tutte le abitudini" },
    "sw.kicker":  { es: "Revisar hábitos", en: "Review habits", de: "Gewohnheiten prüfen", fr: "Revoir les habitudes", it: "Rivedi abitudini" },
    "sw.title":   { es: "Swipe de hábitos", en: "Habit swipe", de: "Gewohnheiten-Swipe", fr: "Swipe d'habitudes", it: "Swipe delle abitudini" },
    "gym.time":   { es: "Tiempo", en: "Time", de: "Zeit", fr: "Temps", it: "Tempo" },
    "gym.volume": { es: "Volumen", en: "Volume", de: "Volumen", fr: "Volume", it: "Volume" },
    "gym.series": { es: "Series", en: "Sets", de: "Sätze", fr: "Séries", it: "Serie" },
    "gym.muscles":{ es: "Músculos", en: "Muscles", de: "Muskeln", fr: "Muscles", it: "Muscoli" },
    "ex.today":   { es: "Series de hoy", en: "Today's sets", de: "Heutige Sätze", fr: "Séries du jour", it: "Serie di oggi" },
    "musc.title": { es: "Músculos trabajados", en: "Muscles worked", de: "Trainierte Muskeln", fr: "Muscles travaillés", it: "Muscoli allenati" },

    "gym.bestWeight":  { es: "Mejor peso", en: "Best weight", de: "Bestes Gewicht", fr: "Meilleur poids", it: "Miglior peso" },
    "gym.rm":          { es: "1RM est.", en: "est. 1RM", de: "1RM gesch.", fr: "1RM est.", it: "1RM stim." },
    "gym.set":         { es: "Serie", en: "Set", de: "Satz", fr: "Série", it: "Serie" },
    "gym.previous":    { es: "Anterior", en: "Previous", de: "Vorher", fr: "Précédent", it: "Precedente" },
    "gym.reps":        { es: "Reps", en: "Reps", de: "Whd.", fr: "Reps", it: "Rip." },
    "gym.addSet":      { es: "Añadir serie", en: "Add set", de: "Satz hinzufügen", fr: "Ajouter une série", it: "Aggiungi serie" },
    "gym.view":        { es: "Ver", en: "View", de: "Ansehen", fr: "Voir", it: "Vedi" },
    "gym.muscleEmpty": {
      es: "Completa series para ver los músculos trabajados",
      en: "Complete sets to see the muscles worked",
      de: "Schließe Sätze ab, um die trainierten Muskeln zu sehen",
      fr: "Termine des séries pour voir les muscles travaillés",
      it: "Completa delle serie per vedere i muscoli allenati",
    },

    "sw.today":  { es: "HOY", en: "TODAY", de: "HEUTE", fr: "AUJOURD'HUI", it: "OGGI" },
    "sw.hint":   { es: "Desliza o usa los botones", en: "Swipe or use the buttons", de: "Wische oder nutze die Tasten", fr: "Glisse ou utilise les boutons", it: "Scorri o usa i pulsanti" },
    "sw.doneStamp":  { es: "Hecho", en: "Done", de: "Erledigt", fr: "Fait", it: "Fatto" },
    "sw.failStamp":  { es: "No hecho", en: "Not done", de: "Nicht erledigt", fr: "Non fait", it: "Non fatto" },
    "sw.laterStamp": { es: "Más tarde", en: "Later", de: "Später", fr: "Plus tard", it: "Più tardi" },
    "sw.doneTitle":  { es: "¡Día revisado!", en: "Day reviewed!", de: "Tag geprüft!", fr: "Journée passée en revue !", it: "Giornata rivista!" },
    "sw.repeat":     { es: "Repetir", en: "Repeat", de: "Wiederholen", fr: "Recommencer", it: "Ripeti" },
    "sw.summaryOne": {
      es: "{n} hábito al día · racha a salvo", en: "{n} habit on track · streak safe",
      de: "{n} Gewohnheit erledigt · Serie gesichert", fr: "{n} habitude tenue · série sauvée",
      it: "{n} abitudine a posto · serie salva",
    },
    "sw.summaryMany": {
      es: "{n} hábitos al día · racha a salvo", en: "{n} habits on track · streak safe",
      de: "{n} Gewohnheiten erledigt · Serie gesichert", fr: "{n} habitudes tenues · série sauvée",
      it: "{n} abitudini a posto · serie salva",
    },
    "sch.today": { es: "Hoy", en: "Today", de: "Heute", fr: "Aujourd'hui", it: "Oggi" },
    "sch.empty": { es: "Sin actividades este día", en: "No activities this day", de: "Keine Aktivitäten an diesem Tag", fr: "Aucune activité ce jour", it: "Nessuna attività in questo giorno" },

    "grid.eyebrow": { es: "Todo en una app", en: "All in one app", de: "Alles in einer App", fr: "Tout dans une app", it: "Tutto in un'app" },
    "grid.title":   { es: "Una herramienta, cada rincón de tu día", en: "One tool, every corner of your day", de: "Ein Werkzeug für jeden Moment deines Tages", fr: "Un outil, chaque recoin de ta journée", it: "Uno strumento, ogni angolo della tua giornata" },
    "card.streak.t": { es: "Rachas", en: "Streaks", de: "Serien", fr: "Séries", it: "Serie" },
    "card.streak.p": { es: "El conejo se enciende con tu constancia. No rompas la cadena.", en: "The rabbit lights up with your consistency. Don't break the chain.", de: "Der Hase leuchtet mit deiner Beständigkeit. Brich die Kette nicht.", fr: "Le lapin s'illumine avec ta régularité. Ne romps pas la chaîne.", it: "Il coniglio si accende con la tua costanza. Non spezzare la catena." },
    "card.gym.t":  { es: "Gimnasio", en: "Gym", de: "Fitness", fr: "Salle de sport", it: "Palestra" },
    "card.gym.p":  { es: "Rutinas, series y +600 ejercicios animados en 3D.", en: "Routines, sets and +600 3D-animated exercises.", de: "Routinen, Sätze und +600 in 3D animierte Übungen.", fr: "Routines, séries et +600 exercices animés en 3D.", it: "Schede, serie e +600 esercizi animati in 3D." },
    "card.study.t":{ es: "Estudio", en: "Study", de: "Lernen", fr: "Études", it: "Studio" },
    "card.study.p":{ es: "Sesiones cronometradas y seguimiento de tu foco.", en: "Timed sessions and focus tracking.", de: "Getaktete Sitzungen und Fokus-Tracking.", fr: "Séances chronométrées et suivi de ta concentration.", it: "Sessioni a tempo e monitoraggio della concentrazione." },
    "card.water.t":{ es: "Agua", en: "Water", de: "Wasser", fr: "Eau", it: "Acqua" },
    "card.water.p":{ es: "Recuerda hidratarte y mide tu ingesta diaria.", en: "Remember to hydrate and track your daily intake.", de: "Denk ans Trinken und miss deine tägliche Menge.", fr: "Pense à t'hydrater et mesure ton apport quotidien.", it: "Ricordati di idratarti e misura l'assunzione giornaliera." },
    "card.goals.t":{ es: "Metas", en: "Goals", de: "Ziele", fr: "Objectifs", it: "Obiettivi" },
    "card.goals.p":{ es: "Objetivos a largo plazo con progreso visible.", en: "Long-term goals with visible progress.", de: "Langfristige Ziele mit sichtbarem Fortschritt.", fr: "Objectifs à long terme avec progression visible.", it: "Obiettivi a lungo termine con progresso visibile." },
    "card.cal.t":  { es: "Calendario", en: "Calendar", de: "Kalender", fr: "Calendrier", it: "Calendario" },
    "card.cal.p":  { es: "Toda tu semana de hábitos de un vistazo.", en: "Your whole week of habits at a glance.", de: "Deine ganze Gewohnheitswoche auf einen Blick.", fr: "Toute ta semaine d'habitudes d'un coup d'œil.", it: "Tutta la settimana di abitudini a colpo d'occhio." },
    "card.calm.t": { es: "Calma", en: "Calm", de: "Ruhe", fr: "Calme", it: "Calma" },
    "card.calm.p": { es: "Respiración guiada y hábitos de bienestar mental.", en: "Guided breathing and mental wellness habits.", de: "Geführte Atmung und Gewohnheiten für mentales Wohlbefinden.", fr: "Respiration guidée et habitudes de bien-être mental.", it: "Respirazione guidata e abitudini di benessere mentale." },
    "card.dark.t": { es: "Modo oscuro", en: "Dark mode", de: "Dark Mode", fr: "Mode sombre", it: "Modalità scura" },
    "card.dark.p": { es: "Diseño elegante pensado para descansar la vista.", en: "Elegant design made to rest your eyes.", de: "Elegantes Design, das die Augen schont.", fr: "Design élégant pensé pour reposer les yeux.", it: "Design elegante pensato per riposare gli occhi." },
    "store.soon": { es: "Próximamente", en: "Coming soon", de: "Bald verfügbar", fr: "Bientôt", it: "Presto" },
    "store.on":   { es: "Próximamente en", en: "Coming soon on", de: "Bald bei", fr: "Bientôt sur", it: "Presto su" },

    "faq.eyebrow": { es: "Preguntas frecuentes", en: "FAQ", de: "Häufige Fragen", fr: "Questions fréquentes", it: "Domande frequenti" },
    "faq.title":   { es: "Todo lo que quieres saber de Rhabit", en: "Everything you want to know about Rhabit", de: "Alles, was du über Rhabit wissen willst", fr: "Tout ce que tu veux savoir sur Rhabit", it: "Tutto ciò che vuoi sapere su Rhabit" },
    "faq.q1": { es: "¿Qué es Rhabit?", en: "What is Rhabit?", de: "Was ist Rhabit?", fr: "Qu'est-ce que Rhabit ?", it: "Cos'è Rhabit?" },
    "faq.a1": {
      es: `Rhabit es un calendario que une tus <strong>hábitos</strong>, <strong>entrenos</strong>, <strong>estudio</strong> y <strong>metas</strong>, y los convierte en una racha diaria que te ayuda a mantener la constancia.`,
      en: `Rhabit is a calendar that brings together your <strong>habits</strong>, <strong>workouts</strong>, <strong>study</strong> and <strong>goals</strong>, and turns them into a daily streak that helps you stay consistent.`,
      de: `Rhabit ist ein Kalender, der deine <strong>Gewohnheiten</strong>, <strong>Workouts</strong>, dein <strong>Lernen</strong> und deine <strong>Ziele</strong> vereint und in eine tägliche Serie verwandelt, die dir hilft, beständig zu bleiben.`,
      fr: `Rhabit est un calendrier qui réunit tes <strong>habitudes</strong>, tes <strong>entraînements</strong>, tes <strong>études</strong> et tes <strong>objectifs</strong>, et les transforme en une série quotidienne qui t'aide à rester régulier.`,
      it: `Rhabit è un calendario che riunisce le tue <strong>abitudini</strong>, i tuoi <strong>allenamenti</strong>, lo <strong>studio</strong> e i tuoi <strong>obiettivi</strong>, trasformandoli in una serie quotidiana che ti aiuta a essere costante.`,
    },
    "faq.q2": { es: "¿Cuándo estará disponible?", en: "When will it be available?", de: "Wann ist es verfügbar?", fr: "Quand sera-t-il disponible ?", it: "Quando sarà disponibile?" },
    "faq.a2": {
      es: `Rhabit llegará <strong>próximamente a iOS y Android</strong>. Apúntate a la lista de espera para recibir el aviso de lanzamiento y regalos exclusivos.`,
      en: `Rhabit is coming <strong>soon to iOS and Android</strong>. Join the waitlist to get the launch alert and exclusive gifts.`,
      de: `Rhabit kommt <strong>bald für iOS und Android</strong>. Trag dich in die Warteliste ein, um die Start-Info und exklusive Geschenke zu erhalten.`,
      fr: `Rhabit arrive <strong>bientôt sur iOS et Android</strong>. Inscris-toi à la liste d'attente pour recevoir l'alerte de lancement et des cadeaux exclusifs.`,
      it: `Rhabit arriverà <strong>presto su iOS e Android</strong>. Iscriviti alla lista d'attesa per ricevere l'avviso di lancio e regali esclusivi.`,
    },
    "faq.q3": { es: "¿Cuánto cuesta apuntarse a la lista de espera?", en: "How much does joining the waitlist cost?", de: "Was kostet der Eintrag in die Warteliste?", fr: "Combien coûte l'inscription à la liste d'attente ?", it: "Quanto costa iscriversi alla lista d'attesa?" },
    "faq.a3": {
      es: `Es <strong>gratis</strong>. Solo dejas tu correo o un canal de contacto y te avisamos el día del lanzamiento; los primeros reciben regalos exclusivos.`,
      en: `It's <strong>free</strong>. Just leave your email or a contact channel and we'll notify you on launch day; the first ones get exclusive gifts.`,
      de: `Es ist <strong>kostenlos</strong>. Hinterlass einfach deine E-Mail oder einen Kontaktkanal und wir benachrichtigen dich am Starttag; die Ersten erhalten exklusive Geschenke.`,
      fr: `C'est <strong>gratuit</strong>. Laisse juste ton e-mail ou un canal de contact et nous te préviendrons le jour du lancement ; les premiers reçoivent des cadeaux exclusifs.`,
      it: `È <strong>gratis</strong>. Lascia solo la tua email o un canale di contatto e ti avviseremo il giorno del lancio; i primi ricevono regali esclusivi.`,
    },
    "faq.q4": { es: "¿Para qué sirve Rhabit?", en: "What is Rhabit for?", de: "Wofür ist Rhabit gut?", fr: "À quoi sert Rhabit ?", it: "A cosa serve Rhabit?" },
    "faq.a4": {
      es: `Rhabit es una <strong>app de calendario, hábitos y disciplina</strong>: reúne tus hábitos diarios, entrenos de gimnasio, sesiones de estudio y metas en un mismo calendario y los convierte en una racha para mantener la constancia.`,
      en: `Rhabit is a <strong>calendar, habits and discipline app</strong>: it brings your daily habits, gym workouts, study sessions and goals together in one calendar and turns them into a streak to stay consistent.`,
      de: `Rhabit ist eine <strong>Kalender-, Gewohnheits- und Disziplin-App</strong>: Sie vereint deine täglichen Gewohnheiten, Gym-Workouts, Lernsessions und Ziele in einem Kalender und verwandelt sie in eine Serie für mehr Beständigkeit.`,
      fr: `Rhabit est une <strong>app de calendrier, d'habitudes et de discipline</strong> : elle réunit tes habitudes quotidiennes, tes entraînements, tes sessions d'étude et tes objectifs dans un seul calendrier et les transforme en une série pour rester régulier.`,
      it: `Rhabit è un'<strong>app di calendario, abitudini e disciplina</strong>: riunisce le tue abitudini quotidiane, gli allenamenti, le sessioni di studio e gli obiettivi in un unico calendario e li trasforma in una serie per restare costante.`,
    },
    "faq.q5": { es: "¿En qué plataformas estará disponible Rhabit?", en: "What platforms will Rhabit be available on?", de: "Auf welchen Plattformen wird Rhabit verfügbar sein?", fr: "Sur quelles plateformes Rhabit sera-t-il disponible ?", it: "Su quali piattaforme sarà disponibile Rhabit?" },
    "faq.a5": {
      es: `Rhabit llegará <strong>a iOS (iPhone) y Android</strong> próximamente. Apúntate a la lista de espera para recibir el aviso el día del lanzamiento.`,
      en: `Rhabit is coming <strong>to iOS (iPhone) and Android</strong> soon. Join the waitlist to get notified on launch day.`,
      de: `Rhabit kommt bald <strong>für iOS (iPhone) und Android</strong>. Trag dich in die Warteliste ein, um zum Start benachrichtigt zu werden.`,
      fr: `Rhabit arrive bientôt <strong>sur iOS (iPhone) et Android</strong>. Inscris-toi à la liste d'attente pour être prévenu le jour du lancement.`,
      it: `Rhabit arriverà presto <strong>su iOS (iPhone) e Android</strong>. Iscriviti alla lista d'attesa per ricevere l'avviso il giorno del lancio.`,
    },
    "faq.q6": { es: "¿Rhabit es una app de hábitos o de calendario?", en: "Is Rhabit a habits app or a calendar app?", de: "Ist Rhabit eine Gewohnheits- oder eine Kalender-App?", fr: "Rhabit est-il une app d'habitudes ou de calendrier ?", it: "Rhabit è un'app di abitudini o di calendario?" },
    "faq.a6": {
      es: `Es <strong>las dos cosas</strong>. Rhabit combina un calendario visual con un seguimiento de hábitos y rachas, y añade gimnasio, estudio y metas, para que gestiones toda tu disciplina desde una sola app.`,
      en: `It's <strong>both</strong>. Rhabit combines a visual calendar with habit and streak tracking, and adds gym, study and goals, so you manage all your discipline from a single app.`,
      de: `<strong>Beides</strong>. Rhabit verbindet einen visuellen Kalender mit Gewohnheits- und Serien-Tracking und ergänzt Gym, Lernen und Ziele – so verwaltest du deine ganze Disziplin in einer App.`,
      fr: `<strong>Les deux</strong>. Rhabit combine un calendrier visuel avec le suivi des habitudes et des séries, et ajoute salle de sport, étude et objectifs, pour gérer toute ta discipline depuis une seule app.`,
      it: `<strong>Entrambe</strong>. Rhabit unisce un calendario visivo al monitoraggio di abitudini e serie, e aggiunge palestra, studio e obiettivi, così gestisci tutta la tua disciplina da un'unica app.`,
    },
    "faq.q7": { es: "¿Rhabit sirve para entrenar en el gimnasio?", en: "Can I use Rhabit for the gym?", de: "Kann ich Rhabit fürs Gym nutzen?", fr: "Puis-je utiliser Rhabit pour la salle de sport ?", it: "Posso usare Rhabit per la palestra?" },
    "faq.a7": {
      es: `Sí. Incluye un módulo de gimnasio con <strong>+600 ejercicios animados en 3D</strong>, registro de series, repeticiones y peso, y un mapa de los músculos trabajados en cada entrenamiento.`,
      en: `Yes. It includes a gym module with <strong>600+ 3D-animated exercises</strong>, logging of sets, reps and weight, and a map of the muscles worked in each session.`,
      de: `Ja. Es enthält ein Gym-Modul mit <strong>über 600 in 3D animierten Übungen</strong>, Erfassung von Sätzen, Wiederholungen und Gewicht sowie einer Karte der trainierten Muskeln pro Einheit.`,
      fr: `Oui. Il inclut un module salle de sport avec <strong>plus de 600 exercices animés en 3D</strong>, l'enregistrement des séries, répétitions et poids, et une carte des muscles travaillés à chaque séance.`,
      it: `Sì. Include un modulo palestra con <strong>oltre 600 esercizi animati in 3D</strong>, registrazione di serie, ripetizioni e peso, e una mappa dei muscoli allenati in ogni sessione.`,
    },

    "cta.title": {
      es: `Sé de los primeros en <span class="grad">Rhabit</span>`,
      en: `Be one of the first on <span class="grad">Rhabit</span>`,
      de: `Sei einer der Ersten bei <span class="grad">Rhabit</span>`,
      fr: `Sois parmi les premiers sur <span class="grad">Rhabit</span>`,
      it: `Sii tra i primi su <span class="grad">Rhabit</span>`,
    },
    "cta.p": {
      es: `Apúntate y te avisamos al lanzamiento — con <strong>regalos exclusivos</strong>.`,
      en: `Join and we'll notify you at launch — with <strong>exclusive gifts</strong>.`,
      de: `Melde dich an und wir benachrichtigen dich zum Start — mit <strong>exklusiven Geschenken</strong>.`,
      fr: `Inscris-toi et nous te préviendrons au lancement — avec des <strong>cadeaux exclusifs</strong>.`,
      it: `Iscriviti e ti avviseremo al lancio — con <strong>regali esclusivi</strong>.`,
    },
    "cta.btn": { es: "Quiero mi plaza", en: "I want my spot", de: "Ich will meinen Platz", fr: "Je veux ma place", it: "Voglio il mio posto" },

    "footer.tagline": { es: "No avanzas de un salto. Avanzas cada salto.", en: "You don't move forward in one jump. You move forward with every jump.", de: "Du kommst nicht mit einem Sprung voran. Du kommst mit jedem Sprung voran.", fr: "Tu n'avances pas d'un seul saut. Tu avances à chaque saut.", it: "Non avanzi con un solo salto. Avanzi a ogni salto." },
    "footer.copyTail": {
      es: "Rhabit · Próximamente en iOS y Android",
      en: "Rhabit · Coming soon to iOS and Android",
      de: "Rhabit · Bald für iOS und Android",
      fr: "Rhabit · Bientôt sur iOS et Android",
      it: "Rhabit · Presto su iOS e Android",
    },

    "form.invalid": { es: "Hmm, ese correo no parece válido. Revísalo.", en: "Hmm, that email doesn't look valid. Check it.", de: "Hmm, diese E-Mail sieht ungültig aus. Bitte prüfen.", fr: "Hmm, cet e-mail ne semble pas valide. Vérifie-le.", it: "Hmm, questa email non sembra valida. Controllala." },

    "nav.support": { es: "Apóyanos", en: "Support us", de: "Unterstützen", fr: "Soutenir", it: "Sostienici" },
    "donate.eyebrow": { es: "Apoya el proyecto", en: "Support the project", de: "Unterstütze das Projekt", fr: "Soutiens le projet", it: "Sostieni il progetto" },
    "donate.title": { es: "Ayúdanos a construir Rhabit", en: "Help us build Rhabit", de: "Hilf uns, Rhabit zu bauen", fr: "Aide-nous à construire Rhabit", it: "Aiutaci a costruire Rhabit" },
    "donate.intro1": {
      es: "Rhabit lo hace un equipo pequeño e independiente, sin inversores. Tus donaciones pagan los servidores, las animaciones 3D y el desarrollo para que la app siga creciendo y sea gratis para todos.",
      en: "Rhabit is made by a small, independent team with no investors. Your donations pay for servers, 3D animations and development so the app keeps growing and stays free for everyone.",
      de: "Rhabit wird von einem kleinen, unabhängigen Team ohne Investoren gemacht. Deine Spenden zahlen Server, 3D-Animationen und Entwicklung, damit die App wächst und für alle kostenlos bleibt.",
      fr: "Rhabit est créé par une petite équipe indépendante, sans investisseurs. Tes dons paient les serveurs, les animations 3D et le développement pour que l'app continue de grandir et reste gratuite pour tous.",
      it: "Rhabit è creato da un piccolo team indipendente, senza investitori. Le tue donazioni pagano i server, le animazioni 3D e lo sviluppo, così l'app continua a crescere e resta gratis per tutti.",
    },
    "donate.raisedLabel": { es: "recaudado", en: "raised", de: "gesammelt", fr: "récolté", it: "raccolti" },
    "donate.goalInfo": {
      es: "<b>{pct}%</b> del objetivo de <b>{goal}</b>", en: "<b>{pct}%</b> of the <b>{goal}</b> goal",
      de: "<b>{pct}%</b> des Ziels von <b>{goal}</b>", fr: "<b>{pct}%</b> de l'objectif de <b>{goal}</b>",
      it: "<b>{pct}%</b> dell'obiettivo di <b>{goal}</b>",
    },
    "donate.btn": { es: "Donar con Ko-fi", en: "Donate with Ko-fi", de: "Mit Ko-fi spenden", fr: "Faire un don avec Ko-fi", it: "Dona con Ko-fi" },
    "donate.methods": {
      es: "Tarjeta, Apple Pay, Google Pay y PayPal — a través de Ko-fi. Sin cuenta ni registro.",
      en: "Card, Apple Pay, Google Pay and PayPal — via Ko-fi. No account needed.",
      de: "Karte, Apple Pay, Google Pay und PayPal — über Ko-fi. Kein Konto nötig.",
      fr: "Carte, Apple Pay, Google Pay et PayPal — via Ko-fi. Sans compte.",
      it: "Carta, Apple Pay, Google Pay e PayPal — tramite Ko-fi. Nessun account.",
    },
    "donate.milestonesTitle": { es: "Objetivos que desbloqueáis", en: "Goals you unlock", de: "Ziele, die ihr freischaltet", fr: "Objectifs que vous débloquez", it: "Obiettivi che sbloccate" },
    "donate.whoTitle": { es: "Quiénes somos", en: "Who we are", de: "Wer wir sind", fr: "Qui sommes-nous", it: "Chi siamo" },
    "donate.who": {
      es: "Somos un equipo pequeño harto de aplicaciones creadas con el único objetivo de hacer dinero: apps que ni sus propios desarrolladores han probado y que, una vez instaladas, quedan olvidadas entre las que nunca abres. Construimos Rhabit en abierto, escuchando a la comunidad, con la idea de una app honesta, sin anuncios invasivos ni venta de datos. Nosotros mismos la usamos a diario y la vamos puliendo según lo que echamos en falta al utilizarla, para garantizar que tú también quieras abrirla cada día.",
      en: "We're a small team fed up with apps built for the sole purpose of making money — apps that not even their own developers have tried, and that, once installed, get lost among the ones you never open. We build Rhabit in the open, listening to the community, with the idea of an honest app: no invasive ads, no data selling. We use it ourselves every day and keep refining it based on what we miss while using it, so you'll want to open it every day too.",
      de: "Wir sind ein kleines Team, das genug hat von Apps, die nur zum Geldverdienen entwickelt werden – Apps, die nicht einmal ihre eigenen Entwickler ausprobiert haben und die nach der Installation zwischen all den Apps verschwinden, die du nie öffnest. Wir entwickeln Rhabit offen, hören auf die Community und wollen eine ehrliche App: keine aufdringliche Werbung, kein Datenverkauf. Wir nutzen sie selbst jeden Tag und verbessern sie ständig anhand dessen, was uns beim Benutzen fehlt – damit auch du sie jeden Tag öffnen willst.",
      fr: "Nous sommes une petite équipe lassée des applis créées dans le seul but de gagner de l'argent — des applis que même leurs développeurs n'ont pas testées et qui, une fois installées, se perdent parmi celles que tu n'ouvres jamais. Nous développons Rhabit de façon ouverte, à l'écoute de la communauté, avec l'idée d'une app honnête : sans pubs invasives ni vente de données. Nous l'utilisons nous-mêmes chaque jour et l'améliorons au fil du temps selon ce qui nous manque, pour que toi aussi tu aies envie de l'ouvrir tous les jours.",
      it: "Siamo un piccolo team stanco delle app create con il solo scopo di fare soldi — app che nemmeno i loro sviluppatori hanno provato e che, una volta installate, si perdono tra quelle che non apri mai. Sviluppiamo Rhabit in modo aperto, ascoltando la community, con l'idea di un'app onesta: senza pubblicità invasive né vendita di dati. La usiamo noi stessi ogni giorno e la miglioriamo nel tempo in base a ciò che ci manca usandola, così che anche tu voglia aprirla ogni giorno.",
    },
    "donate.intro2": {
      es: `Cualquier aportación, por pequeña que sea, marca la diferencia y acelera las próximas funciones. Visita nuestro perfil de <a class="donate__link" href="https://ko-fi.com/rhabit" target="_blank" rel="noopener">Ko-fi</a> para dejar un comentario, una propuesta o una donación. ¡Gracias por creer en el conejo! 🐇`,
      en: `Any contribution, however small, makes a difference and speeds up the next features. Visit our <a class="donate__link" href="https://ko-fi.com/rhabit" target="_blank" rel="noopener">Ko-fi</a> page to leave a comment, a suggestion or a donation. Thanks for believing in the rabbit! 🐇`,
      de: `Jeder Beitrag, egal wie klein, macht einen Unterschied und beschleunigt die nächsten Funktionen. Besuch unser <a class="donate__link" href="https://ko-fi.com/rhabit" target="_blank" rel="noopener">Ko-fi</a>-Profil, um einen Kommentar, einen Vorschlag oder eine Spende zu hinterlassen. Danke, dass du an den Hasen glaubst! 🐇`,
      fr: `Chaque contribution, même petite, fait la différence et accélère les prochaines fonctionnalités. Visite notre profil <a class="donate__link" href="https://ko-fi.com/rhabit" target="_blank" rel="noopener">Ko-fi</a> pour laisser un commentaire, une suggestion ou un don. Merci de croire au lapin ! 🐇`,
      it: `Ogni contributo, anche piccolo, fa la differenza e accelera le prossime funzioni. Visita il nostro profilo <a class="donate__link" href="https://ko-fi.com/rhabit" target="_blank" rel="noopener">Ko-fi</a> per lasciare un commento, una proposta o una donazione. Grazie per aver creduto nel coniglio! 🐇`,
    },
    "donate.m1.t": { es: "Más ejercicios animados", en: "More animated exercises", de: "Mehr animierte Übungen", fr: "Plus d'exercices animés", it: "Più esercizi animati" },
    "donate.m1.d": { es: "Añadimos un nuevo lote de ejercicios con animaciones en 3D.", en: "We add a new batch of exercises with 3D animations.", de: "Wir fügen neue Übungen mit 3D-Animationen hinzu.", fr: "On ajoute un nouveau lot d'exercices avec animations 3D.", it: "Aggiungiamo nuovi esercizi con animazioni 3D." },
    "donate.m2.t": { es: "Servidores un año", en: "Servers for a year", de: "Server für ein Jahr", fr: "Serveurs pour un an", it: "Server per un anno" },
    "donate.m2.d": { es: "Cubrimos el alojamiento y la base de datos durante 12 meses.", en: "We cover hosting and the database for 12 months.", de: "Wir decken Hosting und Datenbank für 12 Monate.", fr: "On couvre l'hébergement et la base de données pendant 12 mois.", it: "Copriamo hosting e database per 12 mesi." },
    "donate.m3.t": { es: "Widgets y recordatorios", en: "Widgets and reminders", de: "Widgets und Erinnerungen", fr: "Widgets et rappels", it: "Widget e promemoria" },
    "donate.m3.d": { es: "Widgets de inicio y notificaciones inteligentes para no fallar tu racha.", en: "Home-screen widgets and smart notifications so you never miss your streak.", de: "Homescreen-Widgets und smarte Benachrichtigungen, damit du deine Serie nie verpasst.", fr: "Widgets d'accueil et notifications intelligentes pour ne jamais rater ta série.", it: "Widget in home e notifiche intelligenti per non perdere la serie." },
    "donate.m4.t": { es: "Versión web de Rhabit", en: "Rhabit web version", de: "Web-Version von Rhabit", fr: "Version web de Rhabit", it: "Versione web di Rhabit" },
    "donate.m4.d": { es: "Llevamos Rhabit al navegador para usarlo desde cualquier dispositivo.", en: "We bring Rhabit to the browser to use it from any device.", de: "Wir bringen Rhabit in den Browser für jedes Gerät.", fr: "On amène Rhabit dans le navigateur pour l'utiliser depuis n'importe quel appareil.", it: "Portiamo Rhabit nel browser per usarlo da qualsiasi dispositivo." },
    "donate.m5.t": { es: "Red social, perfil público…", en: "Social network, public profile…", de: "Soziales Netzwerk, öffentliches Profil…", fr: "Réseau social, profil public…", it: "Rete sociale, profilo pubblico…" },
    "donate.m5.d": { es: "Perfil público, comunidad y retos compartidos dentro de Rhabit.", en: "Public profile, community and shared challenges inside Rhabit.", de: "Öffentliches Profil, Community und geteilte Challenges in Rhabit.", fr: "Profil public, communauté et défis partagés dans Rhabit.", it: "Profilo pubblico, community e sfide condivise dentro Rhabit." },
    "donate.m6.t": { es: "Sincronización con otros calendarios y herramientas", en: "Sync with other calendars and tools", de: "Sync mit anderen Kalendern und Tools", fr: "Synchronisation avec d'autres calendriers et outils", it: "Sincronizzazione con altri calendari e strumenti" },
    "donate.m6.d": { es: "Conecta Rhabit con Google Calendar, Apple y otras apps.", en: "Connect Rhabit with Google Calendar, Apple and other apps.", de: "Verbinde Rhabit mit Google Kalender, Apple und anderen Apps.", fr: "Connecte Rhabit à Google Agenda, Apple et d'autres apps.", it: "Collega Rhabit a Google Calendar, Apple e altre app." },

    "aria.close":     { es: "Cerrar", en: "Close", de: "Schließen", fr: "Fermer", it: "Chiudi" },
    "aria.fail":      { es: "No hecho", en: "Not done", de: "Nicht erledigt", fr: "Non fait", it: "Non fatto" },
    "aria.done":      { es: "Hecho", en: "Done", de: "Erledigt", fr: "Fait", it: "Fatto" },
    "aria.later":     { es: "Más tarde", en: "Later", de: "Später", fr: "Plus tard", it: "Più tardi" },
    "aria.prevMonth": { es: "Mes anterior", en: "Previous month", de: "Voriger Monat", fr: "Mois précédent", it: "Mese precedente" },
    "aria.nextMonth": { es: "Mes siguiente", en: "Next month", de: "Nächster Monat", fr: "Mois suivant", it: "Mese successivo" },
    "aria.viewMuscles": { es: "Ver músculos trabajados", en: "View muscles worked", de: "Trainierte Muskeln ansehen", fr: "Voir les muscles travaillés", it: "Vedi i muscoli allenati" },
    "aria.exDetail":  { es: "Detalle del ejercicio", en: "Exercise detail", de: "Übungsdetails", fr: "Détail de l'exercice", it: "Dettaglio esercizio" },
    "aria.lang":      { es: "Idioma", en: "Language", de: "Sprache", fr: "Langue", it: "Lingua" },
  };

  // ── Frases dinámicas del mockup: español -> otros idiomas ─────
  const DYN = {
    // Meses
    "Enero": { en: "January", de: "Januar", fr: "Janvier", it: "Gennaio" },
    "Febrero": { en: "February", de: "Februar", fr: "Février", it: "Febbraio" },
    "Marzo": { en: "March", de: "März", fr: "Mars", it: "Marzo" },
    "Abril": { en: "April", de: "April", fr: "Avril", it: "Aprile" },
    "Mayo": { en: "May", de: "Mai", fr: "Mai", it: "Maggio" },
    "Junio": { en: "June", de: "Juni", fr: "Juin", it: "Giugno" },
    "Julio": { en: "July", de: "Juli", fr: "Juillet", it: "Luglio" },
    "Agosto": { en: "August", de: "August", fr: "Août", it: "Agosto" },
    "Septiembre": { en: "September", de: "September", fr: "Septembre", it: "Settembre" },
    "Octubre": { en: "October", de: "Oktober", fr: "Octobre", it: "Ottobre" },
    "Noviembre": { en: "November", de: "November", fr: "Novembre", it: "Novembre" },
    "Diciembre": { en: "December", de: "Dezember", fr: "Décembre", it: "Dicembre" },
    // Días
    "Domingo": { en: "Sunday", de: "Sonntag", fr: "Dimanche", it: "Domenica" },
    "Lunes": { en: "Monday", de: "Montag", fr: "Lundi", it: "Lunedì" },
    "Martes": { en: "Tuesday", de: "Dienstag", fr: "Mardi", it: "Martedì" },
    "Miércoles": { en: "Wednesday", de: "Mittwoch", fr: "Mercredi", it: "Mercoledì" },
    "Jueves": { en: "Thursday", de: "Donnerstag", fr: "Jeudi", it: "Giovedì" },
    "Viernes": { en: "Friday", de: "Freitag", fr: "Vendredi", it: "Venerdì" },
    "Sábado": { en: "Saturday", de: "Samstag", fr: "Samedi", it: "Sabato" },
    // Nombres de actividad
    "Correr": { en: "Run", de: "Laufen", fr: "Courir", it: "Correre" },
    "Meditar": { en: "Meditate", de: "Meditieren", fr: "Méditer", it: "Meditare" },
    "Leer": { en: "Read", de: "Lesen", fr: "Lire", it: "Leggere" },
    "Gimnasio": { en: "Gym", de: "Fitness", fr: "Salle de sport", it: "Palestra" },
    "Comer sano": { en: "Eat healthy", de: "Gesund essen", fr: "Manger sain", it: "Mangiare sano" },
    "Beber agua": { en: "Drink water", de: "Wasser trinken", fr: "Boire de l'eau", it: "Bere acqua" },
    "Estudiar": { en: "Study", de: "Lernen", fr: "Étudier", it: "Studiare" },
    "Senderismo": { en: "Hiking", de: "Wandern", fr: "Randonnée", it: "Escursione" },
    "Emprendimiento": { en: "Entrepreneurship", de: "Unternehmertum", fr: "Entrepreneuriat", it: "Imprenditoria" },
    "Skin care": { en: "Skin care", de: "Hautpflege", fr: "Soin de la peau", it: "Cura della pelle" },
    // Subtítulos de actividad
    "Parque · 5 km": { en: "Park · 5 km", de: "Park · 5 km", fr: "Parc · 5 km", it: "Parco · 5 km" },
    "10 min": { en: "10 min", de: "10 Min.", fr: "10 min", it: "10 min" },
    "Novela": { en: "Novel", de: "Roman", fr: "Roman", it: "Romanzo" },
    "Pecho y tríceps": { en: "Chest & triceps", de: "Brust & Trizeps", fr: "Pectoraux & triceps", it: "Petto & tricipiti" },
    "Verduras": { en: "Vegetables", de: "Gemüse", fr: "Légumes", it: "Verdure" },
    "1,5 L": { en: "1.5 L", de: "1,5 L", fr: "1,5 L", it: "1,5 L" },
    "Inglés": { en: "English", de: "Englisch", fr: "Anglais", it: "Inglese" },
    "Mañana": { en: "Morning", de: "Morgens", fr: "Matin", it: "Mattina" },
    "Recordatorio": { en: "Reminder", de: "Erinnerung", fr: "Rappel", it: "Promemoria" },
    "Pierna": { en: "Legs", de: "Beine", fr: "Jambes", it: "Gambe" },
    "Ensalada": { en: "Salad", de: "Salat", fr: "Salade", it: "Insalata" },
    "20 páginas": { en: "20 pages", de: "20 Seiten", fr: "20 pages", it: "20 pagine" },
    "3 km": { en: "3 km", de: "3 km", fr: "3 km", it: "3 km" },
    "2 L": { en: "2 L", de: "2 L", fr: "2 L", it: "2 L" },
    "Curso online": { en: "Online course", de: "Online-Kurs", fr: "Cours en ligne", it: "Corso online" },
    "Espalda y bíceps": { en: "Back & biceps", de: "Rücken & Bizeps", fr: "Dos & biceps", it: "Schiena & bicipiti" },
    "Respiración": { en: "Breathing", de: "Atmung", fr: "Respiration", it: "Respirazione" },
    "Cena ligera": { en: "Light dinner", de: "Leichtes Abendessen", fr: "Dîner léger", it: "Cena leggera" },
    "Montaña": { en: "Mountain", de: "Berg", fr: "Montagne", it: "Montagna" },
    "Hidratación": { en: "Hydration", de: "Hydration", fr: "Hydratation", it: "Idratazione" },
    "Ensayo": { en: "Essay", de: "Essay", fr: "Essai", it: "Saggio" },
    "Meta: 12 entrenos": { en: "Goal: 12 workouts", de: "Ziel: 12 Workouts", fr: "Objectif : 12 entraînements", it: "Obiettivo: 12 allenamenti" },
    "Objetivo del mes": { en: "Month's goal", de: "Monatsziel", fr: "Objectif du mois", it: "Obiettivo del mese" },
    "Reto 10 km": { en: "10 km challenge", de: "10-km-Challenge", fr: "Défi 10 km", it: "Sfida 10 km" },
    "Carrera popular": { en: "Fun run", de: "Volkslauf", fr: "Course populaire", it: "Corsa popolare" },
    // Prompts del swipe
    "¿Ya lo completaste?": { en: "Did you complete it?", de: "Schon erledigt?", fr: "Tu l'as déjà fait ?", it: "L'hai già completato?" },
    "¿Cómo fue hoy?": { en: "How did it go today?", de: "Wie war es heute?", fr: "Comment ça s'est passé aujourd'hui ?", it: "Com'è andata oggi?" },
    "¿Lo sacaste adelante?": { en: "Did you get it done?", de: "Hast du es geschafft?", fr: "Tu l'as accompli ?", it: "Ce l'hai fatta?" },
    "¿Lo hiciste hoy?": { en: "Did you do it today?", de: "Hast du es heute gemacht?", fr: "Tu l'as fait aujourd'hui ?", it: "L'hai fatto oggi?" },
    "¿Lo has cumplido hoy?": { en: "Did you keep it today?", de: "Hast du es heute eingehalten?", fr: "Tu l'as tenu aujourd'hui ?", it: "L'hai rispettato oggi?" },
    // Ejercicios del gym
    "Curl de bíceps": { en: "Biceps curl", de: "Bizeps-Curl", fr: "Curl biceps", it: "Curl bicipiti" },
    "Press de banca": { en: "Bench press", de: "Bankdrücken", fr: "Développé couché", it: "Panca piana" },
    "Remo con polea": { en: "Cable row", de: "Kabelrudern", fr: "Rowing à la poulie", it: "Rematore ai cavi" },
    "Elevaciones laterales": { en: "Lateral raises", de: "Seitheben", fr: "Élévations latérales", it: "Alzate laterali" },
    // Músculos (nombre mostrado)
    "bíceps": { en: "biceps", de: "Bizeps", fr: "biceps", it: "bicipiti" },
    "tríceps": { en: "triceps", de: "Trizeps", fr: "triceps", it: "tricipiti" },
    "antebrazos": { en: "forearms", de: "Unterarme", fr: "avant-bras", it: "avambracci" },
    "pecho": { en: "chest", de: "Brust", fr: "pectoraux", it: "petto" },
    "hombros": { en: "shoulders", de: "Schultern", fr: "épaules", it: "spalle" },
    "espalda alta": { en: "upper back", de: "oberer Rücken", fr: "haut du dos", it: "schiena alta" },
    "trapecio": { en: "trapezius", de: "Trapez", fr: "trapèze", it: "trapezio" },
    // Placeholders de canales
    "Tu número, ej. +34 600 00 00 00": { en: "Your number, e.g. +49 170 0000000", de: "Deine Nummer, z. B. +49 170 0000000", fr: "Ton numéro, ex. +33 6 00 00 00 00", it: "Il tuo numero, es. +39 320 0000000" },
    "Tu usuario, ej. @tu_usuario": { en: "Your handle, e.g. @your_user", de: "Dein Name, z. B. @dein_name", fr: "Ton identifiant, ex. @ton_user", it: "Il tuo utente, es. @tuo_utente" },
    "Tu perfil o usuario": { en: "Your profile or username", de: "Dein Profil oder Nutzername", fr: "Ton profil ou identifiant", it: "Il tuo profilo o utente" },
  };

  function t(key, vars) {
    const entry = DICT[key];
    let s = entry ? (entry[LANG] || entry.es) : key;
    if (vars) for (const k in vars) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    return s;
  }
  function tx(str) {
    if (LANG === "es" || str == null) return str;
    const e = DYN[str];
    return e ? (e[LANG] || str) : str;
  }

  // ── Aplica las cadenas estáticas al DOM ──────────────────────
  function applyStatic() {
    document.documentElement.lang = LANG;
    document.title = t(document.documentElement.dataset.titleKey || "meta.title");
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

  function initSelector() {
    const wrap = document.getElementById("lang");
    const btn  = document.getElementById("lang-btn");
    const menu = document.getElementById("lang-menu");
    const cur  = document.getElementById("lang-cur");
    if (!wrap || !btn || !menu || !cur) return;

    const CODES = { es: "ES", en: "EN", de: "DE", fr: "FR", it: "IT" };
    cur.textContent = CODES[LANG] || "ES";
    btn.setAttribute("aria-label", t("aria.lang"));

    menu.querySelectorAll(".lang__opt").forEach(opt => {
      opt.setAttribute("aria-selected", opt.dataset.lang === LANG ? "true" : "false");
      opt.addEventListener("click", () => {
        const next = opt.dataset.lang;
        if (URL_DRIVEN) {
          if (next !== LANG) location.href = LANG_URL[next] || "/";
        } else {
          localStorage.setItem("rhabit_lang", next);
          location.reload();
        }
      });
    });

    const close = () => { menu.hidden = true; wrap.setAttribute("aria-open", "false"); btn.setAttribute("aria-expanded", "false"); };
    const open  = () => { menu.hidden = false; wrap.setAttribute("aria-open", "true"); btn.setAttribute("aria-expanded", "true"); };
    btn.addEventListener("click", e => { e.stopPropagation(); menu.hidden ? open() : close(); });
    document.addEventListener("click", e => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  window.I18N = { LANG, t, tx };
  window.t = t;
  window.tx = tx;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { applyStatic(); initSelector(); });
  } else {
    applyStatic(); initSelector();
  }
})();
