/**

 * Apps Script Web App complet pour la plateforme FLE.

 *

 * Gère :

 * - upload des enregistrements

 * - suppression Drive

 * - notifications d'annulation

 * - création des réunions Zoom

 * - rappel environ 24h avant

 * - confirmation du cours

 * - annulation depuis l'e-mail

 * - demande de déplacement depuis l'e-mail (et depuis l'app)

 */

/* ============================================================================

   CONFIGURATION

   ============================================================================ */

const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const TEACHER_UID = "pTbdNp5EiJe2jq80bgCi4Q01i4O2";

function getProperty_(name, fallback) {
  const value = SCRIPT_PROPERTIES.getProperty(name);
  return value == null || value === "" ? (fallback == null ? "" : fallback) : value;
}

function requireProperty_(name) {
  const value = getProperty_(name, "");
  if (!value) throw new Error("Propriété Apps Script manquante : " + name);
  return value;
}

const FOLDER_ID = requireProperty_("FOLDER_ID");
const WEB_APP_URL = getProperty_("WEB_APP_URL", ScriptApp.getService().getUrl());
const TEACHER_EMAIL = getProperty_("TEACHER_EMAIL", "prof.melissaradde@gmail.com");

function getZoomCredentials_() {
  return {
    accountId: requireProperty_("ZOOM_ACCOUNT_ID"),
    clientId: requireProperty_("ZOOM_CLIENT_ID"),
    clientSecret: requireProperty_("ZOOM_CLIENT_SECRET")
  };
}

function verifyFirebaseIdToken_(idToken) {
  if (!idToken) throw new Error("Authentification Firebase manquante.");
  const apiKey = requireProperty_("FIREBASE_WEB_API_KEY");
  const res = UrlFetchApp.fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(apiKey),
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ idToken: idToken }),
      muteHttpExceptions: true
    }
  );
  if (res.getResponseCode() !== 200) throw new Error("Session Firebase invalide ou expirée.");
  const body = JSON.parse(res.getContentText() || "{}");
  const user = body.users && body.users[0];
  if (!user || !user.localId) throw new Error("Utilisateur Firebase introuvable.");
  return { uid: user.localId, email: user.email || "", emailVerified: user.emailVerified === true };
}

function isTeacherAuth_(ctx) { return !!ctx && ctx.uid === TEACHER_UID; }
function requireTeacher_(ctx) { if (!isTeacherAuth_(ctx)) throw new Error("Action réservée à la professeure."); }

/* ============================================================================

   ROUTAGE GET

   Boutons présents dans l'e-mail 24h

   ============================================================================ */

function doGet(e) {

  try {

    const action = e.parameter.action;

    const slotId = e.parameter.slot;

    const token = e.parameter.token;

    if (!action || !slotId || !token) {

      return HtmlService.createHtmlOutput(`

        <html>

          <head>

            <meta charset="UTF-8">

            <meta name="viewport" content="width=device-width, initial-scale=1">

          </head>

          <body style="font-family:Arial,sans-serif;text-align:center;padding:50px;">

            <h2>Lien invalide</h2>

            <p>Ce lien est incomplet ou n'est plus valide.</p>

          </body>

        </html>

      `);

    }

    if (!["confirm", "cancel", "reschedule"].includes(action)) {

      return HtmlService.createHtmlOutput(`

        <html>

          <body style="font-family:Arial,sans-serif;text-align:center;padding:50px;">

            <h2>Action inconnue</h2>

          </body>

        </html>

      `);

    }

    let title = "";

    let message = "";

    let button = "";

    if (action === "confirm") {

      title = "Confirmer mon cours";

      message = "Souhaites-tu confirmer ta présence à ce cours ?";

      button = "Oui, je confirme";

    }

    if (action === "cancel") {

      title = "Annuler mon cours";

      message = "Souhaites-tu vraiment annuler ce cours ?";

      button = "Oui, annuler mon cours";

    }

    if (action === "reschedule") {

      title = "Demander une replanification";

      message =

        "Propose exactement 3 disponibilités. Ton cours actuel reste réservé tant qu'un nouveau créneau n'a pas été validé.";

      button = "Envoyer mes 3 disponibilités";

    }

    return HtmlService.createHtmlOutput(`

      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8">

          <meta name="viewport" content="width=device-width, initial-scale=1">

          <style>

            body {

              font-family: Arial, sans-serif;

              background: #f5f6fa;

              margin: 0;

              padding: 30px 15px;

              color: #1d2433;

            }

            .card {

              max-width: 500px;

              margin: 50px auto;

              background: white;

              border-radius: 16px;

              padding: 35px;

              box-shadow: 0 8px 30px rgba(0,0,0,.08);

            }

            h1 {

              font-size: 24px;

              text-align: center;

              margin-bottom: 15px;

            }

            p {

              line-height: 1.6;

              color: #555;

            }

            label {

              display: block;

              font-weight: bold;

              margin: 15px 0 6px;

            }

            input {

              width: 100%;

              box-sizing: border-box;

              padding: 12px;

              border: 1px solid #ccc;

              border-radius: 8px;

              font-size: 15px;

            }

            button {

              width: 100%;

              margin-top: 20px;

              padding: 14px 24px;

              border: 0;

              border-radius: 10px;

              background: #17324d;

              color: white;

              font-size: 15px;

              font-weight: bold;

              cursor: pointer;

            }

            button:disabled {

              opacity: .6;

              cursor: default;

            }

            #result {

              margin-top: 20px;

              text-align: center;

            }

            .info {

              background: #f4f6f8;

              padding: 12px;

              border-radius: 8px;

              font-size: 13px;

              margin-top: 15px;

            }

          </style>

        </head>

        <body>

          <div class="card">

            <h1>${title}</h1>

            <p>${message}</p>

            ${action === "reschedule" ? `

              <div>

                <label for="availability1">

                  Disponibilité 1

                </label>

                <input

                  type="datetime-local"

                  id="availability1"

                  required

                >

                <label for="availability2">

                  Disponibilité 2

                </label>

                <input

                  type="datetime-local"

                  id="availability2"

                  required

                >

                <label for="availability3">

                  Disponibilité 3

                </label>

                <input

                  type="datetime-local"

                  id="availability3"

                  required

                >

                <div class="info">

                  Les 3 propositions sont obligatoires et doivent être différentes.

                  Ton cours actuel reste réservé jusqu'à la validation d'un nouveau créneau.

                </div>

              </div>

            ` : ""}

            <button

              id="actionButton"

              onclick="executeAction()">

              ${button}

            </button>

            <div id="result"></div>

          </div>

          <script>

            function executeAction() {

              const btn =

                document.getElementById("actionButton");

              const result =

                document.getElementById("result");

              btn.disabled = true;

              btn.textContent = "Traitement…";

              let availability = [];

              if (${JSON.stringify(action)} === "reschedule") {

                const a1 =

                  document.getElementById("availability1").value;

                const a2 =

                  document.getElementById("availability2").value;

                const a3 =

                  document.getElementById("availability3").value;

                if (!a1 || !a2 || !a3) {

                  btn.disabled = false;

                  btn.textContent = ${JSON.stringify(button)};

                  result.innerHTML =

                    "<p style='color:#b00020'>" +

                    "Merci de renseigner les 3 disponibilités." +

                    "</p>";

                  return;

                }

                if (new Set([a1, a2, a3]).size !== 3) {

                  btn.disabled = false;

                  btn.textContent = ${JSON.stringify(button)};

                  result.innerHTML =

                    "<p style='color:#b00020'>" +

                    "Les 3 disponibilités doivent être différentes." +

                    "</p>";

                  return;

                }

                availability = [

                  a1,

                  a2,

                  a3

                ];

              }

              google.script.run

                .withSuccessHandler(function(response) {

                  btn.style.display = "none";

                  result.innerHTML =

                    "<p><strong>" +

                    response +

                    "</strong></p>";

                })

                .withFailureHandler(function(error) {

                  btn.disabled = false;

                  btn.textContent = ${JSON.stringify(button)};

                  result.innerHTML =

                    "<p style='color:#b00020'>" +

                    "Une erreur est survenue : " +

                    error.message +

                    "</p>";

                })

                .processReminderAction(

                  ${JSON.stringify(action)},

                  ${JSON.stringify(slotId)},

                  ${JSON.stringify(token)},

                  availability

                );

            }

          </script>

        </body>

      </html>

    `);

  } catch (err) {

    return HtmlService.createHtmlOutput(

      "<h2>Une erreur est survenue</h2><p>" +

      String(err) +

      "</p>"

    );

  }

}

/* ============================================================================

   ROUTAGE POST

   ============================================================================ */

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Compatibilité temporaire avec l'ancienne page cours-experimental.html :
    // elle ne transmet pas encore le token Firebase ni le slotId. On n'accepte
    // ce cas que pour un créneau expérimental déjà réservé, trouvé par sa date.
    if (data.action === "createZoomMeeting" && !data.idToken && !data.slotId) {
      return handleLegacyExperimentalZoom_(data);
    }

    const authCtx = verifyFirebaseIdToken_(data.idToken);
    delete data.idToken;

    if (data.action === "upload") { return handleUpload(data, authCtx); }
    if (data.action === "delete") { return handleDelete(data, authCtx); }
    if (data.action === "listAvailableSlots") { return handleListAvailableSlots(data, authCtx); }
    if (data.action === "cancelReservation") { return handleCancelReservation(data, authCtx); }
    if (data.action === "notifyCancel") { requireTeacher_(authCtx); return handleNotifyCancel(data); }
    if (data.action === "notifyTeacherCancel") { return handleNotifyTeacherCancel(data); }
    if (data.action === "notifyReschedule") {
      if (data.to === "student") requireTeacher_(authCtx);
      return handleNotifyReschedule(data);
    }
    if (data.action === "createZoomMeeting") { return handleCreateZoomMeeting(data, authCtx); }
    if (data.action === "syncRescheduledCourse") { return handleSyncRescheduledCourse(data, authCtx); }
    if (data.action === "notifyPackPayment") { requireTeacher_(authCtx); return handleNotifyPackPayment(data); }
    if (data.action === "notifyPackBooked") { requireTeacher_(authCtx); return handleNotifyPackBooked(data); }
    if (data.action === "notifyPaymentReceived") { requireTeacher_(authCtx); return handleNotifyPaymentReceived(data); }
    if (data.action === "notifyNotaFiscal") { requireTeacher_(authCtx); return handleNotifyNotaFiscal(data); }

    return jsonResponse({ ok: false, error: "action inconnue" });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

/* ============================================================================

   DRIVE — UPLOAD

   ============================================================================ */

function handleUpload(data, authCtx) {
  if (!authCtx || !authCtx.uid) throw new Error("Authentification requise.");
  if (!data.base64) return jsonResponse({ ok: false, error: "fichier manquant" });
  const bytes = Utilities.base64Decode(data.base64);
  if (bytes.length > 20 * 1024 * 1024) return jsonResponse({ ok: false, error: "fichier trop volumineux" });
  const safeName = String(data.fileName || "fichier").replace(/[\/\\]/g, "_").slice(0, 140);
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const blob = Utilities.newBlob(bytes, data.mimeType || "application/octet-stream", safeName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return jsonResponse({ ok: true, fileId: file.getId(), viewUrl: file.getUrl() });
}

/* ============================================================================

   DRIVE — DELETE

   ============================================================================ */

function handleDelete(data, authCtx) {
  if (!authCtx || !authCtx.uid) throw new Error("Authentification requise.");
  if (!data.fileId) return jsonResponse({ ok: false, error: "fileId manquant" });
  const file = DriveApp.getFileById(data.fileId);
  const parents = file.getParents();
  let belongsToAppFolder = false;
  while (parents.hasNext()) {
    if (parents.next().getId() === FOLDER_ID) { belongsToAppFolder = true; break; }
  }
  if (!belongsToAppFolder) throw new Error("Suppression refusée : fichier hors du dossier de la plateforme.");
  file.setTrashed(true);
  return jsonResponse({ ok: true });
}

/* ============================================================================

   NOTIFICATION ÉLÈVE — la professeure annule le cours

   ============================================================================ */

function handleNotifyCancel(data) {

  try {

    const dateStr = formatNotificationDate_(data.dateISO || data.date, data.timezone || "America/Sao_Paulo", data.dateStr);

    sendCancellationEmail(data.email, data.prenom, dateStr);

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

function sendCancellationEmail(email, prenom, dateStr) {

  const sujet = "Ton cours de français a été annulé";

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Ton cours prévu le ${dateStr} a été annulé par ta professeure.\n` +

    `Tu peux réserver un nouveau créneau directement sur la plateforme.\n\n` +

    `À bientôt,\nMelissa`;

  MailApp.sendEmail(email, sujet, corps);

}

/* ============================================================================

   NOTIFICATION PROFESSEURE — l'élève annule depuis la plateforme

   ============================================================================ */

function handleNotifyTeacherCancel(data) {

  try {

    const dateStr = formatNotificationDate_(data.dateISO || data.date, "Europe/Paris", data.dateStr);

    sendTeacherCancelEmail(TEACHER_EMAIL, data.studentName, dateStr);

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

function sendTeacherCancelEmail(teacherEmail, studentName, dateStr) {

  const sujet = `${studentName} a annulé son cours`;

  const corps =

    `Bonjour Melissa,\n\n` +

    `${studentName} vient d'annuler son cours prévu le ${dateStr}.\n\n` +

    `À bientôt,\nLa plateforme FLE`;

  MailApp.sendEmail(teacherEmail, sujet, corps);

}

/* ============================================================================

   NOTIFICATION ÉLÈVE — lien de paiement de forfait

   Envoyée quand Melissa colle (ou change) le lien de paiement d'un forfait dans

   l'onglet "Élèves & niveaux" de son espace (voir saveStudentNiveau, dans

   07-espace-professeure.js). Le lien reste aussi visible sur la plateforme

   (bannière sur la page des dossiers de l'élève) — cet e-mail n'est qu'un rappel.

   ============================================================================ */

function handleNotifyPackPayment(data) {

  try {

    sendPackPaymentEmail(data.email, data.prenom, data.paymentLinks || {});

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

/* paymentLinks : objet { pix, debitoMcVisa, debitoOutras, creditoMcVisa,

   creditoOutras }. pix/debitoMcVisa/debitoOutras sont des chaînes (un seul

   lien) ; creditoMcVisa/creditoOutras sont des objets {1: url, 2: url, ...}

   car un lien C6 correspond à un nombre de fois précis — un bouton par

   nombre de fois renseigné, pour que l'élève choisisse combien de fois il

   veut payer. */

const PACK_PAYMENT_LABELS = {

  pix: "PIX",

  debitoMcVisa: "Débito (Mastercard, Visa)",

  debitoOutras: "Débito (Outras Bandeiras)"

};

const PACK_CREDIT_LABELS = {

  creditoMcVisa: "Crédito (Mastercard, Visa)",

  creditoOutras: "Crédito (Outras Bandeiras)"

};

function sendPackPaymentEmail(email, prenom, paymentLinks) {

  const sujet = "Lien de paiement de ton forfait de cours";

  const simpleMethods = Object.keys(PACK_PAYMENT_LABELS).filter(k => paymentLinks[k]);

  // { label: "Crédito (Mastercard, Visa) — 2x", url: "..." } pour chaque

  // nombre de fois renseigné, pour chaque bandeira.

  const creditEntries = [];

  Object.keys(PACK_CREDIT_LABELS).forEach(k => {

    const parcelas = paymentLinks[k] || {};

    Object.keys(parcelas).sort().forEach(n => {

      if (parcelas[n]) {

        creditEntries.push({

          label: `${PACK_CREDIT_LABELS[k]} — ${n}x`,

          url: parcelas[n]

        });

      }

    });

  });

  const corpsListeSimple = simpleMethods

    .map(k => `${PACK_PAYMENT_LABELS[k]} :\n${paymentLinks[k]}`)

    .join("\n\n");

  const corpsListeCredit = creditEntries

    .map(e => `${e.label} :\n${e.url}`)

    .join("\n\n");

  const corpsListe = [corpsListeSimple, corpsListeCredit].filter(Boolean).join("\n\n");

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Voici les liens pour payer ton forfait de cours de français — choisis celui qui te convient :\n\n` +

    corpsListe + `\n\n` +

    `Ces liens restent aussi disponibles dans ton espace de cours, sur la page des dossiers.\n\n` +

    `Dès réception de ton paiement, je validerai ton forfait.\n\n` +

    `À bientôt,\nMelissa`;

  const htmlBoutonsSimple = simpleMethods

    .map(k => actionButton_(PACK_PAYMENT_LABELS[k], paymentLinks[k], "#167c5a"))

    .join("");

  const htmlBoutonsCredit = creditEntries

    .map(e => actionButton_(e.label, e.url, "#167c5a"))

    .join("");

  const html =

    `<div style="font-family:Arial,sans-serif; line-height:1.55; color:#20232b; max-width:620px;">` +

    `<p>Bonjour ${escapeHtml_(prenom)},</p>` +

    `<p>Voici les liens pour payer ton forfait de cours de français — choisis celui qui te convient :</p>` +

    htmlBoutonsSimple + htmlBoutonsCredit +

    `<p style="font-size:13px; color:#666; margin-top:22px;">Ces liens restent aussi disponibles dans ton espace de cours, sur la page des dossiers.</p>` +

    `<p>Dès réception de ton paiement, je validerai ton forfait.</p>` +

    `<p>À bientôt,<br>Melissa</p>` +

    `</div>`;

  MailApp.sendEmail(email, sujet, corps, { htmlBody: html });

}

function handleNotifyPackBooked(data) {
  try {
    const email = String(data.email || "").trim();
    if (!email) throw new Error("e-mail manquant");
    const prenom = String(data.prenom || "");
    const dates = Array.isArray(data.dates) ? data.dates : [];
    const sujet = "Tes cours de français sont réservés";
    const corps = `Bonjour ${prenom},\n\n` +
      `Tes séances ont bien été réservées :\n` +
      dates.map((d,i)=>`${i+1}. ${d}`).join("\n") +
      `\n\nTu retrouveras chaque cours et son lien Zoom dans ton espace.\n\nÀ bientôt,\nMelissa`;
    MailApp.sendEmail(email, sujet, corps);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/* ============================================================================

   NOTIFICATION ÉLÈVE — paiement reçu (1er e-mail du flux de facturation)

   Envoyée quand Melissa clique sur "✅ Paiement reçu" (cours à l'unité, dans

   05-admin-disponibilites-forum.js) ou "✅ Forfait payé" (07-espace-professeure.js)

   après avoir vu la confirmation dans sa boîte mail C6 Bank. Annonce que la nota

   fiscal suivra dans un second e-mail, une fois que Melissa l'aura téléversée.

   ============================================================================ */

function handleNotifyPaymentReceived(data) {

  try {

    sendPaymentReceivedEmail(data.email, data.prenom, data.context);

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

function sendPaymentReceivedEmail(email, prenom, context) {

  const sujet = "Ton paiement a bien été reçu";

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Ton paiement pour ${context} a bien été reçu, merci !\n\n` +

    `Ta nota fiscal te sera envoyée dans un prochain e-mail, dès qu'elle sera prête.\n\n` +

    `À bientôt,\nMelissa`;

  const html =

    `<div style="font-family:Arial,sans-serif; line-height:1.55; color:#20232b; max-width:620px;">` +

    `<p>Bonjour ${escapeHtml_(prenom)},</p>` +

    `<p>Ton paiement pour <strong>${escapeHtml_(context)}</strong> a bien été reçu, merci !</p>` +

    `<p>Ta nota fiscal te sera envoyée dans un prochain e-mail, dès qu'elle sera prête.</p>` +

    `<p>À bientôt,<br>Melissa</p>` +

    `</div>`;

  MailApp.sendEmail(email, sujet, corps, { htmlBody: html });

}

/* ============================================================================

   NOTIFICATION ÉLÈVE — nota fiscal (2e e-mail du flux de facturation)

   Envoyée quand Melissa téléverse la nota fiscal (générée de son côté, hors de

   la plateforme) via "📎 Envoyer la nota fiscal" (cours à l'unité ou forfait).

   ============================================================================ */

function handleNotifyNotaFiscal(data) {

  try {

    sendNotaFiscalEmail(data.email, data.prenom, data.notaFiscalUrl);

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

function sendNotaFiscalEmail(email, prenom, notaFiscalUrl) {

  const sujet = "Ta nota fiscal";

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Voici ta nota fiscal :\n${notaFiscalUrl}\n\n` +

    `À bientôt,\nMelissa`;

  const html =

    `<div style="font-family:Arial,sans-serif; line-height:1.55; color:#20232b; max-width:620px;">` +

    `<p>Bonjour ${escapeHtml_(prenom)},</p>` +

    `<p>Voici ta nota fiscal :</p>` +

    actionButton_("Voir ma nota fiscal", notaFiscalUrl, "#167c5a") +

    `<p>À bientôt,<br>Melissa</p>` +

    `</div>`;

  MailApp.sendEmail(email, sujet, corps, { htmlBody: html });

}

/* ============================================================================

   NOTIFICATION DE REPLANIFICATION — depuis l'app (élève <-> professeure)

   ============================================================================ */

function handleNotifyReschedule(data) {

  try {

    if (data.to === "student") {

      const sujet = "Nouveau créneau proposé pour ton cours";

      const corps =

        `Bonjour ${data.name},\n\n` +

        `Ta professeure propose de déplacer ton cours du ${data.oldDate} au ${data.newDate}.\n` +

        `Connecte-toi sur la plateforme pour confirmer ou refuser cette proposition.\n\n` +

        `À bientôt,\nMelissa`;

      MailApp.sendEmail(data.email, sujet, corps);

    } else if (data.to === "teacher") {

      const sujet = `${data.name} propose un nouveau créneau`;

      const corps =

        `Bonjour Melissa,\n\n` +

        `${data.name} propose de déplacer son cours au ${data.newDate}.\n` +

        `Connecte-toi sur la plateforme (onglet Disponibilités) pour accepter ou refuser.\n\n` +

        `À bientôt,\nLa plateforme FLE`;

      MailApp.sendEmail(TEACHER_EMAIL, sujet, corps);

    }

    return jsonResponse({ ok: true });

  } catch (err) {

    return jsonResponse({ ok: false, error: String(err) });

  }

}

/* ============================================================================

   ZOOM

   ============================================================================ */

function handleLegacyExperimentalZoom_(data) {
  try {
    if (!data.startTime) throw new Error("startTime manquant");
    const projectId = "fle-profmelissaradde";
    const token = getFirestoreAccessToken_();
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const query = {
      structuredQuery: {
        from: [{ collectionId: "disponibilites" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "date" },
            op: "EQUAL",
            value: { stringValue: String(data.startTime) }
          }
        }
      }
    };
    const res = UrlFetchApp.fetch(`${baseUrl}:runQuery`, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify(query),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
      throw new Error("Recherche du cours expérimental impossible.");
    }
    const rows = JSON.parse(res.getContentText()) || [];
    const matches = rows.filter(x => x.document).map(x => x.document).filter(doc => {
      const f = doc.fields || {};
      return fieldBool_(f, "isExperimental") === true
        && !!fieldString_(f, "reservedBy")
        && !fieldString_(f, "zoomJoinUrl");
    });
    if (matches.length !== 1) throw new Error("Créneau expérimental réservé introuvable ou déjà équipé d'un lien Zoom.");
    const doc = matches[0];
    const slotId = doc.name.split("/").pop();
    const meeting = createZoomMeeting_(data.topic, data.startTime, data.duration);
    patchFirestoreFields_(baseUrl, "disponibilites", slotId, token, {
      zoomJoinUrl: { stringValue: meeting.join_url },
      zoomMeetingId: { stringValue: String(meeting.id) },
      zoomTopic: { stringValue: data.topic || "Cours expérimental" }
    });
    return jsonResponse({ ok: true, joinUrl: meeting.join_url, meetingId: meeting.id, serverPersisted: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function handleCreateZoomMeeting(data, authCtx) {
  try {
    if (!data.slotId) throw new Error("slotId manquant");

    const projectId = "fle-profmelissaradde";
    const token = getFirestoreAccessToken_();
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const doc = getFirestoreDocument_(baseUrl, "disponibilites", data.slotId, token);
    const fields = doc.fields || {};
    const reservedBy = fieldString_(fields, "reservedBy");

    if (!reservedBy) throw new Error("Ce créneau n'est pas réservé.");

    if (!isTeacherAuth_(authCtx) && reservedBy !== authCtx.uid) {
      throw new Error("Ce cours n'appartient pas à cet utilisateur.");
    }

    const existingUrl = fieldString_(fields, "zoomJoinUrl");
    if (existingUrl) {
      return jsonResponse({
        ok: true,
        joinUrl: existingUrl,
        serverPersisted: true,
        existing: true
      });
    }

    const startTime = fieldString_(fields, "date");
    if (!startTime) throw new Error("Date du cours introuvable.");

    const rawDuration = fields.duree && (fields.duree.integerValue || fields.duree.doubleValue);
    const duration = Math.max(15, Math.min(240, Number(rawDuration) || 45));

    const reservedName = fieldString_(fields, "reservedName");
    const isExperimental = fieldBool_(fields, "isExperimental");
    const topic = String(
      data.topic ||
      (isExperimental
        ? "Cours expérimental — " + (reservedName || "élève")
        : "Cours de français avec " + (reservedName || "élève"))
    ).slice(0, 160);

    const meeting = createZoomMeeting_(topic, startTime, duration);

    patchFirestoreFields_(baseUrl, "disponibilites", data.slotId, token, {
      zoomJoinUrl: { stringValue: meeting.join_url },
      zoomMeetingId: { stringValue: String(meeting.id) },
      zoomTopic: { stringValue: topic }
    });

    return jsonResponse({
      ok: true,
      joinUrl: meeting.join_url,
      meetingId: meeting.id,
      serverPersisted: true
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}


function extractZoomMeetingId_(joinUrl) {
  const match = String(joinUrl || "").match(/\/j\/(\d+)/);
  return match ? match[1] : "";
}

function updateZoomMeeting_(meetingId, topic, startTimeISO, durationMin) {
  const token = getZoomAccessToken_();
  const date = new Date(startTimeISO);
  if (isNaN(date.getTime())) throw new Error("Date Zoom invalide.");

  const parisLocalTime = Utilities.formatDate(
    date,
    "Europe/Paris",
    "yyyy-MM-dd'T'HH:mm:ss"
  );

  const payload = {
    topic: topic || "Cours de français",
    start_time: parisLocalTime,
    timezone: "Europe/Paris",
    duration: durationMin || 45
  };

  const res = UrlFetchApp.fetch(
    "https://api.zoom.us/v2/meetings/" + encodeURIComponent(String(meetingId)),
    {
      method: "patch",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    }
  );

  const code = res.getResponseCode();
  if (code !== 204 && (code < 200 || code >= 300)) {
    throw new Error("Erreur Zoom lors du déplacement " + code + " : " + res.getContentText());
  }
  return true;
}

function sendRescheduleConfirmedEmail_(email, prenom, oldDateStr, newDateStr) {
  const sujet = "Ton cours de français a bien été déplacé";
  const corps =
    `Bonjour ${prenom || ""},\n\n` +
    `Ton cours a bien été déplacé.\n\n` +
    (oldDateStr ? `Ancien créneau : ${oldDateStr}\n` : "") +
    `Nouveau créneau : ${newDateStr}\n\n` +
    `La réunion Zoom a été synchronisée avec ce nouveau créneau. ` +
    `Tu retrouveras le bouton Zoom dans ton espace de cours lorsqu'il sera disponible.\n\n` +
    `À bientôt,\nMelissa`;

  const html =
    `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#20232b;max-width:620px;">` +
    `<p>Bonjour ${escapeHtml_(prenom || "")},</p>` +
    `<p><strong>Ton cours de français a bien été déplacé.</strong></p>` +
    (oldDateStr ? `<p><strong>Ancien créneau :</strong><br>${escapeHtml_(oldDateStr)}</p>` : "") +
    `<p><strong>Nouveau créneau :</strong><br>${escapeHtml_(newDateStr)}</p>` +
    `<p>La réunion Zoom a été synchronisée avec ce nouveau créneau. ` +
    `Tu retrouveras le bouton Zoom dans ton espace de cours lorsqu'il sera disponible.</p>` +
    `<p>À bientôt,<br>Melissa</p></div>`;

  MailApp.sendEmail(email, sujet, corps, { htmlBody: html });
}

function handleSyncRescheduledCourse(data, authCtx) {
  try {
    if (!data.slotId) throw new Error("slotId manquant");

    const projectId = "fle-profmelissaradde";
    const token = getFirestoreAccessToken_();
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const doc = getFirestoreDocument_(baseUrl, "disponibilites", data.slotId, token);
    const fields = doc.fields || {};
    const reservedBy = fieldString_(fields, "reservedBy");

    if (!reservedBy) throw new Error("Ce créneau n'est pas réservé.");
    if (!isTeacherAuth_(authCtx) && reservedBy !== authCtx.uid) {
      throw new Error("Ce cours n'appartient pas à cet utilisateur.");
    }

    const newDate = fieldString_(fields, "date");
    if (!newDate) throw new Error("Nouvelle date du cours introuvable.");

    const rawDuration = fields.duree && (fields.duree.integerValue || fields.duree.doubleValue);
    const duration = Math.max(15, Math.min(240, Number(rawDuration) || Number(data.duration) || 45));

    const reservedName = fieldString_(fields, "reservedName");
    const reservedEmail = fieldString_(fields, "reservedEmail");
    const existingTopic = fieldString_(fields, "zoomTopic");
    const topic = String(
      existingTopic ||
      data.topic ||
      "Cours de français avec " + (reservedName || "élève")
    ).slice(0, 160);

    const storedJoinUrl = fieldString_(fields, "zoomJoinUrl");
    const previousJoinUrl = String(data.previousZoomJoinUrl || storedJoinUrl || "");
    let meetingId = fieldString_(fields, "zoomMeetingId") || extractZoomMeetingId_(previousJoinUrl);
    let joinUrl = previousJoinUrl;
    let movedExisting = false;

    if (meetingId) {
      try {
        updateZoomMeeting_(meetingId, topic, newDate, duration);
        movedExisting = true;
      } catch (zoomUpdateError) {
        console.warn("Impossible de déplacer la réunion Zoom existante, création d'une nouvelle réunion :", zoomUpdateError);
        meetingId = "";
      }
    }

    if (!meetingId) {
      const meeting = createZoomMeeting_(topic, newDate, duration);
      meetingId = String(meeting.id);
      joinUrl = meeting.join_url;
      movedExisting = false;
    }

    patchFirestoreFields_(baseUrl, "disponibilites", data.slotId, token, {
      zoomJoinUrl: { stringValue: joinUrl },
      zoomMeetingId: { stringValue: String(meetingId) },
      zoomTopic: { stringValue: topic },
      reminderSent: { booleanValue: false },
      reminderSentForDate: { nullValue: null },
      reminderActionToken: { nullValue: null }
    });

    if (reservedEmail) {
      const studentTimezone = getStudentTimezone_(baseUrl, reservedBy, token) || "America/Sao_Paulo";
      let oldDateStr = "";
      if (data.oldDate) {
        const oldDate = new Date(data.oldDate);
        if (!isNaN(oldDate.getTime())) {
          oldDateStr = formatDateInTimezone_(oldDate, studentTimezone);
        }
      }
      const newDateStr = formatDateInTimezone_(new Date(newDate), studentTimezone);
      sendRescheduleConfirmedEmail_(reservedEmail, reservedName, oldDateStr, newDateStr);
    }

    return jsonResponse({
      ok: true,
      joinUrl: joinUrl,
      meetingId: String(meetingId),
      movedExisting: movedExisting,
      notified: !!reservedEmail
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function getZoomAccessToken_() {
  const zoom = getZoomCredentials_();
  const credentials = Utilities.base64Encode(zoom.clientId + ":" + zoom.clientSecret);

  const res = UrlFetchApp.fetch(

    "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=" + encodeURIComponent(zoom.accountId),

    { method: "post", headers: { Authorization: "Basic " + credentials } }

  );

  return JSON.parse(res.getContentText()).access_token;

}

function createZoomMeeting_(topic, startTimeISO, durationMin) {

  const token = getZoomAccessToken_();

  const date = new Date(startTimeISO);

  // Transforme l'instant reçu en heure locale Europe/Paris

  // Exemple : 2026-09-16T19:20:00Z -> 2026-09-16T21:20:00

  const parisLocalTime = Utilities.formatDate(

    date,

    "Europe/Paris",

    "yyyy-MM-dd'T'HH:mm:ss"

  );

  const payload = {

    topic: topic || "Cours de français",

    type: 2,

    // Heure locale Paris, volontairement sans Z

    start_time: parisLocalTime,

    // Indique explicitement à Zoom comment interpréter 21:20

    timezone: "Europe/Paris",

    duration: durationMin || 45,

    settings: {

      join_before_host: true,

      waiting_room: true,

      approval_type: 2

    }

  };

  const res = UrlFetchApp.fetch(

    "https://api.zoom.us/v2/users/me/meetings",

    {

      method: "post",

      contentType: "application/json",

      headers: {

        Authorization: "Bearer " + token

      },

      payload: JSON.stringify(payload),

      muteHttpExceptions: true

    }

  );

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {

    throw new Error(

      "Erreur Zoom " +

      res.getResponseCode() +

      " : " +

      res.getContentText()

    );

  }

  return JSON.parse(res.getContentText());

}

/* ============================================================================

   ANNULATION AUTOMATIQUE — COURS CLASSIQUE NON PAYÉ MOINS D'1H AVANT LE DÉBUT

   Un cours classique (pas expérimental, pas une séance de forfait — voir

   isPack) réservé mais toujours marqué "pending" ou sans paymentStatus quand

   il ne reste plus qu'environ 1h avant son début est annulé automatiquement :

   le créneau redevient libre, et un e-mail part à l'élève et à Melissa.

   Les séances de forfait sont exclues exprès : leur paiement se suit au

   niveau du forfait entier (pack.paymentStatus sur la fiche élève), pas

   créneau par créneau, donc rien à vérifier ici pour elles.

   -> Mets en place un déclencheur horaire (icône horloge à gauche ->

      Déclencheurs -> Ajouter un déclencheur -> cancelUnpaidCourses -> toutes

      les 15 minutes), comme pour sendReminders24h.

   ============================================================================ */

function cancelUnpaidCourses() {

  const projectId = "fle-profmelissaradde";

  const token = getFirestoreAccessToken_();

  const now = new Date();

  const in60min = new Date(now.getTime() + 60 * 60 * 1000);

  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const structuredQuery = {

    structuredQuery: {

      from: [{ collectionId: "disponibilites" }],

      where: {

        compositeFilter: {

          op: "AND",

          filters: [

            {

              fieldFilter: {

                field: { fieldPath: "date" },

                op: "GREATER_THAN_OR_EQUAL",

                value: { stringValue: now.toISOString() }

              }

            },

            {

              fieldFilter: {

                field: { fieldPath: "date" },

                op: "LESS_THAN_OR_EQUAL",

                value: { stringValue: in60min.toISOString() }

              }

            }

          ]

        }

      }

    }

  };

  const res = UrlFetchApp.fetch(`${baseUrl}:runQuery`, {

    method: "post",

    contentType: "application/json",

    headers: { Authorization: "Bearer " + token },

    payload: JSON.stringify(structuredQuery),

    muteHttpExceptions: true

  });

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {

    throw new Error("Firestore runQuery (cancelUnpaidCourses) : " + res.getContentText());

  }

  const rows = JSON.parse(res.getContentText()) || [];

  const docs = rows.filter(r => r.document).map(r => r.document);

  docs.forEach(doc => {

    const fields = doc.fields || {};

    const reservedBy = fieldString_(fields, "reservedBy");

    const reservedName = fieldString_(fields, "reservedName");

    const reservedEmail = fieldString_(fields, "reservedEmail");

    const dateStr = fieldString_(fields, "date");

    const isExperimental = fieldBool_(fields, "isExperimental");

    const isPack = fieldBool_(fields, "isPack");

    const paymentStatus = fieldString_(fields, "paymentStatus");

    // On ne touche qu'aux cours classiques, réservés, pas encore payés.

    if (!reservedBy || isExperimental || isPack || paymentStatus === "paid") { return; }

    if (!dateStr) { return; }

    const docId = doc.name.split("/").pop();

    const parisDate = formatDateInTimezone_(new Date(dateStr), "Europe/Paris");

    patchFirestoreFields_(baseUrl, "disponibilites", docId, token, {

      reservedBy: { nullValue: null },

      reservedName: { nullValue: null },

      reservedEmail: { nullValue: null },

      zoomJoinUrl: { nullValue: null },

      cancelledForNonPayment: { booleanValue: true },

      cancelledForNonPaymentAt: { timestampValue: new Date().toISOString() }

    });

    if (reservedEmail) {

      sendUnpaidCancellationEmail_(reservedEmail, reservedName || "", parisDate);

    }

    sendTeacherUnpaidCancelEmail_(reservedName || "Élève", parisDate);

  });

}

function sendUnpaidCancellationEmail_(email, prenom, dateStr) {

  const sujet = "Ton cours a été annulé (paiement non reçu)";

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Ton cours prévu le ${dateStr} a été annulé automatiquement, le paiement n'ayant pas été reçu moins d'une heure avant le début du cours.\n` +

    `Tu peux réserver un nouveau créneau et payer directement sur la plateforme.\n\n` +

    `À bientôt,\nMelissa`;

  MailApp.sendEmail(email, sujet, corps);

}

function sendTeacherUnpaidCancelEmail_(studentName, dateStr) {

  const sujet = `Cours annulé automatiquement (non payé) — ${studentName}`;

  const corps =

    `Bonjour Melissa,\n\n` +

    `Le cours de ${studentName} prévu le ${dateStr} a été annulé automatiquement : le paiement n'avait pas été reçu moins d'une heure avant le début.\n\n` +

    `La plateforme FLE`;

  MailApp.sendEmail(TEACHER_EMAIL, sujet, corps);

}

/* ============================================================================

   RAPPEL 24H

   ============================================================================ */

function sendReminders24h() {

  const projectId = "fle-profmelissaradde";

  const token = getFirestoreAccessToken_();

  const now = new Date();

  const in23h = new Date(now.getTime() + 23 * 3600 * 1000);

  const in25h = new Date(now.getTime() + 25 * 3600 * 1000);

  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const structuredQuery = {

    structuredQuery: {

      from: [{ collectionId: "disponibilites" }],

      where: {

        compositeFilter: {

          op: "AND",

          filters: [

            {

              fieldFilter: {

                field: { fieldPath: "date" },

                op: "GREATER_THAN_OR_EQUAL",

                value: { stringValue: in23h.toISOString() }

              }

            },

            {

              fieldFilter: {

                field: { fieldPath: "date" },

                op: "LESS_THAN_OR_EQUAL",

                value: { stringValue: in25h.toISOString() }

              }

            }

          ]

        }

      }

    }

  };

  const res = UrlFetchApp.fetch(`${baseUrl}:runQuery`, {

    method: "post",

    contentType: "application/json",

    headers: { Authorization: "Bearer " + token },

    payload: JSON.stringify(structuredQuery),

    muteHttpExceptions: true

  });

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {

    throw new Error("Firestore runQuery : " + res.getContentText());

  }

  const rows = JSON.parse(res.getContentText()) || [];

  const docs = rows.filter(r => r.document).map(r => r.document);

  docs.forEach(doc => {

    const fields = doc.fields || {};

    const dateStr = fields.date && fields.date.stringValue;

    const reservedBy = fields.reservedBy && fields.reservedBy.stringValue;

    const reservedEmail = fields.reservedEmail && fields.reservedEmail.stringValue;

    const reservedName = fields.reservedName && fields.reservedName.stringValue;
    const reminderSentForDate = fields.reminderSentForDate && fields.reminderSentForDate.stringValue;

    if (!dateStr || !reservedBy || !reservedEmail) { return; }
    if (reminderSentForDate === dateStr) { return; }

    const slotDate = new Date(dateStr);

    if (slotDate < in23h || slotDate > in25h) { return; }

    const studentTimezone = getStudentTimezone_(baseUrl, reservedBy, token) || "America/Sao_Paulo";

    const formattedDate = formatDateInTimezone_(slotDate, studentTimezone);

    const docId = doc.name.split("/").pop();

    const actionToken = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");

    // L'e-mail part AVANT le marquage : si Gmail échoue, le prochain trigger réessaiera.
    sendReminderEmail(reservedEmail, reservedName || "", formattedDate, docId, actionToken);

    patchFirestoreFields_(baseUrl, "disponibilites", docId, token, {
      reminderSent: { booleanValue: true },
      reminderSentForDate: { stringValue: dateStr },
      reminderActionToken: { stringValue: actionToken },
      reminderSentAt: { timestampValue: new Date().toISOString() }
    });

  });

}

/* ============================================================================

   FUSEAU HORAIRE ÉLÈVE

   ============================================================================ */

function getStudentTimezone_(baseUrl, uid, token) {

  try {

    const url = `${baseUrl}/eleves/${encodeURIComponent(uid)}`;

    const res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });

    if (res.getResponseCode() !== 200) { return null; }

    const fields = JSON.parse(res.getContentText()).fields || {};

    return (fields.timezone && fields.timezone.stringValue) ? fields.timezone.stringValue : null;

  } catch (e) {

    return null;

  }

}

/* ============================================================================

   E-MAIL RAPPEL AVEC 3 BOUTONS

   ============================================================================ */

function sendReminderEmail(email, prenom, dateStr, slotId, actionToken) {

  const sujet = "Action requise : confirme ton cours de français";

  const confirmUrl = reminderActionUrl_("confirm", slotId, actionToken);

  const cancelUrl = reminderActionUrl_("cancel", slotId, actionToken);

  const rescheduleUrl = reminderActionUrl_("reschedule", slotId, actionToken);

  const corps =

    `Bonjour ${prenom},\n\n` +

    `Ton cours de français est prévu le ${dateStr}.\n\n` +

    `Merci de choisir une option. L'annulation et la demande de déplacement restent possibles jusqu'à 1 heure avant le cours :\n\n` +

    `CONFIRMER MON COURS :\n${confirmUrl}\n\n` +

    `ANNULER MON COURS :\n${cancelUrl}\n\n` +

    `DEMANDER À DÉPLACER LE COURS :\n${rescheduleUrl}\n\n` +

    `Le déplacement n'est pas automatique. Melissa recevra ta demande et conviendra avec toi d'un nouveau créneau.\n\n` +

    `Le lien Zoom reste disponible dans ton espace de cours.\n\n` +

    `À très vite,\nMelissa`;

  const html =

    `<div style="font-family:Arial,sans-serif; line-height:1.55; color:#20232b; max-width:620px;">` +

    `<p>Bonjour ${escapeHtml_(prenom)},</p>` +

    `<p>Ton cours de français est prévu le <strong>${escapeHtml_(dateStr)}</strong>.</p>` +

    `<p>Merci de choisir une option. L'annulation et la demande de déplacement restent possibles <strong>jusqu'à 1 heure avant le cours</strong> :</p>` +

    actionButton_("Confirmer mon cours", confirmUrl, "#167c5a") +

    actionButton_("Annuler mon cours", cancelUrl, "#b4233d") +

    actionButton_("Demander à déplacer le cours", rescheduleUrl, "#315fd4") +

    `<p style="font-size:13px; color:#666; margin-top:22px;">Le déplacement n'est pas automatique : Melissa recevra ta demande et conviendra avec toi d'un nouveau créneau.</p>` +

    `<p>Le lien Zoom reste disponible dans ton espace de cours.</p>` +

    `<p>À très vite,<br>Melissa</p>` +

    `</div>`;

  MailApp.sendEmail(email, sujet, corps, { htmlBody: html });

}

/* ============================================================================

   CRÉATION DES URL DES BOUTONS

   ============================================================================ */

function reminderActionUrl_(action, slotId, actionToken) {

  return (

    WEB_APP_URL +

    "?action=" + encodeURIComponent(action) +

    "&slot=" + encodeURIComponent(slotId) +

    "&token=" + encodeURIComponent(actionToken)

  );

}

function getFirestoreDocument_(baseUrl, collection, docId, token) {
  const url = `${baseUrl}/${collection}/${encodeURIComponent(docId)}`;
  const res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error("Document Firestore introuvable : " + collection + "/" + docId);
  return JSON.parse(res.getContentText());
}

function firestoreValueToJs_(v) {
  if (!v) return null;
  if (Object.prototype.hasOwnProperty.call(v, "nullValue")) return null;
  if (Object.prototype.hasOwnProperty.call(v, "stringValue")) return v.stringValue;
  if (Object.prototype.hasOwnProperty.call(v, "booleanValue")) return v.booleanValue;
  if (Object.prototype.hasOwnProperty.call(v, "integerValue")) return Number(v.integerValue);
  if (Object.prototype.hasOwnProperty.call(v, "doubleValue")) return Number(v.doubleValue);
  if (Object.prototype.hasOwnProperty.call(v, "timestampValue")) return v.timestampValue;
  if (v.arrayValue) return (v.arrayValue.values || []).map(firestoreValueToJs_);
  if (v.mapValue) {
    const out = {};
    const fields = v.mapValue.fields || {};
    Object.keys(fields).forEach(k => out[k] = firestoreValueToJs_(fields[k]));
    return out;
  }
  return null;
}

function jsToFirestoreValue_(v) {
  if (v == null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(jsToFirestoreValue_) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "object") {
    const fields = {};
    Object.keys(v).forEach(k => fields[k] = jsToFirestoreValue_(v[k]));
    return { mapValue: { fields: fields } };
  }
  return { stringValue: String(v) };
}

function firestoreFieldsToJs_(fields) {
  const out = {};
  Object.keys(fields || {}).forEach(k => out[k] = firestoreValueToJs_(fields[k]));
  return out;
}

function handleListAvailableSlots(data, authCtx) {
  try {
    if (!authCtx || !authCtx.uid) throw new Error("Authentification requise.");
    const projectId = "fle-profmelissaradde";
    const token = getFirestoreAccessToken_();
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const query = {
      structuredQuery: {
        from: [{ collectionId: "disponibilites" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "reservedBy" },
            op: "EQUAL",
            value: { nullValue: null }
          }
        }
      }
    };
    const res = UrlFetchApp.fetch(`${baseUrl}:runQuery`, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify(query),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
      throw new Error("Impossible de charger les disponibilités.");
    }
    const rows = JSON.parse(res.getContentText()) || [];
    const now = Date.now();
    const slots = rows.filter(x => x.document).map(x => x.document).map(doc => {
      const f = doc.fields || {};
      return {
        id: doc.name.split("/").pop(),
        date: fieldString_(f, "date"),
        duree: Number(f.duree && (f.duree.integerValue || f.duree.doubleValue)) || 45,
        isExperimental: fieldBool_(f, "isExperimental")
      };
    }).filter(s => s.date && s.isExperimental !== true && new Date(s.date).getTime() >= now);
    slots.sort((a,b)=>new Date(a.date)-new Date(b.date));
    return jsonResponse({ ok: true, slots: slots });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function handleCancelReservation(data, authCtx) {
  try {
    if (!data.slotId) throw new Error("slotId manquant");
    const projectId = "fle-profmelissaradde";
    const token = getFirestoreAccessToken_();
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const slotDoc = getFirestoreDocument_(baseUrl, "disponibilites", data.slotId, token);
    const slot = firestoreFieldsToJs_(slotDoc.fields || {});
    if (!slot.reservedBy) return jsonResponse({ ok: true, excessive: false, refundDue: false });

    const by = isTeacherAuth_(authCtx) ? "teacher" : "student";
    if (by === "student" && slot.reservedBy !== authCtx.uid) throw new Error("Cette réservation ne t'appartient pas.");

    const studentDoc = getFirestoreDocument_(baseUrl, "eleves", slot.reservedBy, token);
    const studentData = firestoreFieldsToJs_(studentDoc.fields || {});
    const log = Array.isArray(studentData.noShowLog) ? studentData.noShowLog : [];
    const start = new Date(slot.date).getTime();
    const isLate = Number.isFinite(start) && (start - Date.now()) < 3600000;
    let excessive = false;
    let refundDue = false;

    if (isLate) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
      const recentCount = log.filter(x => x && x.by === by && x.late === true && new Date(x.ts).getTime() >= thirtyDaysAgo).length;
      log.push({ ts: new Date().toISOString(), by: by, late: true });
      patchFirestoreFields_(baseUrl, "eleves", slot.reservedBy, token, { noShowLog: jsToFirestoreValue_(log) });
      excessive = recentCount + 1 > 2;
    }

    if (excessive) {
      patchFirestoreFields_(baseUrl, "disponibilites", data.slotId, token, {
        definitivelyCancelled: { booleanValue: true },
        cancelledBy: { stringValue: by }
      });
      if (by === "teacher") {
        refundDue = true;
        patchFirestoreFields_(baseUrl, "eleves", slot.reservedBy, token, { refundDue: { booleanValue: true } });
      }
    } else {
      patchFirestoreFields_(baseUrl, "disponibilites", data.slotId, token, {
        reservedBy: { nullValue: null },
        reservedName: { nullValue: null },
        reservedEmail: { nullValue: null },
        reservedPhone: { nullValue: null },
        zoomJoinUrl: { nullValue: null },
        zoomTopic: { nullValue: null },
        paymentStatus: { nullValue: null },
        cpfNaNota: { nullValue: null },
        reminderSent: { booleanValue: false },
        reminderSentForDate: { nullValue: null },
        reminderActionToken: { nullValue: null },
        reminderSentAt: { nullValue: null },
        clickedByStudent: { nullValue: null },
        clickedByTeacher: { nullValue: null },
        confirmed: { booleanValue: false },
        rescheduleRequest: { nullValue: null },
        rescheduleRequested: { nullValue: null }
      });
      if (slot.isPack === true) {
        const pack = studentData.pack && typeof studentData.pack === "object" ? studentData.pack : {};
        pack.used = Math.max(0, Number(pack.used || 0) - 1);
        patchFirestoreFields_(baseUrl, "eleves", slot.reservedBy, token, { pack: jsToFirestoreValue_(pack) });
      }
    }

    return jsonResponse({ ok: true, excessive: excessive, refundDue: refundDue });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

/* ============================================================================

   PATCH FIRESTORE

   ============================================================================ */

function patchFirestoreFields_(baseUrl, collection, docId, token, fieldsToPatch) {

  const names = Object.keys(fieldsToPatch);

  const masks = names.map(n => "updateMask.fieldPaths=" + encodeURIComponent(n)).join("&");

  const url = `${baseUrl}/${collection}/${encodeURIComponent(docId)}?${masks}`;

  const res = UrlFetchApp.fetch(url, {

    method: "patch",

    contentType: "application/json",

    headers: { Authorization: "Bearer " + token },

    payload: JSON.stringify({ fields: fieldsToPatch }),

    muteHttpExceptions: true

  });

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {

    throw new Error("Firestore PATCH : " + res.getContentText());

  }

}

/* ============================================================================

   LECTURE CHAMPS FIRESTORE

   ============================================================================ */

function fieldString_(fields, name) {

  const f = fields && fields[name];

  return (f && typeof f.stringValue === "string") ? f.stringValue : "";

}

function fieldBool_(fields, name) {

  const f = fields && fields[name];

  return !!(f && f.booleanValue === true);

}

/* ============================================================================

   E-MAIL DEMANDE DE DÉPLACEMENT (depuis le bouton de l'e-mail de rappel)

   ============================================================================ */

function sendTeacherRescheduleEmail_(studentName, studentEmail, dateStr) {

  const sujet = `${studentName} demande à déplacer son cours`;

  const corps =

    `Bonjour Melissa,\n\n` +

    `${studentName} (${studentEmail || "e-mail non renseigné"}) demande à déplacer son cours prévu le ${dateStr}.\n\n` +

    `Le cours n'a pas été déplacé automatiquement. Va dans l'onglet Disponibilités de ton espace pour lui proposer un nouveau créneau.\n\n` +

    `La plateforme FLE`;

  MailApp.sendEmail(TEACHER_EMAIL, sujet, corps);

}

/* ============================================================================

   BOUTONS E-MAIL

   ============================================================================ */

function actionButton_(label, url, color) {

  return (

    `<p style="margin:12px 0">` +

    `<a href="${escapeHtml_(url)}" style="display:inline-block; background:${color}; color:#fff; text-decoration:none; padding:12px 18px; border-radius:7px; font-weight:bold">` +

    `${escapeHtml_(label)}</a></p>`

  );

}

/* ============================================================================

   HTML SAFE

   ============================================================================ */

function escapeHtml_(value) {

  return String(value == null ? "" : value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#39;");

}

/* ============================================================================

   PAGE APRÈS CLIC SUR LE BOUTON

   ============================================================================ */

function htmlActionResponse_(title, message, ok) {

  const accent = ok ? "#167c5a" : "#b4233d";

  const html =

    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +

    `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml_(title)}</title></head>` +

    `<body style="margin:0; background:#fff8ef; font-family:Arial,sans-serif; color:#20232b;">` +

    `<div style="max-width:560px; margin:60px auto; padding:0 18px;">` +

    `<div style="background:#fff; border:1px solid #ece1cf; border-radius:14px; padding:30px;">` +

    `<h1 style="color:${accent}; font-size:26px;">${escapeHtml_(title)}</h1>` +

    `<p style="line-height:1.6">${escapeHtml_(message)}</p>` +

    `<p style="margin-top:24px"><a href="https://profmelissaradde.github.io/fle-profmelissaradde/" style="color:#315fd4; font-weight:bold;">Accéder à mon espace de cours</a></p>` +

    `</div></div></body></html>`;

  return HtmlService.createHtmlOutput(html).setTitle(title).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}

/* ============================================================================

   WHATSAPP OPTIONNEL

   ============================================================================ */

function sendWhatsAppReminder(phone, apiKey, prenom, dateStr) {

  const message = encodeURIComponent(

    `Bonjour ${prenom} ! Rappel : ton cours de français est prévu le ${dateStr}. Connecte-toi sur la plateforme pour rejoindre la visio le moment venu.`

  );

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`;

  try { UrlFetchApp.fetch(url); } catch (e) { /* non bloquant */ }

}

/* ============================================================================

   FORMAT DATE DANS LE FUSEAU DE L'ÉLÈVE

   ============================================================================ */

function formatDateInTimezone_(date, timezone) {

  const tz = timezone || "Europe/Paris";

  const day = Utilities.formatDate(date, tz, "dd");

  const month = Utilities.formatDate(date, tz, "MM");

  const year = Utilities.formatDate(date, tz, "yyyy");

  const hour = Utilities.formatDate(date, tz, "HH");

  const minute = Utilities.formatDate(date, tz, "mm");

  const weekdayNumber = Number(Utilities.formatDate(date, tz, "u"));

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  const mois = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

  const label = timezoneLabel_(tz);

  return `${jours[weekdayNumber - 1]} ${Number(day)} ${mois[Number(month) - 1]} ${year} · ${hour}h${minute} (${label})`;

}

/* ============================================================================

   LABEL FUSEAU

   ============================================================================ */

function timezoneLabel_(timezone) {

  if (timezone === "Europe/Paris") { return "heure de Paris"; }

  if (timezone === "America/Sao_Paulo") { return "heure de São Paulo"; }

  return timezone;

}

/* ============================================================================

   FORMAT NOTIFICATIONS

   ============================================================================ */

function formatNotificationDate_(dateISO, timezone, fallbackDateStr) {

  if (dateISO) {

    const d = new Date(dateISO);

    if (!isNaN(d.getTime())) { return formatDateInTimezone_(d, timezone); }

  }

  return fallbackDateStr || "";

}

function formatDateFr_(d) {

  return formatDateInTimezone_(d, "Europe/Paris");

}

/* ============================================================================

   FIRESTORE — AUTHENTIFICATION AVEC LE COMPTE GOOGLE DU SCRIPT

   Cette version n'utilise plus de clé privée de compte de service et n'appelle
   plus Utilities.computeRsaSha256Signature(). Les déclencheurs installables
   s'exécutent avec les autorisations du compte Google qui les a créés.

   IMPORTANT : le manifeste appsscript.json doit contenir le scope :
   https://www.googleapis.com/auth/datastore

   Le compte Google qui exécute le script doit aussi avoir accès au projet
   Firebase / Google Cloud fle-profmelissaradde.

   ============================================================================ */

function getFirestoreAccessToken_() {
  const token = ScriptApp.getOAuthToken();

  if (!token) {
    throw new Error(
      "Impossible d'obtenir le jeton OAuth Google du script. " +
      "Réautorise le projet Apps Script puis réessaie."
    );
  }

  return token;
}

function testFirebaseAccess() {
  const projectId = "fle-profmelissaradde";
  const token = getFirestoreAccessToken_();

  const url =
    "https://firestore.googleapis.com/v1/projects/" +
    encodeURIComponent(projectId) +
    "/databases/(default)/documents/disponibilites?pageSize=1";

  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      Authorization: "Bearer " + token
    },
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();

  if (code >= 200 && code < 300) {
    Logger.log("✅ Firestore OK — accès OAuth Google autorisé");
    return true;
  }

  throw new Error(
    "Firestore refuse l'accès OAuth (HTTP " + code + "). " +
    "Vérifie que le scope https://www.googleapis.com/auth/datastore " +
    "est dans appsscript.json et que ton compte Google a accès au projet " +
    projectId + ". Réponse : " + res.getContentText()
  );
}

/* ============================================================================

   JSON RESPONSE

   ============================================================================ */

function jsonResponse(obj) {

  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);

}

/* ============================================================================

   TRAITEMENT DES 3 ACTIONS (boutons de l'e-mail) — VERSION RÉELLEMENT UTILISÉE

   ============================================================================ */

function processReminderAction(

  action,

  slotId,

  actionToken,

  availability

) {

  try {

    if (!action || !slotId || !actionToken) {

      throw new Error("Lien incomplet.");

    }

    if (!["confirm", "cancel", "reschedule"].includes(action)) {

      throw new Error("Action inconnue.");

    }

    const projectId = "fle-profmelissaradde";

    const token =

      getFirestoreAccessToken_();

    const baseUrl =

      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    /* =========================

       RÉCUPÉRER LE COURS

       ========================= */

    const url =

      `${baseUrl}/disponibilites/${encodeURIComponent(slotId)}`;

    const response =

      UrlFetchApp.fetch(url, {

        method: "get",

        headers: {

          Authorization: "Bearer " + token

        },

        muteHttpExceptions: true

      });

    if (response.getResponseCode() !== 200) {

      throw new Error(

        "Ce cours n'existe plus."

      );

    }

    const doc =

      JSON.parse(response.getContentText());

    const fields =

      doc.fields || {};

    /* =========================

       VÉRIFIER LE TOKEN

       ========================= */

    const storedToken =

      fields.reminderActionToken &&

      fields.reminderActionToken.stringValue;

    if (!storedToken || storedToken !== actionToken) {

      throw new Error(

        "Ce lien n'est plus valide. Utilise le dernier e-mail reçu."

      );

    }

    /* =========================

       DONNÉES DU COURS

       ========================= */

    const dateStr =

      fields.date &&

      fields.date.stringValue;

    const reservedBy =

      fields.reservedBy &&

      fields.reservedBy.stringValue;

    const reservedName =

      fields.reservedName &&

      fields.reservedName.stringValue;

    const reservedEmail =

      fields.reservedEmail &&

      fields.reservedEmail.stringValue;

    /* CORRECTION : il manquait la lecture de isExperimental ici — sans elle,

       l'annulation ci-dessous ne pouvait pas savoir qu'il s'agissait d'un

       cours expérimental, et effaçait toujours l'identité du prospect. */

    const isExperimental =

      fieldBool_(fields, "isExperimental");

    if (!dateStr) {

      throw new Error(

        "La date du cours est introuvable."

      );

    }

    if (!reservedBy) {

      throw new Error(

        "Ce cours n'est plus réservé."

      );

    }

    const courseDate =

      new Date(dateStr);

    const now =

      new Date();

    if (

      courseDate.getTime() <=

      now.getTime()

    ) {

      throw new Error(

        "Ce cours est déjà passé."

      );

    }

    const hoursBefore =

      (

        courseDate.getTime() -

        now.getTime()

      )

      /

      (1000 * 60 * 60);

    /* ==========================================================

       CONFIRMATION

       ========================================================== */

    if (action === "confirm") {

      patchFirestoreFields_(

        baseUrl,

        "disponibilites",

        slotId,

        token,

        {

          confirmed: {

            booleanValue: true

          },

          confirmedAt: {

            timestampValue:

              new Date().toISOString()

          }

        }

      );

      return (

        "Ton cours est bien confirmé. À bientôt !"

      );

    }

    /* ==========================================================

       ANNULATION

       Possible jusqu'à 1 heure avant.

       CORRECTION : cette branche effaçait reservedBy / reservedName /

       reservedEmail / reservedPhone pour TOUT cours annulé, y compris un

       cours expérimental — ce qui faisait perdre la trace du prospect et

       ne marquait jamais experimentalCancelled (incohérent avec

       cancelExperimentalTrial() côté application, et avec

       experimentalSlotStatus() côté admin qui s'attend à ce champ pour

       afficher "Annulé"). Un cours expérimental garde maintenant son

       identité et n'a que son accès Zoom coupé.

       ========================================================== */

    if (action === "cancel") {

      if (hoursBefore < 1) {

        throw new Error(

          "Le délai d'une heure est dépassé. " +

          "Le cours ne peut plus être annulé."

        );

      }

      const cancelPatch = {

        confirmed: {

          booleanValue: false

        },

        reminderSent: {

          booleanValue: false

        },

        reminderActionToken: {

          nullValue: null

        },

        rescheduleRequest: {

          nullValue: null

        },

        cancelledAt: {

          timestampValue:

            new Date().toISOString()

        },

        zoomJoinUrl: {

          nullValue: null

        }

      };

      if (isExperimental) {

        cancelPatch.experimentalCancelled = { booleanValue: true };

        cancelPatch.experimentalCancelledBy = { stringValue: reservedBy };

      } else {

        cancelPatch.reservedBy = { nullValue: null };

        cancelPatch.reservedName = { nullValue: null };

        cancelPatch.reservedEmail = { nullValue: null };

        cancelPatch.reservedPhone = { nullValue: null };

      }

      patchFirestoreFields_(

        baseUrl,

        "disponibilites",

        slotId,

        token,

        cancelPatch

      );

      /* Notification professeure */

      MailApp.sendEmail({

        to: TEACHER_EMAIL,

        subject:

          "Cours annulé — " +

          (reservedName || "Élève") +

          (isExperimental ? " (cours expérimental)" : ""),

        htmlBody:

          "<p><strong>" +

          escapeHtml_(

            reservedName || "Un élève"

          )

          +

          "</strong> vient d'annuler son cours" +

          (isExperimental ? " expérimental" : "") +

          ".</p>"

          +

          "<p><strong>E-mail :</strong> " +

          escapeHtml_(

            reservedEmail ||

            "Non renseigné"

          )

          +

          "</p>"

      });

      return isExperimental

        ? "Ton cours expérimental a bien été annulé."

        : "Ton cours a bien été annulé.";

    }

    /* ==========================================================

       REPLANIFICATION

       ========================================================== */

    if (action === "reschedule") {

      /* ---------- Limite 1 heure ---------- */

      if (hoursBefore < 1) {

        throw new Error(

          "Le délai d'une heure est dépassé. " +

          "Il n'est plus possible de demander " +

          "le déplacement de ce cours."

        );

      }

      /* ---------- Vérifier les 3 disponibilités ---------- */

      if (

        !Array.isArray(availability) ||

        availability.length !== 3

      ) {

        throw new Error(

          "Tu dois proposer exactement 3 disponibilités."

        );

      }

      availability =

        availability.map(function(value) {

          return String(value || "").trim();

        });

      if (

        availability.some(

          function(value) {

            return !value;

          }

        )

      ) {

        throw new Error(

          "Les 3 disponibilités sont obligatoires."

        );

      }

      if (

        new Set(availability).size !== 3

      ) {

        throw new Error(

          "Les 3 disponibilités doivent être différentes."

        );

      }

      /* ---------- Convertir les dates ---------- */

      const availabilityDates =

        availability.map(function(value) {

          const date =

            new Date(value);

          if (

            isNaN(date.getTime())

          ) {

            throw new Error(

              "Une des disponibilités n'est pas valide."

            );

          }

          return date.toISOString();

        });

      /* ---------- Vérifier qu'elles sont futures ---------- */

      availabilityDates.forEach(

        function(value) {

          if (

            new Date(value).getTime() <=

            Date.now()

          ) {

            throw new Error(

              "Les disponibilités proposées doivent être dans le futur."

            );

          }

        }

      );

      /* ======================================================

         ENREGISTRER DANS FIRESTORE

         ====================================================== */

      patchFirestoreFields_(

        baseUrl,

        "disponibilites",

        slotId,

        token,

        {

          rescheduleRequested: {

            booleanValue: true

          },

          rescheduleRequestedAt: {

            timestampValue:

              new Date().toISOString()

          },

          rescheduleAvailability1: {

            stringValue:

              availabilityDates[0]

          },

          rescheduleAvailability2: {

            stringValue:

              availabilityDates[1]

          },

          rescheduleAvailability3: {

            stringValue:

              availabilityDates[2]

          },

          rescheduleRequest: {

            mapValue: {

              fields: {

                by: {

                  stringValue:

                    "student"

                },

                status: {

                  stringValue:

                    "pending"

                },

                availability1: {

                  stringValue:

                    availabilityDates[0]

                },

                availability2: {

                  stringValue:

                    availabilityDates[1]

                },

                availability3: {

                  stringValue:

                    availabilityDates[2]

                },

                proposedDate: {

                  nullValue: null

                },

                proposedDuree: {

                  nullValue: null

                }

              }

            }

          }

        }

      );

      /* ======================================================

         FORMATER LES DATES POUR MELISSA

         ====================================================== */

      const studentTimezone =

        getStudentTimezone_(

          baseUrl,

          reservedBy,

          token

        )

        ||

        "America/Sao_Paulo";

      const formattedCurrent =

        formatDateInTimezone_(

          courseDate,

          studentTimezone

        );

      const formatted1 =

        formatDateInTimezone_(

          new Date(availabilityDates[0]),

          studentTimezone

        );

      const formatted2 =

        formatDateInTimezone_(

          new Date(availabilityDates[1]),

          studentTimezone

        );

      const formatted3 =

        formatDateInTimezone_(

          new Date(availabilityDates[2]),

          studentTimezone

        );

      /* ======================================================

         E-MAIL À MELISSA

         ====================================================== */

      MailApp.sendEmail({

        to: TEACHER_EMAIL,

        subject:

          "Demande de replanification — " +

          (

            reservedName ||

            "Élève"

          ),

        htmlBody:

          "<p><strong>" +

          escapeHtml_(

            reservedName ||

            "Un élève"

          )

          +

          "</strong> souhaite déplacer son cours.</p>"

          +

          "<p><strong>Cours actuel :</strong><br>" +

          escapeHtml_(

            formattedCurrent

          )

          +

          "</p>"

          +

          "<p><strong>3 disponibilités proposées :</strong></p>"

          +

          "<ol>" +

          "<li>" +

          escapeHtml_(formatted1) +

          "</li>" +

          "<li>" +

          escapeHtml_(formatted2) +

          "</li>" +

          "<li>" +

          escapeHtml_(formatted3) +

          "</li>" +

          "</ol>"

          +

          "<p><strong>E-mail de l'élève :</strong> " +

          escapeHtml_(

            reservedEmail ||

            "Non renseigné"

          )

          +

          "</p>"

          +

          "<p>Le cours actuel reste réservé " +

          "tant qu'un nouveau créneau " +

          "n'a pas été validé.</p>"

      });

      return (

        "Tes 3 disponibilités ont bien été envoyées à Melissa. " +

        "Ton cours actuel reste réservé en attendant la validation " +

        "d'un nouveau créneau."

      );

    }

    throw new Error(

      "Action impossible."

    );

  } catch (err) {

    console.error(

      "processReminderAction :",

      err

    );

    throw new Error(

      err &&

      err.message

        ?

        err.message

        :

        String(err)

    );

  }

}