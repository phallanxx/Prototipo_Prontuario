
    (function () {
      "use strict";
      const LEGACY_STORAGE_KEY = "entre-consultas-demo-entries-v1";
      const STORAGE_KEY = "entre-consultas-self-entries-v2";
      const DAY = 86400000;
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const isoDay = function (n) {
        const d = new Date(today.getTime() - n * DAY);
        return d.toISOString().slice(0, 10);
      };
      const selfPatient = { id: "p001", name: "Meu acompanhamento", initials: "EU", summary: "Diário pessoal · seus registros" };
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (error) { /* storage may be unavailable */ }
      let entries = loadEntries();
      let selectedPatientId = "p001";
      let patientRange = 90;
      let doctorRange = 90;
      let typingStartedAt = null;
      let currentTypingResult = null;
      let typingTimer = null;

      function isValidDate(value) {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(value + "T00:00:00Z");
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
      }
      function boundedText(value, maxLength) {
        return typeof value === "string" ? value.slice(0, maxLength) : "";
      }
      function boundedList(value) {
        if (!Array.isArray(value)) return [];
        return value.slice(0, 12).map(function (item) { return boundedText(item, 80); }).filter(Boolean);
      }
      function normalizeEntry(entry) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry) || entry.demo || entry.patientId !== "p001") return null;
        if (!isValidDate(entry.date) || entry.date > isoDay(0) || !Number.isInteger(Number(entry.rating)) || Number(entry.rating) < 1 || Number(entry.rating) > 5) return null;
        const tags = boundedList(entry.tags);
        const symptoms = boundedList(entry.symptoms);
        const createdAt = boundedText(entry.createdAt, 40);
        const validCreatedAt = createdAt && Number.isFinite(Date.parse(createdAt)) ? createdAt : "";
        const onset = isValidDate(entry.symptomOnset) && entry.symptomOnset <= entry.date ? entry.symptomOnset : "";
        const severity = entry.symptomSeverity === "" || entry.symptomSeverity == null ? "" : Number(entry.symptomSeverity);
        const seconds = entry.typingSeconds == null || entry.typingSeconds === "" ? null : Number(entry.typingSeconds);
        const accuracy = entry.typingAccuracy == null || entry.typingAccuracy === "" ? null : Number(entry.typingAccuracy);
        const durations = ["", "Menos de um dia", "1 a 3 dias", "Mais de 3 dias", "Ainda persiste"];
        const impacts = ["", "Não afetou", "Leve", "Moderado", "Grande"];
        return {
          id: boundedText(entry.id, 80) || "registro-" + entry.date,
          patientId: "p001",
          date: entry.date,
          createdAt: validCreatedAt,
          rating: Number(entry.rating),
          tags: tags,
          symptoms: symptoms.length ? symptoms : tags,
          dailyDomains: boundedList(entry.dailyDomains),
          changeType: ["none", "known", "new"].includes(entry.changeType) ? entry.changeType : (entry.different ? "known" : "none"),
          symptomOnset: onset,
          symptomDuration: durations.includes(entry.symptomDuration) ? entry.symptomDuration : "",
          symptomSeverity: Number.isInteger(severity) && severity >= 0 && severity <= 10 ? severity : "",
          activityImpact: impacts.includes(entry.activityImpact) ? entry.activityImpact : "",
          typingSeconds: Number.isFinite(seconds) && seconds > 0 && seconds <= 3600 ? seconds : null,
          typingAccuracy: Number.isInteger(accuracy) && accuracy >= 0 && accuracy <= 100 ? accuracy : null,
          note: boundedText(entry.note, 500),
          different: entry.different === true || entry.changeType === "known" || entry.changeType === "new",
          demo: false
        };
      }
      function loadEntries() {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && stored.length > 2500000) return [];
          const saved = JSON.parse(stored);
          if (Array.isArray(saved)) {
            const normalized = saved.slice(-1000).map(normalizeEntry).filter(Boolean);
            return normalized;
          }
        } catch (error) { /* use demo records if browser storage is unavailable */ }
        return [];
      }
      function persistEntries() {
        try {
          const ownEntries = entries.filter(function (entry) { return !entry.demo; }).slice(-1000).map(normalizeEntry).filter(Boolean);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ownEntries));
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
      function makeTextElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        element.textContent = text;
        return element;
      }
      function entryNode(entry, doctor) {
        const symptoms = entry.symptoms && entry.symptoms.length ? entry.symptoms : (entry.tags || []);
        const categories = entryCategories(entry);
        const details = [];
        if (entry.note) details.push(entry.note);
        if (entry.symptomSeverity !== "" && entry.symptomSeverity != null) details.push("Intensidade percebida: " + entry.symptomSeverity + "/10.");
        if (entry.activityImpact) details.push("Impacto na rotina: " + entry.activityImpact.toLowerCase() + ".");
        if (entry.symptomOnset) details.push("Início informado: " + formatDate(entry.symptomOnset) + (entry.symptomDuration ? "; duração: " + entry.symptomDuration.toLowerCase() : "") + ".");
        const detail = details.length ? details.join(" ") : (symptoms.length ? "Relato sobre " + symptoms.join(", ").toLowerCase() + "." : "Sem observação escrita.");
        const taskDetail = Number(entry.typingSeconds) > 0 ? "Digitação: " + Number(entry.typingSeconds).toFixed(1) + " s, " + Number(entry.typingAccuracy || 0) + "% de correspondência." : "";
        const status = entry.changeType === "new" ? "sintoma novo" : entry.changeType === "known" || entry.different ? "sintoma conhecido alterado" : "sem mudança marcada";
        const time = formatEntryTime(entry);
        const row = document.createElement("div");
        row.className = "entry-row";
        row.appendChild(makeTextElement("div", "entry-dot", String(entry.rating)));
        const main = document.createElement("div");
        main.className = "entry-main";
        const heading = doctor
          ? formatDate(entry.date, { day: "2-digit", month: "short" }).replace(".", "") + (time ? " · " + time : "") + " · " + status
          : (categories.length ? categories.join(" · ") : "Sem sintoma marcado");
        main.appendChild(makeTextElement("strong", "", heading));
        main.appendChild(makeTextElement("p", "", [detail, taskDetail].filter(Boolean).join(" ")));
        row.appendChild(main);
        if (!doctor) row.appendChild(makeTextElement("div", "entry-date", labelDate(entry.date) + (time ? " · " + time : "")));
        return row;
      }
      function renderEntries(container, list, doctor, emptyMessage) {
        const fragment = document.createDocumentFragment();
        if (list.length) list.forEach(function (entry) { fragment.appendChild(entryNode(entry, doctor)); });
        else fragment.appendChild(makeTextElement("div", "empty-state", emptyMessage));
        container.replaceChildren(fragment);
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
        renderEntries(document.getElementById("patientRecent"), recent, false, "Seus registros vão aparecer aqui.");
      }
      function renderPatientList() {
        const container = document.getElementById("patientList");
        const fragment = document.createDocumentFragment();
        const hasEntries = entries.some(function (entry) { return entry.patientId === selfPatient.id; });
        document.getElementById("patientCount").textContent = hasEntries ? "1" : "0";
        if (hasEntries) {
          const patient = selfPatient;
          const items = getPatientEntries(patient.id, 180);
          const last = items.length ? items[items.length - 1] : null;
          const status = last ? (dateDistance(last.date) === 0 ? "registro hoje" : "último: " + labelDate(last.date)) : "sem registros";
          const button = document.createElement("button");
          button.type = "button";
          button.className = "patient-item" + (patient.id === selectedPatientId ? " active" : "");
          button.setAttribute("aria-pressed", String(patient.id === selectedPatientId));
          button.appendChild(makeTextElement("span", "avatar", patient.initials));
          const meta = document.createElement("span");
          meta.className = "patient-meta";
          meta.appendChild(makeTextElement("strong", "", patient.name));
          meta.appendChild(makeTextElement("span", "", status));
          button.appendChild(meta);
          button.appendChild(makeTextElement("span", "patient-chevron", "›"));
          button.addEventListener("click", function () { selectedPatientId = patient.id; renderAll(); });
          fragment.appendChild(button);
        } else {
          fragment.appendChild(makeTextElement("div", "empty-state", "Seu acompanhamento aparecerá aqui após o primeiro registro."));
        }
        container.replaceChildren(fragment);
      }
      function renderDoctor() {
        const patient = selfPatient;
        const hasEntries = entries.some(function (entry) { return entry.patientId === patient.id; });
        const data = hasEntries ? getPatientEntries(patient.id, doctorRange) : [];
        const sorted = data.slice().sort(function (a, b) { return entrySortTime(a) - entrySortTime(b); });
        const latest = sorted[sorted.length - 1];
        document.getElementById("doctorName").textContent = hasEntries ? patient.name : "Nenhum paciente";
        document.getElementById("doctorAvatar").textContent = hasEntries ? patient.initials : "—";
        document.getElementById("doctorSubtitle").textContent = hasEntries ? patient.summary : "Comece pelo diário para gerar sua própria análise.";
        document.getElementById("summaryButton").disabled = !hasEntries;
        document.getElementById("clearDataButton").disabled = !hasEntries;
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
        const recent = data.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
        renderEntries(document.getElementById("doctorTimeline"), recent, true, "Ainda não há registros neste período.");
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
        const patient = selfPatient;
        const data = getPatientEntries(patient.id, doctorRange).slice().sort(function (a, b) { return entrySortTime(a) - entrySortTime(b); });
        if (!data.length) { showToast("Faça seu primeiro registro diário para gerar uma análise."); return; }
        const different = data.filter(function (e) { return e.changeType === "new" || e.changeType === "known" || e.different; });
        const last = data[data.length - 1];
        const lastCategories = last ? entryCategories(last) : [];
        const typing = data.filter(function (e) { return Number(e.typingSeconds) > 0; });
        const period = doctorRange === 180 ? "últimos 6 meses" : "últimos " + doctorRange + " dias";
        const text = [
          patient.name + " — síntese do período",
          "Período: " + period + ".",
          "Registros no período: " + data.length + ".",
          "Registros com mudança nova ou conhecida assinalada: " + different.length + ".",
          last ? "Relato mais recente (" + formatLongDate(last.date) + (formatEntryTime(last) ? " às " + formatEntryTime(last) : "") + "): percepção pessoal " + describeRating(last.rating) + "; mudança: " + (last.changeType === "new" ? "sintoma novo" : last.changeType === "known" || last.different ? "sintoma conhecido alterado" : "nenhuma marcada") + (lastCategories.length ? "; sintomas/áreas: " + lastCategories.join(", ") : "") + (last.symptomOnset ? "; início informado: " + formatLongDate(last.symptomOnset) : "") + (last.symptomDuration ? "; duração: " + last.symptomDuration : "") + (last.symptomSeverity !== "" && last.symptomSeverity != null ? "; intensidade percebida: " + last.symptomSeverity + "/10" : "") + (last.activityImpact ? "; impacto na rotina: " + last.activityImpact : "") + (last.note ? ". Observação: " + last.note : ".") : "Ainda não há registros.",
          typing.length ? "Tarefa experimental de digitação: " + typing.length + " tentativa(s); última em " + formatLongDate(typing[typing.length - 1].date) + ", " + Number(typing[typing.length - 1].typingSeconds).toFixed(1) + " s e " + Number(typing[typing.length - 1].typingAccuracy || 0) + "% de correspondência." : "Tarefa experimental de digitação: sem tentativas no período.",
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
      document.getElementById("clearDataButton").addEventListener("click", function () {
        if (!window.confirm("Apagar todos os registros deste acompanhamento neste navegador?")) return;
        entries = [];
        try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no local storage */ }
        renderAll();
        showToast("Seu acompanhamento foi zerado neste navegador.");
      });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeSummary(); });
      renderAll();
    }());
  

