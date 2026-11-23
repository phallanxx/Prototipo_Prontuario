
    (function () {
      "use strict";
      const STORAGE_KEY = "entre-consultas-demo-entries-v1";
      const DAY = 86400000;
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const isoDay = function (n) {
        const d = new Date(today.getTime() - n * DAY);
        return d.toISOString().slice(0, 10);
      };
      const demoPatients = [
        { id: "p001", name: "Paciente 001", initials: "P1", summary: "Acompanhamento demonstrativo · esclerose múltipla" },
        { id: "p002", name: "Paciente 002", initials: "P2", summary: "Acompanhamento demonstrativo · dados fictícios" },
        { id: "p003", name: "Paciente 003", initials: "P3", summary: "Acompanhamento demonstrativo · dados fictícios" }
      ];
      const baseEntries = [
        { patientId: "p001", days: 88, rating: 4, tags: ["Energia"], symptoms: [], changeType: "none", note: "Semana tranquila; mantive a rotina.", different: false, typingSeconds: 34, typingAccuracy: 93 },
        { patientId: "p001", days: 79, rating: 3, tags: ["Mobilidade"], symptoms: ["Fraqueza / paresia / tremor"], changeType: "known", note: "Caminhei mais devagar no fim do dia.", different: true },
        { patientId: "p001", days: 70, rating: 4, tags: ["Energia"], symptoms: [], changeType: "none", note: "Disposição parecida com a semana passada.", different: false },
        { patientId: "p001", days: 61, rating: 3, tags: ["Equilíbrio"], symptoms: ["Coordenação / equilíbrio / ataxia"], changeType: "known", note: "Percebi um pouco mais de insegurança ao caminhar.", different: true },
        { patientId: "p001", days: 51, rating: 4, tags: ["Mobilidade"], note: "Dia dentro do habitual.", different: false },
        { patientId: "p001", days: 42, rating: 3, tags: ["Energia"], symptoms: ["Formigamento / sensibilidade"], changeType: "new", note: "Cansaço maior no fim da tarde e formigamento por algumas horas.", different: true, typingSeconds: 31, typingAccuracy: 95 },
        { patientId: "p001", days: 34, rating: 3, tags: ["Mobilidade", "Equilíbrio"], note: "Subir escadas exigiu mais esforço.", different: true },
        { patientId: "p001", days: 25, rating: 4, tags: [], note: "Sem observações específicas.", different: false },
        { patientId: "p001", days: 17, rating: 3, tags: ["Energia"], note: "Precisei descansar depois da caminhada.", different: true },
        { patientId: "p001", days: 9, rating: 3, tags: ["Mobilidade"], symptoms: ["Visão / neurite óptica / visão dupla"], changeType: "known", note: "Mais dificuldade para manter o ritmo habitual.", different: true, typingSeconds: 37, typingAccuracy: 90 },
        { patientId: "p001", days: 2, rating: 4, tags: ["Energia"], symptoms: [], changeType: "none", note: "Hoje me senti como de costume.", different: false },
        { patientId: "p002", days: 82, rating: 3, tags: ["Energia"], note: "Cansaço ao final do dia.", different: false },
        { patientId: "p002", days: 65, rating: 4, tags: [], note: "Dia dentro do habitual.", different: false },
        { patientId: "p002", days: 49, rating: 3, tags: ["Visão / sensibilidade"], symptoms: ["Visão / neurite óptica / visão dupla"], changeType: "new", note: "Registrei uma sensação diferente por algumas horas.", different: true, typingSeconds: 29, typingAccuracy: 96 },
        { patientId: "p002", days: 32, rating: 3, tags: ["Energia"], note: "Precisava de pausas mais frequentes.", different: true },
        { patientId: "p002", days: 16, rating: 4, tags: [], note: "Sem observações específicas.", different: false },
        { patientId: "p002", days: 4, rating: 3, tags: ["Equilíbrio"], note: "Mais cuidado ao caminhar em terreno irregular.", different: true },
        { patientId: "p003", days: 76, rating: 4, tags: [], note: "Dia dentro do habitual.", different: false },
        { patientId: "p003", days: 60, rating: 4, tags: ["Energia"], note: "Mantive minhas atividades habituais.", different: false },
        { patientId: "p003", days: 44, rating: 3, tags: ["Mobilidade"], symptoms: ["Fraqueza / paresia / tremor"], changeType: "known", note: "Uma caminhada pareceu mais cansativa.", different: true, typingSeconds: 32, typingAccuracy: 92 },
        { patientId: "p003", days: 28, rating: 3, tags: ["Energia"], note: "Mais pausas durante o dia.", different: true },
        { patientId: "p003", days: 12, rating: 4, tags: [], note: "Sem observações específicas.", different: false },
        { patientId: "p003", days: 1, rating: 4, tags: [], note: "Como de costume.", different: false }
      ].map(function (item, index) {
        const date = isoDay(item.days);
        return { id: "demo-" + index, patientId: item.patientId, date: date, createdAt: new Date(date + "T12:00:00").toISOString(), rating: item.rating, tags: item.tags, symptoms: item.symptoms || [], changeType: item.changeType || (item.different ? "known" : "none"), symptomOnset: item.symptomOnset || "", symptomDuration: item.symptomDuration || "", symptomSeverity: "", activityImpact: "", typingSeconds: item.typingSeconds || null, typingAccuracy: item.typingAccuracy || null, note: item.note, different: item.different, demo: true };
      });
      let entries = loadEntries();
      let selectedPatientId = "p001";
      let patientRange = 90;
      let doctorRange = 90;
      let typingStartedAt = null;
      let currentTypingResult = null;
      let typingTimer = null;
      const clinicalProfiles = {
        p001: { demographics: "34 · município demo", ageOnset: "29 (demo)", firstSymptom: "Alteração visual (demo)", firstRelapse: "Registro demo", diagnosisDelay: "8 meses (demo)", initialPhenotype: "EMRR", phenotype: "EMRR", edss: "1,5 (demo)", progression: "Acompanhamento demo", hospitalizations: "1 (demo)", comorbidities: "Não informado (demo)", treatment: "Registro demo", infusionReaction: "Sem registro demo" },
        p002: { demographics: "41 · município demo", ageOnset: "33 (demo)", firstSymptom: "Formigamento (demo)", firstRelapse: "Registro demo", diagnosisDelay: "14 meses (demo)", initialPhenotype: "EMRR", phenotype: "EMSP", edss: "3,0 (demo)", progression: "Registro demo", hospitalizations: "2 (demo)", comorbidities: "Não informado (demo)", treatment: "Registro demo", infusionReaction: "Registro demo" },
        p003: { demographics: "28 · município demo", ageOnset: "26 (demo)", firstSymptom: "Fraqueza (demo)", firstRelapse: "Registro demo", diagnosisDelay: "6 meses (demo)", initialPhenotype: "EMRR", phenotype: "EMRR", edss: "0,0 (demo)", progression: "Sem marcação demo", hospitalizations: "0 (demo)", comorbidities: "Não informado (demo)", treatment: "Registro demo", infusionReaction: "Sem registro demo" }
      };

      function loadEntries() {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
          if (Array.isArray(saved)) return baseEntries.concat(saved.filter(function (e) { return !e.demo; }).map(function (entry) {
            return Object.assign({ createdAt: "", symptoms: entry.tags || [], dailyDomains: [], changeType: entry.different ? "known" : "none", symptomSeverity: "", activityImpact: "" }, entry);
          }));
        } catch (error) { /* use demo records if browser storage is unavailable */ }
        return baseEntries.slice();
      }
      function persistEntries() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.filter(function (e) { return !e.demo; })));
          return true;
        } catch (error) {
          return false;
        }
      }
      function formatDate(value, options) {
        const d = new Date(value + "T12:00:00");
        return new Intl.DateTimeFormat("pt-BR", options || { day: "2-digit", month: "short" }).format(d).replace(".", "");
      }
      function formatLongDate(value) {
        return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value + "T12:00:00"));
      }
      function dateDistance(dateString) {
        const date = new Date(dateString + "T12:00:00");
        return Math.max(0, Math.round((today.getTime() - date.getTime()) / DAY));
      }
      function labelDate(dateString) {
        const days = dateDistance(dateString);
        if (days === 0) return "hoje";
        if (days === 1) return "ontem";
        return formatDate(dateString);
      }
      function getPatientEntries(patientId, range) {
        return entries.filter(function (e) { return e.patientId === patientId && dateDistance(e.date) <= range; }).sort(function (a, b) { return entrySortTime(a) - entrySortTime(b); });
      }
      function entrySortTime(entry) {
        const value = entry.createdAt || entry.date + "T12:00:00";
        const time = new Date(value).getTime();
        return Number.isFinite(time) ? time : 0;
      }
      function entryCategories(entry) {
        const symptoms = entry.symptoms && entry.symptoms.length ? entry.symptoms : (entry.tags || []);
        return symptoms.concat(entry.dailyDomains || []);
      }
      function formatEntryTime(entry) {
        if (!entry.createdAt) return "";
        return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(entry.createdAt));
      }
      function describeRating(rating) {
        return ["", "muito abaixo do habitual", "um pouco abaixo do habitual", "como de costume", "um pouco melhor que o habitual", "muito melhor que o habitual"][Number(rating)] || "sem relato";
      }
      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
      }
      function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
      }
      function drawChart(svg, data, range, width, height) {
        const left = 42, right = width - 14, top = 20, bottom = height - 28;
        const chartHeight = bottom - top;
        const grid = [];
        for (let i = 1; i <= 5; i++) {
          const y = bottom - ((i - 1) / 4) * chartHeight;
          grid.push('<line class="chart-grid" x1="' + left + '" y1="' + y + '" x2="' + right + '" y2="' + y + '"></line>');
          grid.push('<text class="chart-label" x="5" y="' + (y + 3) + '">' + i + '</text>');
        }
        if (!data.length) {
          svg.innerHTML = '<defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#80b49a" stop-opacity=".22"/><stop offset="1" stop-color="#80b49a" stop-opacity="0"/></linearGradient></defs>' + grid.join("") + '<text class="chart-empty" x="' + (width / 2) + '" y="' + (height / 2) + '" text-anchor="middle">Ainda não há registros neste período</text>';
          return;
        }
        const now = today.getTime();
        const daily = new Map();
        data.forEach(function (entry) {
          const day = daily.get(entry.date) || { date: entry.date, total: 0, count: 0 };
          day.total += Number(entry.rating);
          day.count += 1;
          daily.set(entry.date, day);
        });
        const points = Array.from(daily.values()).map(function (day) {
          const age = Math.max(0, Math.min(range, Math.round((now - new Date(day.date + "T12:00:00").getTime()) / DAY)));
          day.rating = day.total / day.count;
          const average = day.rating;
          return { x: right - (age / range) * (right - left), y: bottom - ((average - 1) / 4) * chartHeight, e: day };
        }).sort(function (a, b) { return a.x - b.x; });
        let path = "";
        points.forEach(function (p, index) { path += (index ? " L " : "M ") + p.x.toFixed(1) + " " + p.y.toFixed(1); });
        const area = path + " L " + points[points.length - 1].x.toFixed(1) + " " + bottom + " L " + points[0].x.toFixed(1) + " " + bottom + " Z";
        const circles = points.map(function (p) {
          const title = formatLongDate(p.e.date) + " · média dos relatos do dia: " + p.e.rating.toFixed(1) + "/5 (" + p.e.count + (p.e.count === 1 ? " registro)" : " registros)");
          return '<circle class="chart-point" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4"><title>' + escapeHtml(title) + '</title></circle>';
        }).join("");
        const leftLabel = range === 30 ? "30 dias atrás" : range === 90 ? "90 dias atrás" : "6 meses atrás";
        const rightLabel = "hoje";
        svg.innerHTML = '<defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#80b49a" stop-opacity=".25"/><stop offset="1" stop-color="#80b49a" stop-opacity=".015"/></linearGradient></defs>' + grid.join("") + '<path class="chart-area" d="' + area + '"></path><path class="chart-line" d="' + path + '"></path>' + circles + '<text class="chart-label" x="' + left + '" y="' + (height - 5) + '">' + leftLabel + '</text><text class="chart-label" x="' + right + '" y="' + (height - 5) + '" text-anchor="end">' + rightLabel + '</text>';
      }
      function drawTypingChart(svg, data, width, height) {
        const tasks = data.filter(function (entry) { return Number(entry.typingSeconds) > 0; }).slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
        const left = 48, right = width - 14, top = 18, bottom = height - 28;
        if (!tasks.length) {
          svg.innerHTML = '<text class="chart-empty" x="' + (width / 2) + '" y="' + (height / 2) + '" text-anchor="middle">Ainda não há tentativas registradas</text>';
          return;
        }
        const times = tasks.map(function (entry) { return Number(entry.typingSeconds); });
        let min = Math.max(0, Math.floor((Math.min.apply(null, times) - 5) / 5) * 5);
        let max = Math.ceil((Math.max.apply(null, times) + 5) / 5) * 5;
        if (max - min < 10) max = min + 10;
        const plotHeight = bottom - top;
        const grid = [];
        for (let i = 0; i < 3; i++) {
          const y = top + (plotHeight / 2) * i;
          const value = max - ((max - min) / 2) * i;
          grid.push('<line class="typing-chart-grid" x1="' + left + '" y1="' + y + '" x2="' + right + '" y2="' + y + '"></line>');
          grid.push('<text class="chart-label" x="4" y="' + (y + 3) + '">' + Math.round(value) + 's</text>');
        }
        const points = tasks.map(function (entry, index) {
          const x = tasks.length === 1 ? (left + right) / 2 : left + ((right - left) * index / (tasks.length - 1));
          const y = bottom - ((Number(entry.typingSeconds) - min) / (max - min)) * plotHeight;
          return { x: x, y: y, entry: entry };
        });
        let path = "";
        points.forEach(function (point, index) { path += (index ? " L " : "M ") + point.x.toFixed(1) + " " + point.y.toFixed(1); });
        const marks = points.map(function (point) {
          const label = formatLongDate(point.entry.date) + " · " + Number(point.entry.typingSeconds).toFixed(1) + " s · " + Number(point.entry.typingAccuracy || 0) + "%";
          return '<circle class="typing-chart-point" cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="4"><title>' + escapeHtml(label) + '</title></circle>';
        }).join("");
        const first = formatDate(tasks[0].date, { month: "short", year: "2-digit" }).replace(".", "");
        const last = formatDate(tasks[tasks.length - 1].date, { month: "short", year: "2-digit" }).replace(".", "");
        svg.innerHTML = grid.join("") + '<path class="typing-chart-line" d="' + path + '"></path>' + marks + '<text class="chart-label" x="' + left + '" y="' + (height - 5) + '">' + first + '</text><text class="chart-label" x="' + right + '" y="' + (height - 5) + '" text-anchor="end">' + last + '</text>';
      }
      function entryHtml(entry, doctor) {
        const symptoms = entry.symptoms && entry.symptoms.length ? entry.symptoms : (entry.tags || []);
        const categories = entryCategories(entry);
        const details = [];
        if (entry.note) details.push(escapeHtml(entry.note));
        if (entry.symptomSeverity !== "" && entry.symptomSeverity != null) details.push("Intensidade percebida: " + escapeHtml(entry.symptomSeverity) + "/10.");
        if (entry.activityImpact) details.push("Impacto na rotina: " + escapeHtml(entry.activityImpact.toLowerCase()) + ".");
        if (entry.symptomOnset) details.push("Início informado: " + escapeHtml(formatDate(entry.symptomOnset)) + (entry.symptomDuration ? "; duração: " + escapeHtml(entry.symptomDuration.toLowerCase()) : "") + ".");
        const detail = details.length ? details.join(" ") : (symptoms.length ? "Relato sobre " + escapeHtml(symptoms.join(", ").toLowerCase()) + "." : "Sem observação escrita.");
        const taskDetail = Number(entry.typingSeconds) > 0 ? " · Digitação: " + Number(entry.typingSeconds).toFixed(1) + " s, " + Number(entry.typingAccuracy || 0) + "% de correspondência" : "";
        const status = entry.changeType === "new" ? "sintoma novo" : entry.changeType === "known" || entry.different ? "sintoma conhecido alterado" : "sem mudança marcada";
        const meta = categories.length ? escapeHtml(categories.join(" · ")) : "Sem sintoma marcado";
        const time = formatEntryTime(entry);
        const patientView = '<div class="entry-row"><div class="entry-dot">' + Number(entry.rating) + '</div><div class="entry-main"><strong>' + meta + '</strong><p>' + detail + escapeHtml(taskDetail) + '</p></div><div class="entry-date">' + labelDate(entry.date) + (time ? ' · ' + time : '') + '</div></div>';
        const doctorView = '<div class="entry-row"><div class="entry-dot">' + Number(entry.rating) + '</div><div class="entry-main"><strong>' + formatDate(entry.date, { day: "2-digit", month: "short" }).replace(".", "") + (time ? ' · ' + time : '') + ' · ' + status + '</strong><p>' + detail + escapeHtml(taskDetail) + '</p></div></div>';
        return doctor ? doctorView : patientView;
      }
      function renderPatient() {
        const list = getPatientEntries("p001", patientRange).slice().reverse();
        document.getElementById("patientEntryCount").textContent = String(list.length);
        drawChart(document.getElementById("patientChart"), list, patientRange, 520, 205);
        drawTypingChart(document.getElementById("patientTypingChart"), list, 520, 145);
        const typing = list.filter(function (entry) { return Number(entry.typingSeconds) > 0; });
        const lastTyping = typing[0];
        document.getElementById("typingPatientLatest").textContent = lastTyping ? Number(lastTyping.typingSeconds).toFixed(1) + " s · " + Number(lastTyping.typingAccuracy || 0) + "%" : "sem teste";
        const recent = getPatientEntries("p001", 180).slice().reverse().slice(0, 3);
        document.getElementById("patientRecent").innerHTML = recent.length ? recent.map(function (e) { return entryHtml(e, false); }).join("") : '<div class="empty-state">Seus registros vão aparecer aqui.</div>';
      }
      function renderPatientList() {
        const container = document.getElementById("patientList");
        container.innerHTML = demoPatients.map(function (patient) {
          const items = getPatientEntries(patient.id, 180);
          const last = items.length ? items[items.length - 1] : null;
          const status = last ? (dateDistance(last.date) === 0 ? "registro hoje" : "último: " + labelDate(last.date)) : "sem registros";
          return '<button class="patient-item ' + (patient.id === selectedPatientId ? "active" : "") + '" data-patient="' + patient.id + '" aria-pressed="' + (patient.id === selectedPatientId) + '"><span class="avatar">' + patient.initials + '</span><span class="patient-meta"><strong>' + patient.name + '</strong><span>' + status + '</span></span><span class="patient-chevron">›</span></button>';
        }).join("");
        container.querySelectorAll("[data-patient]").forEach(function (button) {
          button.addEventListener("click", function () { selectedPatientId = button.getAttribute("data-patient"); renderAll(); });
        });
      }
      function renderDoctor() {
        const patient = demoPatients.find(function (p) { return p.id === selectedPatientId; }) || demoPatients[0];
        const data = getPatientEntries(patient.id, doctorRange);
        const sorted = data.slice().sort(function (a, b) { return entrySortTime(a) - entrySortTime(b); });
        const latest = sorted[sorted.length - 1];
        document.getElementById("doctorName").textContent = patient.name;
        document.getElementById("doctorAvatar").textContent = patient.initials;
        document.getElementById("doctorSubtitle").textContent = patient.summary;
        document.getElementById("statRecords").textContent = String(data.length);
        document.getElementById("statRange").textContent = doctorRange === 180 ? "últimos 6 meses" : "últimos " + doctorRange + " dias";
        document.getElementById("statDifferent").textContent = String(data.filter(function (e) { return e.changeType === "new" || e.changeType === "known" || e.different; }).length);
        document.getElementById("statLast").textContent = latest ? labelDate(latest.date) : "—";
        document.getElementById("statLastNote").textContent = latest ? (latest.changeType === "new" ? "sintoma novo relatado" : latest.changeType === "known" || latest.different ? "sintoma alterado relatado" : describeRating(latest.rating)) : "sem registro";
        document.getElementById("timelineCount").textContent = String(data.length);
        drawChart(document.getElementById("doctorChart"), data, doctorRange, 600, 225);
        drawTypingChart(document.getElementById("doctorTypingChart"), data, 520, 145);
        const typing = data.filter(function (entry) { return Number(entry.typingSeconds) > 0; });
        const lastTyping = typing[typing.length - 1];
        document.getElementById("doctorTypingLatest").textContent = lastTyping ? Number(lastTyping.typingSeconds).toFixed(1) + " s · " + Number(lastTyping.typingAccuracy || 0) + "%" : "sem teste";
        const clinical = clinicalProfiles[patient.id];
        document.getElementById("clinicalPhenotype").textContent = clinical.phenotype;
        document.getElementById("clinicalEdss").textContent = clinical.edss;
        document.getElementById("clinicalProgression").textContent = clinical.progression;
        document.getElementById("clinicalTreatment").textContent = clinical.treatment;
        document.getElementById("clinicalDemographics").textContent = clinical.demographics;
        document.getElementById("clinicalAgeOnset").textContent = clinical.ageOnset;
        document.getElementById("clinicalFirstSymptom").textContent = clinical.firstSymptom;
        document.getElementById("clinicalFirstRelapse").textContent = clinical.firstRelapse;
        document.getElementById("clinicalDiagnosisDelay").textContent = clinical.diagnosisDelay;
        document.getElementById("clinicalInitialPhenotype").textContent = clinical.initialPhenotype;
        document.getElementById("clinicalHospitalizations").textContent = clinical.hospitalizations;
        document.getElementById("clinicalComorbidities").textContent = clinical.comorbidities;
        document.getElementById("clinicalInfusionReaction").textContent = clinical.infusionReaction;
        const recent = data.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
        document.getElementById("doctorTimeline").innerHTML = recent.length ? recent.map(function (e) { return entryHtml(e, true); }).join("") : '<div class="empty-state">Ainda não há registros neste período.</div>';
        renderPatientList();
      }
      function renderAll() { renderPatient(); renderDoctor(); }
      function setRole(role) {
        const isPatient = role === "patient";
        document.getElementById("patientView").classList.toggle("active", isPatient);
        document.getElementById("doctorView").classList.toggle("active", !isPatient);
        document.getElementById("patientIntro").hidden = !isPatient;
        document.getElementById("doctorIntro").hidden = isPatient;
        document.getElementById("patientTab").setAttribute("aria-pressed", String(isPatient));
        document.getElementById("doctorTab").setAttribute("aria-pressed", String(!isPatient));
        if (!isPatient) renderDoctor();
      }
      function setRange(buttons, property, value, render) {
        buttons.forEach(function (button) {
          const active = Number(button.dataset.range || button.dataset.doctorRange) === Number(value);
          button.setAttribute("aria-pressed", String(active));
        });
        if (property === "patientRange") patientRange = Number(value);
        else doctorRange = Number(value);
        render();
      }
      function downloadPatientBackup() {
        const saved = getPatientEntries("p001", 36500).filter(function (entry) { return !entry.demo; });
        if (!saved.length) { showToast("Ainda não há registros próprios para exportar."); return; }
        const backup = { app: "Entre Consultas", formatVersion: 1, exportedAt: new Date().toISOString(), records: saved };
        const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "entre-consultas-registros-" + isoDay(0) + ".json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showToast("Cópia baixada. O arquivo contém relatos pessoais; guarde-o em local privado.");
      }
      function prepareSummary() {
        const patient = demoPatients.find(function (p) { return p.id === selectedPatientId; }) || demoPatients[0];
        const data = getPatientEntries(patient.id, doctorRange).slice().sort(function (a, b) { return entrySortTime(a) - entrySortTime(b); });
        const different = data.filter(function (e) { return e.changeType === "new" || e.changeType === "known" || e.different; });
        const last = data[data.length - 1];
        const lastCategories = last ? entryCategories(last) : [];
        const typing = data.filter(function (e) { return Number(e.typingSeconds) > 0; });
        const clinical = clinicalProfiles[patient.id];
        const period = doctorRange === 180 ? "últimos 6 meses" : "últimos " + doctorRange + " dias";
        const text = [
          patient.name + " — síntese demonstrativa",
          "Período: " + period + ".",
          "Registros no período: " + data.length + ".",
          "Registros com mudança nova ou conhecida assinalada: " + different.length + ".",
          last ? "Relato mais recente (" + formatLongDate(last.date) + (formatEntryTime(last) ? " às " + formatEntryTime(last) : "") + "): percepção pessoal " + describeRating(last.rating) + "; mudança: " + (last.changeType === "new" ? "sintoma novo" : last.changeType === "known" || last.different ? "sintoma conhecido alterado" : "nenhuma marcada") + (lastCategories.length ? "; sintomas/áreas: " + lastCategories.join(", ") : "") + (last.symptomOnset ? "; início informado: " + formatLongDate(last.symptomOnset) : "") + (last.symptomDuration ? "; duração: " + last.symptomDuration : "") + (last.symptomSeverity !== "" && last.symptomSeverity != null ? "; intensidade percebida: " + last.symptomSeverity + "/10" : "") + (last.activityImpact ? "; impacto na rotina: " + last.activityImpact : "") + (last.note ? ". Observação: " + last.note : ".") : "Ainda não há registros.",
          typing.length ? "Tarefa experimental de digitação: " + typing.length + " tentativa(s); última em " + formatLongDate(typing[typing.length - 1].date) + ", " + Number(typing[typing.length - 1].typingSeconds).toFixed(1) + " s e " + Number(typing[typing.length - 1].typingAccuracy || 0) + "% de correspondência." : "Tarefa experimental de digitação: sem tentativas no período.",
          "Contexto clínico demonstrativo registrado pela equipe: fenótipo " + clinical.phenotype + "; EDSS " + clinical.edss + "; progressão: " + clinical.progression + "; terapia: " + clinical.treatment + ".",
          "Histórico ilustrativo: idade/município " + clinical.demographics + "; idade no primeiro sintoma " + clinical.ageOnset + "; manifestação inicial " + clinical.firstSymptom + "; primeiro surto " + clinical.firstRelapse + "; tempo até diagnóstico " + clinical.diagnosisDelay + "; fenótipo inicial " + clinical.initialPhenotype + "; internações " + clinical.hospitalizations + "; comorbidades " + clinical.comorbidities + "; reação à infusão " + clinical.infusionReaction + ".",
          "",
          "Esta síntese organiza autorrelatos e medidas exploratórias para apoiar a conversa na consulta. O estudo de referência é descritivo; a tarefa de digitação não é validada. Nada aqui confirma surto, progressão, diagnóstico ou tratamento."
        ].join("\n");
        document.getElementById("summaryText").textContent = text;
        document.getElementById("summaryModal").classList.add("open");
      }
      function closeSummary() { document.getElementById("summaryModal").classList.remove("open"); }

      document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(today);
      document.getElementById("symptomOnset").value = isoDay(0);
      document.getElementById("patientTab").addEventListener("click", function () { setRole("patient"); });
      document.getElementById("doctorTab").addEventListener("click", function () { setRole("doctor"); });
      document.getElementById("exportPatientData").addEventListener("click", downloadPatientBackup);
      document.querySelectorAll("[data-range]").forEach(function (button) {
        button.addEventListener("click", function () { setRange(Array.from(document.querySelectorAll("[data-range]")), "patientRange", button.dataset.range, renderPatient); });
      });
      document.querySelectorAll("[data-doctor-range]").forEach(function (button) {
        button.addEventListener("click", function () { setRange(Array.from(document.querySelectorAll("[data-doctor-range]")), "doctorRange", button.dataset.doctorRange, renderDoctor); });
      });
      document.getElementById("typingStart").addEventListener("click", function () {
        currentTypingResult = null;
        typingStartedAt = performance.now();
        document.getElementById("typingIdle").hidden = true;
        document.getElementById("typingActive").hidden = false;
        document.getElementById("typingInput").value = "";
        document.getElementById("typingResult").textContent = "Tentativa em andamento…";
        const updateClock = function () {
          const seconds = (performance.now() - typingStartedAt) / 1000;
          document.getElementById("typingClock").textContent = seconds.toFixed(1) + " s";
        };
        updateClock();
        typingTimer = setInterval(updateClock, 100);
        document.getElementById("typingInput").focus();
      });
      document.getElementById("typingFinish").addEventListener("click", function () {
        const typed = document.getElementById("typingInput").value;
        if (!typed.trim()) { showToast("Digite a frase antes de concluir a tentativa."); return; }
        if (typingTimer) clearInterval(typingTimer);
        typingTimer = null;
        const elapsed = Math.max(.1, (performance.now() - typingStartedAt) / 1000);
        const phrase = document.getElementById("typingPhrase").textContent;
        const matched = Array.from(typed).reduce(function (count, char, index) { return count + (char === phrase[index] ? 1 : 0); }, 0);
        const accuracy = Math.round(100 * matched / Math.max(typed.length, phrase.length));
        currentTypingResult = { typingSeconds: Number(elapsed.toFixed(1)), typingAccuracy: accuracy };
        document.getElementById("typingActive").hidden = true;
        document.getElementById("typingIdle").hidden = false;
        document.getElementById("typingStart").textContent = "Refazer tentativa";
        document.getElementById("typingResult").textContent = "Tentativa pronta para salvar: " + elapsed.toFixed(1) + " s · " + accuracy + "% de correspondência. Salve o registro diário para guardar o resultado.";
        typingStartedAt = null;
      });
      document.getElementById("checkinForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        if (!ratingInput) { showToast("Escolha uma opção para registrar como você se sentiu."); return; }
        const symptoms = Array.from(document.querySelectorAll(".symptom-option input:checked")).map(function (input) { return input.value; });
        const dailyDomains = Array.from(document.querySelectorAll(".domain-option input:checked")).map(function (input) { return input.value; });
        const changeType = document.getElementById("changeType").value;
        const savedTyping = Boolean(currentTypingResult);
        const entry = {
          id: "entry-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8), patientId: "p001", date: isoDay(0), createdAt: new Date().toISOString(), rating: Number(ratingInput.value),
          tags: symptoms, symptoms: symptoms, dailyDomains: dailyDomains, changeType: changeType, different: changeType !== "none",
          symptomOnset: symptoms.length ? document.getElementById("symptomOnset").value : "",
          symptomDuration: symptoms.length ? document.getElementById("symptomDuration").value : "",
          symptomSeverity: document.getElementById("symptomSeverity").value,
          activityImpact: document.getElementById("activityImpact").value,
          typingSeconds: currentTypingResult ? currentTypingResult.typingSeconds : null,
          typingAccuracy: currentTypingResult ? currentTypingResult.typingAccuracy : null,
          note: document.getElementById("noteInput").value.trim(), demo: false
        };
        entries.push(entry);
        const savedLocally = persistEntries();
        renderAll();
        document.getElementById("checkinForm").reset();
        currentTypingResult = null;
        document.getElementById("typingStart").textContent = "Iniciar tarefa";
        document.getElementById("typingResult").textContent = savedTyping ? "Resultado de digitação salvo junto com o registro do dia." : "Registro diário salvo; a tarefa experimental é opcional.";
        document.getElementById("symptomOnset").value = isoDay(0);
        showToast(savedLocally ? "Registro salvo neste navegador. Ele permanece após fechar e reabrir aqui; os dados são fictícios." : "O navegador não permitiu salvar o registro. Tente novamente ou confira as permissões de armazenamento.");
      });
      document.getElementById("summaryButton").addEventListener("click", prepareSummary);
      document.getElementById("closeModal").addEventListener("click", closeSummary);
      document.getElementById("doneSummary").addEventListener("click", closeSummary);
      document.getElementById("summaryModal").addEventListener("click", function (event) { if (event.target.id === "summaryModal") closeSummary(); });
      document.getElementById("copySummary").addEventListener("click", async function () {
        const text = document.getElementById("summaryText").textContent;
        try {
          await navigator.clipboard.writeText(text);
          showToast("Resumo copiado.");
        } catch (error) {
          const area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
          showToast("Resumo copiado.");
        }
      });
      document.getElementById("resetDemoButton").addEventListener("click", function () {
        if (!window.confirm("Restaurar a demonstração? Isso apaga os registros próprios salvos neste navegador.")) return;
        entries = baseEntries.slice();
        try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no local storage */ }
        renderAll();
        showToast("Demonstração restaurada.");
      });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeSummary(); });
      renderAll();
    }());
  

