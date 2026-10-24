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

    if (action === "acceptproposal" || action === "refuseproposal") {

      return renderProposalPage_(action, slotId, token);

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
    if (data.action === "proposeReschedule") { return handleProposeReschedule(data, authCtx); }
    if (data.action === "respondReschedule") { return handleRespondReschedule(data, authCtx); }
    if (data.action === "applyTeacherReschedule") { return handleApplyTeacherReschedule(data, authCtx); }
    if (data.action === "retryZoomSync") { return handleRetryZoomSync(data, authCtx); }
    if (data.action === "remindProposal") { return handleRemindProposal(data, authCtx); }
    if (data.action === "lessonAction") { return handleLessonAction(data, authCtx); }
    if (data.action === "resendReminder") { return handleResendReminder(data, authCtx); }
    if (data.action === "refuseRescheduleRequest") { return handleRefuseRescheduleRequest(data, authCtx); }
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

    if (fieldBool_(fields, "anomalie")) {
      throw new Error("Séance en anomalie : aucune réunion Zoom n'est créée tant qu'un report n'a pas été accepté.");
    }
    const zoomSyncState = firestoreValueToJs_(fields.zoomSync) || {};
    if (zoomSyncState.status && zoomSyncState.status !== "ok") {
      return jsonResponse({ ok: false, error: "Synchronisation Zoom en cours pour cette séance.", zoomStatus: zoomSyncState.status });
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

/* Action historique appelée par les anciennes versions de l'application après
   avoir modifié la date elles-mêmes. Elle passe désormais par la synchro
   idempotente rptSyncZoom_ (plus jamais de seconde réunion en cas d'échec). */
function handleSyncRescheduledCourse(data, authCtx) {
  try {
    if (!data.slotId) throw new Error("slotId manquant");
    const token = getFirestoreAccessToken_();
    const slot = rptLoadSlot_(data.slotId, token);
    if (!slot.reservedBy) throw new Error("Ce créneau n'est pas réservé.");
    if (!isTeacherAuth_(authCtx) && slot.reservedBy !== authCtx.uid) throw new Error("Ce cours n'appartient pas à cet utilisateur.");
    const zs = slot.zoomSync || {};
    if (!(zs.status === "ok" && zs.targetDate === slot.date)) {
      rptPatch_(data.slotId, token, { zoomSync: Object.assign({}, zs, { status: zs.targetDate === slot.date ? (zs.status || "pending") : "pending",
        targetDate: slot.date, requestedAt: new Date().toISOString() }) });
    }
    const zr = rptSyncZoom_(data.slotId);
    return jsonResponse({ ok: zr.status === "ok", zoomStatus: zr.status, joinUrl: zr.joinUrl || null,
      meetingId: null, movedExisting: zr.method === "updated", error: zr.error || null });
  } catch (err) {
    return jsonResponse({ ok: false, error: err && err.message ? err.message : String(err) });
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
    /* Trace conservée avant de libérer le créneau (historique de l'élève). */
    try {
      const sl = { reservedBy: reservedBy, reservedName: reservedName, date: dateStr, isPack: false };
      const ev = suiviEvenement_(docId, sl, "lesson_cancelled", "automatisation", "automatisation", "en_attente", "annule", { motif: "paiement non reçu 1 h avant le cours" }, "impaye");
      suiviJournaliser_(token, ev, suiviNotification_(ev, `Le cours de ${reservedName || "l'élève"} du ${parisDate} a été annulé automatiquement : paiement non reçu.`, false));
    } catch (e) { console.warn(e); }

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
    try {
      const sl = { reservedBy: reservedBy, reservedName: reservedName, date: dateStr, packId: fields.packId && fields.packId.stringValue, isPack: !!(fields.isPack && fields.isPack.booleanValue === true) };
      suiviJournaliser_(token, suiviEvenement_(docId, sl, "lesson_reminder_sent", "automatisation", "email", "en_attente", "en_attente", null, "rappel|" + dateStr), null);
    } catch (e) { console.warn(e); }
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
        /* Créneaux libres = reservedBy à null. Firestore n'accepte la comparaison à null
           que sous la forme IS_NULL : un filtre EQUAL + nullValue ne renvoie AUCUN document
           (vérifié le 20/10/2026 : 0 résultat contre 146 avec IS_NULL). */
        where: {
          unaryFilter: {
            field: { fieldPath: "reservedBy" },
            op: "IS_NULL"
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
  /* Annulation depuis la plateforme (élève ou professeure) : même règle que
     l'e-mail et l'automatisation (coursAnnuler_), sous verrou, avec événement. */
  try {
    if (!data.slotId) throw new Error("slotId manquant");
    if (!authCtx || !authCtx.uid) throw new Error("Authentification requise.");
    const by = isTeacherAuth_(authCtx) ? "teacher" : "student";
    const r = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(data.slotId, token);
      if (!slot.reservedBy || slot.definitivelyCancelled || slot.experimentalCancelled) return { ok: true, already: true, excessive: false, refundDue: false };
      if (by === "student" && slot.reservedBy !== authCtx.uid) throw new Error("Cette réservation ne t'appartient pas.");
      return coursAnnuler_(token, data.slotId, slot, by, "plateforme", {});
    });
    /* L'e-mail à Melissa est déjà envoyé par l'application (notifyTeacherCancel). */
    return jsonResponse({ ok: true, excessive: r.excessive === true, refundDue: r.refundDue === true, statut: r.statut || null, message: r.message || null });
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
   TRAITEMENT DES 3 ACTIONS (boutons de l'e-mail de rappel)
   La page affichée par doGet demande un clic explicite (un aperçu de lien ou un
   antivirus qui « ouvre » l'e-mail ne déclenche rien). Le traitement passe par le
   service central coursAction_ : mêmes règles que la plateforme, verrou,
   idempotence, événement + notification. Un message de succès n'est renvoyé que
   si Firestore a confirmé l'écriture ; sinon une erreur est levée.
   ============================================================================ */
function processReminderAction(action, slotId, actionToken, availability) {
  if (!action || !slotId || !actionToken) throw new Error("Lien incomplet.");
  const type = { confirm: "confirm", cancel: "cancel", reschedule: "reschedule_request" }[action];
  if (!type) throw new Error("Action inconnue.");
  const r = coursAction_(String(slotId), type, { role: "eleve", via: "email", token: String(actionToken) }, { availability: availability });
  if (!r || !r.ok) {
    console.warn("processReminderAction refusée : " + (r && r.error));
    throw new Error((r && r.error) || "Ta réponse n'a pas pu être enregistrée. Réessaie dans quelques minutes.");
  }
  return r.message;
}
/* ============================================================================

   REPORTS DE SÉANCES (anomalies, propositions, acceptations) + SYNCHRO ZOOM

   Principe : TOUTE modification définitive de la date d'une séance passe par
   ce serveur (jamais directement par le navigateur de l'élève).

   Séance en anomalie
     → proposeReschedule (professeure) : la proposition est enregistrée avec un
       identifiant, la date initiale et un jeton d'e-mail ; la séance reste en
       anomalie, sa date et sa réunion Zoom ne bougent pas.
     → respondReschedule (élève, depuis la plateforme) OU lien de l'e-mail
       (processProposalAction) : même procédure rptRespond_ :
         verrou → proposition encore valide ? → conflit de planning ? →
         nouvelle date enregistrée + zoomSync.status = "pending" →
         rptSyncZoom_ : déplacement de LA MÊME réunion Zoom (même lien) ;
         si impossible, remplacement sécurisé (nouvelle réunion créée PUIS
         ancienne supprimée, jamais deux réunions actives) ; erreur temporaire
         → "retry" (déclencheur retryZoomSyncs) ; échec définitif → "error"
         + e-mail à Melissa.
     → refus : proposition marquée "refused", séance toujours en anomalie,
       Melissa prévenue, rien n'est déplacé ni décompté.

   Champs ajoutés sur disponibilites/{id} :
     rescheduleRequest.{id, emailToken, baseDate, expiresAt, status…}
     originalDate          date initiale de la séance (avant le 1er report)
     zoomSync              {status, targetDate, attempts, method, lastError,
                            nextAttemptAt, pendingNewMeetingId, notifiedFor…}
     rescheduleHistory     historique (40 derniers événements)

   DÉCLENCHEUR À AJOUTER : retryZoomSyncs — toutes les 10 minutes.

   ============================================================================ */

const FS_PROJECT_ = "fle-profmelissaradde";
const RPT_MIN_DELAY_MS_ = 60 * 60 * 1000;          // acceptation possible jusqu'à 1 h avant le nouvel horaire
const RPT_MAX_ZOOM_ATTEMPTS_ = 8;                   // au-delà : statut "error" + e-mail à Melissa
const RPT_RETRY_DELAYS_MIN_ = [2, 5, 10, 20, 30, 60, 120, 240];

function fsBase_() {
  return `https://firestore.googleapis.com/v1/projects/${FS_PROJECT_}/databases/(default)/documents`;
}
function rptLoadSlot_(slotId, token) {
  const doc = getFirestoreDocument_(fsBase_(), "disponibilites", slotId, token);
  return firestoreFieldsToJs_(doc.fields || {});
}
function rptPatch_(slotId, token, obj) {
  const fields = {};
  Object.keys(obj).forEach(k => fields[k] = jsToFirestoreValue_(obj[k]));
  patchFirestoreFields_(fsBase_(), "disponibilites", slotId, token, fields);
}
function rptHistory_(slot, event) {
  const h = Array.isArray(slot.rescheduleHistory) ? slot.rescheduleHistory.slice(-39) : [];
  h.push(Object.assign({ ts: new Date().toISOString() }, event));
  return h;
}
/* Protection contre les doubles exécutions (double clic, e-mail + plateforme en
   même temps, déclencheur qui tourne pendant une acceptation…). */
function rptWithLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) {
    throw new Error("Une autre opération est en cours sur le planning. Réessaie dans quelques secondes.");
  }
  try { return fn(); } finally { lock.releaseLock(); }
}
function rptNewId_() { return Utilities.getUuid().replace(/-/g, ""); }
function rptDuree_(v) { return Math.max(15, Math.min(240, Number(v) || 45)); }
function rptParseDate_(value, label) {
  const d = new Date(value);
  if (!value || isNaN(d.getTime())) throw new Error((label || "La date") + " n'est pas valide.");
  return d;
}
function rptErrMsg_(err) { return err && err.message ? err.message : String(err); }

/* Conflits : une autre séance RÉSERVÉE qui chevauche le créneau, ou une autre
   proposition de report encore en attente sur le même horaire. Les créneaux
   libres (disponibilités non réservées) ne sont pas des conflits. */
function rptFindConflicts_(token, slotId, start, duree) {
  const startMs = start.getTime(), endMs = startMs + duree * 60000;
  const overlaps = (s, d) => s < endMs && startMs < s + d * 60000;
  const out = [];
  const runQuery = (where) => {
    const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
      method: "post", contentType: "application/json",
      headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }], where: where } }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) throw new Error("Vérification du planning impossible (Firestore).");
    return (JSON.parse(res.getContentText()) || []).filter(r => r.document)
      .map(r => ({ id: r.document.name.split("/").pop(), data: firestoreFieldsToJs_(r.document.fields || {}) }));
  };
  const from = new Date(startMs - 6 * 3600000).toISOString(), to = new Date(startMs + 6 * 3600000).toISOString();
  runQuery({ compositeFilter: { op: "AND", filters: [
    { fieldFilter: { field: { fieldPath: "date" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: from } } },
    { fieldFilter: { field: { fieldPath: "date" }, op: "LESS_THAN_OR_EQUAL", value: { stringValue: to } } }
  ] } }).forEach(x => {
    const f = x.data;
    if (x.id === slotId || !f.reservedBy || f.experimentalCancelled || f.definitivelyCancelled) return;
    if (overlaps(new Date(f.date).getTime(), rptDuree_(f.duree))) out.push({ id: x.id, label: (f.reservedName || "un élève") + " (" + formatDateFr_(new Date(f.date)) + ")" });
  });
  runQuery({ fieldFilter: { field: { fieldPath: "rescheduleRequest.status" }, op: "EQUAL", value: { stringValue: "pending" } } }).forEach(x => {
    const r = x.data.rescheduleRequest || {};
    if (x.id === slotId || r.by !== "teacher" || !r.proposedDate || !x.data.reservedBy) return;
    if (overlaps(new Date(r.proposedDate).getTime(), rptDuree_(r.proposedDuree || x.data.duree))) {
      out.push({ id: x.id, label: "proposition en attente pour " + (x.data.reservedName || "un élève") + " (" + formatDateFr_(new Date(r.proposedDate)) + ")" });
    }
  });
  return out;
}

/* ---------- 1. Proposition de la professeure ---------- */
function handleProposeReschedule(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    if (!data.slotId) throw new Error("slotId manquant");
    const res = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(data.slotId, token);
      if (!slot.reservedBy) throw new Error("Ce créneau n'est pas réservé.");
      const proposed = rptParseDate_(data.proposedDate, "La date proposée");
      if (proposed.getTime() - Date.now() < RPT_MIN_DELAY_MS_) throw new Error("La nouvelle date doit être au moins 1 h dans le futur.");
      const duree = rptDuree_(data.proposedDuree || slot.duree);
      const conflicts = rptFindConflicts_(token, data.slotId, proposed, duree);
      if (conflicts.length && data.ignoreConflicts !== true) {
        return { ok: false, conflict: true, conflicts: conflicts, error: "Conflit de planning : " + conflicts.map(c => c.label).join(" ; ") };
      }
      const proposal = {
        id: rptNewId_(), by: "teacher", status: "pending",
        proposedDate: proposed.toISOString(), proposedDuree: duree,
        baseDate: slot.date, wasAnomalie: slot.anomalie === true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(proposed.getTime() - RPT_MIN_DELAY_MS_).toISOString(),
        emailToken: rptNewId_() + rptNewId_()
      };
      const previous = slot.rescheduleRequest && slot.rescheduleRequest.status === "pending" ? slot.rescheduleRequest : null;
      rptPatch_(data.slotId, token, {
        rescheduleRequest: proposal,
        rescheduleHistory: rptHistory_(slot, { type: "proposed", by: "teacher", from: slot.date, to: proposal.proposedDate, proposalId: proposal.id,
          replaced: previous ? (previous.id || previous.by) : null }),
        suivi: { statut: "report_propose", at: new Date().toISOString(), canal: "plateforme", par: "administratrice", eleveId: slot.reservedBy, date: slot.date }
      });
      const ev = suiviEvenement_(data.slotId, slot, "lesson_reschedule_proposed", "administratrice", "plateforme", suiviStatut_(slot), "proposition_envoyee",
        { from: slot.date, to: proposal.proposedDate, remplaceDemandeEleve: !!(previous && previous.by === "student") }, "prop|" + proposal.id);
      suiviJournaliser_(token, ev, null);
      suiviCloreDemandes_(token, data.slotId);
      return { ok: true, proposal: proposal, slot: slot };
    });
    if (!res.ok) return jsonResponse(res);
    let emailed = false;
    if (res.slot.reservedEmail) {
      try { sendProposalEmail_(res.slot, data.slotId, res.proposal); emailed = true; }
      catch (e) { console.warn("E-mail de proposition non envoyé :", e); }
    }
    return jsonResponse({ ok: true, proposalId: res.proposal.id, emailed: emailed });
  } catch (err) {
    return jsonResponse({ ok: false, error: rptErrMsg_(err) });
  }
}

/* ---------- 2. Réponse de l'élève (plateforme ou e-mail : même procédure) ---------- */
function handleRespondReschedule(data, authCtx) {
  try {
    if (!data.slotId) throw new Error("slotId manquant");
    if (!["accept", "refuse"].includes(data.decision)) throw new Error("Décision inconnue.");
    const actor = { uid: authCtx.uid, isTeacher: isTeacherAuth_(authCtx) };
    return jsonResponse(rptRespond_(data.slotId, data.proposalId || null, data.decision, actor, "plateforme", null));
  } catch (err) {
    return jsonResponse({ ok: false, error: rptErrMsg_(err) });
  }
}

/* Appelée par la page ouverte depuis l'e-mail (google.script.run). */
function processProposalAction(action, slotId, emailToken) {
  const decision = action === "acceptproposal" ? "accept" : action === "refuseproposal" ? "refuse" : null;
  if (!decision || !slotId || !emailToken) throw new Error("Lien incomplet.");
  const r = rptRespond_(slotId, null, decision, { uid: null, isTeacher: false }, "email", emailToken);
  if (!r.ok) throw new Error(r.error || "Action impossible.");
  if (r.refused) return "C'est noté : tu as refusé ce nouveau créneau. Melissa va te proposer une autre date.";
  if (r.already) return "Ce report était déjà confirmé. Ton cours est bien prévu au nouvel horaire.";
  return r.zoomStatus === "ok"
    ? "Merci ! Ton cours est confirmé au nouvel horaire. Le bouton Zoom apparaîtra dans ton espace 15 minutes avant le cours."
    : "Merci ! Ton cours est confirmé au nouvel horaire. La réunion Zoom est en cours de synchronisation : le bouton apparaîtra dans ton espace 15 minutes avant le cours.";
}

function rptRespond_(slotId, proposalId, decision, actor, via, emailToken) {
  let result;
  try {
    result = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(slotId, token);
      const req = slot.rescheduleRequest || null;
      if (!emailToken && !actor.isTeacher && slot.reservedBy !== actor.uid) throw new Error("Ce cours n'appartient pas à cet utilisateur.");
      if (emailToken && (!req || !req.emailToken || req.emailToken !== emailToken)) throw new Error("Ce lien n'est plus valide : utilise le dernier e-mail reçu ou ton espace de cours.");
      if (!req || req.by !== "teacher") throw new Error("Aucune proposition de report en attente pour ce cours.");
      if (proposalId && req.id && req.id !== proposalId) throw new Error("Cette proposition a été remplacée par une plus récente. Recharge la page.");
      if (req.status === "accepted" && decision === "accept") return { ok: true, already: true, newDate: slot.date, slot: slot };
      if (req.status !== "pending") throw new Error("Cette proposition n'est plus en attente.");
      if (req.baseDate && req.baseDate !== slot.date) throw new Error("Le cours a été modifié depuis cette proposition.");

      if (decision === "refuse") {
        rptPatch_(slotId, token, {
          rescheduleRequest: Object.assign({}, req, { status: "refused", refusedAt: new Date().toISOString(), via: via }),
          suivi: { statut: "proposition_refusee", at: new Date().toISOString(), canal: via === "email" ? "email" : "plateforme", par: actor.isTeacher ? "administratrice" : "eleve", eleveId: slot.reservedBy, date: slot.date },
          rescheduleHistory: rptHistory_(slot, { type: "refused", via: via, to: req.proposedDate, proposalId: req.id || null })
        });
        const evR = suiviEvenement_(slotId, slot, "lesson_reschedule_refused", actor.isTeacher ? "administratrice" : "eleve", via === "email" ? "email" : "plateforme",
          "proposition_envoyee", suiviStatut_(slot), { proposition: req.proposedDate, refuseePar: actor.isTeacher ? "administratrice" : "eleve" }, "refus|" + (req.id || req.proposedDate));
        suiviJournaliser_(token, evR, actor.isTeacher ? null : suiviNotification_(evR, `${slot.reservedName || "Un élève"} a refusé la nouvelle date proposée (${suiviDateFr_(req.proposedDate)}). Propose une autre date.`, true));
        return { ok: true, refused: true, slot: slot, req: req };
      }

      const proposed = rptParseDate_(req.proposedDate, "La date proposée");
      if (proposed.getTime() - Date.now() < RPT_MIN_DELAY_MS_) throw new Error("Cette proposition a expiré (le nouvel horaire est trop proche). Melissa va te proposer une autre date.");
      const duree = rptDuree_(req.proposedDuree || slot.duree);
      const conflicts = rptFindConflicts_(token, slotId, proposed, duree);
      if (conflicts.length) throw new Error("Ce créneau n'est plus disponible. Melissa va te proposer une autre date.");
      rptApplyNewDate_(token, slotId, slot, proposed.toISOString(), duree,
        { type: "accepted", via: via, by: actor.isTeacher ? "teacher" : "student", proposalId: req.id || null }, req);
      return { ok: true, accepted: true, newDate: proposed.toISOString(), slot: slot };
    });
  } catch (err) {
    return { ok: false, error: rptErrMsg_(err) };
  }

  if (result.refused) {
    try { sendTeacherProposalAnswerEmail_(result.slot, result.req, false); } catch (e) { console.warn(e); }
    return { ok: true, refused: true };
  }
  if (result.already) return { ok: true, already: true, newDate: result.newDate, zoomStatus: (result.slot.zoomSync || {}).status || "ok" };
  const zr = rptSyncZoom_(slotId);
  try { sendTeacherProposalAnswerEmail_(result.slot, { proposedDate: result.newDate }, true, zr.status); } catch (e) { console.warn(e); }
  return { ok: true, accepted: true, newDate: result.newDate, zoomStatus: zr.status, zoomError: zr.error || null };
}

/* ---------- 3. Décision directe de la professeure ---------- */
/* Choix d'une des 3 disponibilités de l'élève, ou changement direct (urgence). */
function handleApplyTeacherReschedule(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    if (!data.slotId) throw new Error("slotId manquant");
    const res = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(data.slotId, token);
      if (!slot.reservedBy) throw new Error("Ce créneau n'est pas réservé.");
      const newDate = rptParseDate_(data.newDate, "La nouvelle date");
      if (newDate.getTime() <= Date.now()) throw new Error("La nouvelle date doit être dans le futur.");
      const duree = rptDuree_(data.duree || slot.duree);
      const conflicts = rptFindConflicts_(token, data.slotId, newDate, duree);
      if (conflicts.length && data.ignoreConflicts !== true) {
        return { ok: false, conflict: true, conflicts: conflicts, error: "Conflit de planning : " + conflicts.map(c => c.label).join(" ; ") };
      }
      const req = slot.rescheduleRequest && slot.rescheduleRequest.status === "pending" ? slot.rescheduleRequest : null;
      rptApplyNewDate_(token, data.slotId, slot, newDate.toISOString(), duree,
        { type: data.reason === "student_availability" ? "student_availability_accepted" : "direct", by: "teacher", via: "plateforme" }, req);
      return { ok: true, newDate: newDate.toISOString() };
    });
    if (!res.ok) return jsonResponse(res);
    const zr = rptSyncZoom_(data.slotId);
    return jsonResponse({ ok: true, newDate: res.newDate, zoomStatus: zr.status, zoomError: zr.error || null, movedExisting: zr.method === "updated" });
  } catch (err) {
    return jsonResponse({ ok: false, error: rptErrMsg_(err) });
  }
}

/* Enregistre la nouvelle date (à appeler SOUS verrou). La séance quitte les
   anomalies, devient une séance future, et la synchro Zoom passe "en attente". */
function rptApplyNewDate_(token, slotId, slot, newDateISO, duree, event, req) {
  const patch = {
    date: newDateISO,
    duree: duree,
    originalDate: slot.originalDate || slot.date,
    rescheduleRequested: false,
    anomalie: false,
    anomalieHandled: false,          // la NOUVELLE séance sera suivie normalement
    clickedByStudent: null,
    clickedByTeacher: null,
    confirmed: false,
    reminderSent: false,
    reminderSentForDate: null,
    reminderActionToken: null,
    suivi: null,
    zoomSync: {
      status: "pending", targetDate: newDateISO, attempts: 0,
      requestedAt: new Date().toISOString(),
      pendingNewMeetingId: null, notifiedFor: null
    },
    rescheduleHistory: rptHistory_(slot, Object.assign({ from: slot.date, to: newDateISO }, event))
  };
  patch.rescheduleRequest = req
    ? Object.assign({}, req, { status: "accepted", acceptedAt: new Date().toISOString() })   /* jeton conservé : un 2e clic sur le lien répond « déjà confirmé » */
    : null;
  rptPatch_(slotId, token, patch);
  try {
    const parEleve = event && event.by === "student";
    const canal = event && event.via === "email" ? "email" : "plateforme";
    const details = { from: slot.date, to: newDateISO, motif: event && event.type, zoom: "synchronisation en cours", forfait: "aucun décompte supplémentaire" };
    const cle = "move|" + slot.date + ">" + newDateISO;
    if (req && req.by === "student") suiviJournaliser_(token, suiviEvenement_(slotId, slot, "lesson_reschedule_accepted", "administratrice", canal, "deplacement_demande", "deplace", details, cle), null);
    const ev = suiviEvenement_(slotId, slot, "lesson_rescheduled", parEleve ? "eleve" : "administratrice", canal, suiviStatut_(slot), "deplace", details, cle);
    suiviJournaliser_(token, ev, parEleve ? suiviNotification_(ev, `${slot.reservedName || "Un élève"} a accepté le nouvel horaire : ${suiviDateFr_(newDateISO)}.`, false) : null);
    suiviCloreDemandes_(token, slotId);
  } catch (e) { console.warn(e); }
}

/* ---------- 4. Synchronisation Zoom (idempotente) ---------- */
function rptZoomTransient_(msg) { const e = new Error(msg); e.transient = true; return e; }

function zoomRequest_(method, path, payload) {
  let token;
  try {
    token = getZoomAccessToken_();
    if (!token) throw new Error("jeton Zoom vide");
  } catch (e) {
    throw rptZoomTransient_("Authentification Zoom impossible : " + rptErrMsg_(e));
  }
  let res;
  try {
    const opts = { method: method, headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true };
    if (payload) { opts.contentType = "application/json"; opts.payload = JSON.stringify(payload); }
    res = UrlFetchApp.fetch("https://api.zoom.us/v2" + path, opts);
  } catch (e) {
    throw rptZoomTransient_("Zoom injoignable : " + rptErrMsg_(e));
  }
  const code = res.getResponseCode();
  if (code === 429 || code >= 500) throw rptZoomTransient_("Zoom indisponible (" + code + ")");
  const text = res.getContentText() || "";
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch (e) { body = null; }
  return { code: code, body: body, text: text };
}
function zoomPayload_(topic, startISO, duree) {
  return {
    topic: topic || "Cours de français",
    start_time: Utilities.formatDate(new Date(startISO), "Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss"),
    timezone: "Europe/Paris",                 // Zoom applique lui-même l'heure d'été / d'hiver
    duration: duree || 45
  };
}
function zoomCreate_(topic, startISO, duree) {
  const p = zoomPayload_(topic, startISO, duree);
  p.type = 2;
  p.settings = { join_before_host: true, waiting_room: true, approval_type: 2 };
  const r = zoomRequest_("post", "/users/me/meetings", p);
  if (r.code < 200 || r.code >= 300 || !r.body || !r.body.id) throw new Error("Création Zoom refusée (" + r.code + ") : " + r.text);
  return r.body;
}
/* Vérifie que Zoom a vraiment enregistré le bon horaire (tolérance 1 min). */
function zoomCheckStart_(meeting, startISO, occurrenceId) {
  let st = meeting && meeting.start_time;
  if (occurrenceId && meeting && Array.isArray(meeting.occurrences)) {
    const occ = meeting.occurrences.find(o => String(o.occurrence_id) === String(occurrenceId));
    st = occ && occ.start_time;
  }
  return !!st && Math.abs(new Date(st).getTime() - new Date(startISO).getTime()) <= 60000;
}
function rptMeetingShared_(token, meetingId, slotId) {
  const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }],
      where: { fieldFilter: { field: { fieldPath: "zoomMeetingId" }, op: "EQUAL", value: { stringValue: String(meetingId) } } } } }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) throw rptZoomTransient_("Firestore indisponible");
  return (JSON.parse(res.getContentText()) || []).filter(r => r.document && r.document.name.split("/").pop() !== slotId).length > 0;
}

/* Déplace la réunion existante ; sinon remplacement sécurisé. Retourne
   {method, meetingId, joinUrl, oldToDelete}. Lève une erreur .transient pour
   les pannes temporaires (nouvel essai automatique). */
function rptZoomMoveOrReplace_(slot, slotId, token, target, duree, topic, zs) {
  const currentId = String(slot.zoomMeetingId || extractZoomMeetingId_(slot.zoomJoinUrl) || "");

  /* Création d'une nouvelle réunion, mémorisée AVANT toute autre étape : si le
     script est interrompu, la reprise réutilise cette réunion (aucun doublon). */
  const createPersisted = () => {
    if (zs.pendingNewMeetingId) {
      const g = zoomRequest_("get", "/meetings/" + encodeURIComponent(zs.pendingNewMeetingId));
      if (g.code === 200 && g.body) {
        const pr = zoomRequest_("patch", "/meetings/" + encodeURIComponent(zs.pendingNewMeetingId), zoomPayload_(topic, target, duree));
        if (pr.code !== 204 && (pr.code < 200 || pr.code >= 300)) throw new Error("Mise à jour de la réunion de remplacement refusée (" + pr.code + ")");
        return { id: String(zs.pendingNewMeetingId), join_url: g.body.join_url };
      }
    }
    const m = zoomCreate_(topic, target, duree);
    zs.pendingNewMeetingId = String(m.id);
    rptPatch_(slotId, token, { zoomSync: Object.assign({}, zs, { pendingNewMeetingId: String(m.id), pendingNewJoinUrl: m.join_url }) });
    return { id: String(m.id), join_url: m.join_url };
  };

  if (zs.pendingNewMeetingId && zs.pendingNewMeetingId !== currentId) {
    const m = createPersisted();
    return { method: "replaced", meetingId: m.id, joinUrl: m.join_url, oldToDelete: currentId || null };
  }
  if (!currentId) {
    const m = createPersisted();
    return { method: "created", meetingId: m.id, joinUrl: m.join_url, oldToDelete: null };
  }

  const g = zoomRequest_("get", "/meetings/" + encodeURIComponent(currentId));
  if (g.code === 404 || (g.code >= 400 && g.code < 500 && g.code !== 401 && g.code !== 403)) {
    const m = createPersisted();                            // réunion d'origine introuvable : on la recrée
    return { method: "recreated", meetingId: m.id, joinUrl: m.join_url, oldToDelete: null };
  }
  if (g.code < 200 || g.code >= 300 || !g.body) throw rptZoomTransient_("Lecture de la réunion Zoom impossible (" + g.code + ")");
  const meeting = g.body;

  /* Réunion récurrente : on ne déplace JAMAIS toute la série. */
  if (meeting.type === 3 || meeting.type === 8) {
    if (slot.zoomOccurrenceId) {
      const pr = zoomRequest_("patch", "/meetings/" + encodeURIComponent(currentId) + "?occurrence_id=" + encodeURIComponent(slot.zoomOccurrenceId), zoomPayload_(topic, target, duree));
      if (pr.code === 204 || (pr.code >= 200 && pr.code < 300)) {
        const v = zoomRequest_("get", "/meetings/" + encodeURIComponent(currentId) + "?show_previous_occurrences=true");
        if (v.code === 200 && zoomCheckStart_(v.body, target, slot.zoomOccurrenceId)) {
          return { method: "occurrence", meetingId: currentId, joinUrl: meeting.join_url || slot.zoomJoinUrl, oldToDelete: null };
        }
      }
    }
    const m = createPersisted();                            // séance détachée de la série, série intacte
    return { method: "dedicated", meetingId: m.id, joinUrl: m.join_url, oldToDelete: null };
  }
  /* Réunion partagée par plusieurs séances : on ne la déplace pas. */
  if (rptMeetingShared_(token, currentId, slotId)) {
    const m = createPersisted();
    return { method: "dedicated", meetingId: m.id, joinUrl: m.join_url, oldToDelete: null };
  }

  const pr = zoomRequest_("patch", "/meetings/" + encodeURIComponent(currentId), zoomPayload_(topic, target, duree));
  if (pr.code === 204 || (pr.code >= 200 && pr.code < 300)) {
    const v = zoomRequest_("get", "/meetings/" + encodeURIComponent(currentId));
    if (v.code === 200 && zoomCheckStart_(v.body, target)) {
      return { method: "updated", meetingId: currentId, joinUrl: meeting.join_url || slot.zoomJoinUrl, oldToDelete: null };
    }
    throw rptZoomTransient_("Zoom n'a pas encore pris en compte le nouvel horaire");
  }
  /* Modification refusée définitivement (ex. réunion verrouillée) : remplacement. */
  const m = createPersisted();
  return { method: "replaced", meetingId: m.id, joinUrl: m.join_url, oldToDelete: currentId };
}

function rptDeleteOldMeeting_(meetingId) {
  if (!meetingId) return true;
  try {
    const r = zoomRequest_("delete", "/meetings/" + encodeURIComponent(meetingId));
    return r.code === 204 || r.code === 404 || (r.code >= 200 && r.code < 300);
  } catch (e) { return false; }
}

function rptSyncZoom_(slotId) {
  let out;
  try {
    out = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(slotId, token);
      const zs = Object.assign({}, slot.zoomSync || {});
      if (!slot.reservedBy || slot.experimentalCancelled || slot.definitivelyCancelled) return { status: "skipped" };
      const target = slot.date;
      if (zs.status === "ok" && zs.targetDate === target) {
        return { status: "ok", already: true, joinUrl: slot.zoomJoinUrl, slot: slot, zs: zs };
      }
      if (zs.targetDate !== target) { zs.attempts = 0; }   /* une réunion de remplacement déjà créée est réutilisée */
      zs.targetDate = target;
      zs.attempts = (zs.attempts || 0) + 1;
      zs.lastAttemptAt = new Date().toISOString();
      const duree = rptDuree_(slot.duree);
      const topic = String(slot.zoomTopic || ("Cours de français avec " + (slot.reservedName || "élève"))).slice(0, 160);
      try {
        const r = rptZoomMoveOrReplace_(slot, slotId, token, target, duree, topic, zs);
        let cleanup = null;
        if (r.oldToDelete && r.oldToDelete !== r.meetingId) cleanup = rptDeleteOldMeeting_(r.oldToDelete) ? null : r.oldToDelete;
        const newZs = { status: "ok", targetDate: target, attempts: zs.attempts, method: r.method, meetingId: r.meetingId,
          syncedAt: new Date().toISOString(), lastError: null, nextAttemptAt: null, pendingNewMeetingId: null,
          notifiedFor: zs.notifiedFor || null, oldMeetingToDelete: cleanup, cleanup: !!cleanup };
        rptPatch_(slotId, token, {
          zoomJoinUrl: r.joinUrl, zoomMeetingId: r.meetingId, zoomTopic: topic, zoomSync: newZs,
          rescheduleHistory: rptHistory_(slot, { type: "zoom_synced", method: r.method, to: target, meetingId: r.meetingId })
        });
        return { status: "ok", method: r.method, joinUrl: r.joinUrl, slot: slot, zs: newZs, cleanupPending: !!cleanup };
      } catch (err) {
        const transient = err && err.transient === true;
        const status = transient && zs.attempts < RPT_MAX_ZOOM_ATTEMPTS_ ? "retry" : "error";
        const delay = RPT_RETRY_DELAYS_MIN_[Math.min(zs.attempts - 1, RPT_RETRY_DELAYS_MIN_.length - 1)];
        const newZs = Object.assign({}, zs, { status: status, lastError: rptErrMsg_(err).slice(0, 300),
          nextAttemptAt: status === "retry" ? new Date(Date.now() + delay * 60000).toISOString() : null });
        rptPatch_(slotId, token, { zoomSync: newZs,
          rescheduleHistory: rptHistory_(slot, { type: "zoom_" + status, to: target, error: newZs.lastError, attempt: zs.attempts }) });
        return { status: status, error: newZs.lastError, slot: slot, zs: newZs };
      }
    });
  } catch (err) {
    /* Verrou indisponible ou Firestore en panne : rien n'a été modifié côté Zoom ;
       le statut reste "pending" et le déclencheur réessaiera. */
    return { status: "pending", error: rptErrMsg_(err) };
  }

  if (out.status === "ok" && !out.already && out.slot && out.slot.reservedEmail && out.zs.notifiedFor !== out.slot.date) {
    try {
      const token = getFirestoreAccessToken_();
      const tz = getStudentTimezone_(fsBase_(), out.slot.reservedBy, token) || "America/Sao_Paulo";
      const fromDate = rptLastFromDate_(out.slot);
      sendRescheduleConfirmedEmail_(out.slot.reservedEmail, out.slot.reservedName,
        fromDate ? formatDateInTimezone_(new Date(fromDate), tz) : "",
        formatDateInTimezone_(new Date(out.slot.date), tz));
      rptPatch_(slotId, token, { zoomSync: Object.assign({}, out.zs, { notifiedFor: out.slot.date }) });
    } catch (e) { console.warn("Confirmation élève non envoyée :", e); }
  }
  if (out.status === "error") {
    try { sendTeacherZoomErrorEmail_(out.slot, slotId, out.error); } catch (e) { console.warn(e); }
  }
  return { status: out.status, method: out.method, joinUrl: out.joinUrl, error: out.error };
}
function rptLastFromDate_(slot) {
  const h = Array.isArray(slot.rescheduleHistory) ? slot.rescheduleHistory : [];
  for (let i = h.length - 1; i >= 0; i--) {
    if (h[i] && h[i].to === slot.date && h[i].from && h[i].from !== slot.date && h[i].type !== "zoom_synced") return h[i].from;
  }
  return null;
}

/* Déclencheur (toutes les 10 min) : reprend les synchronisations en attente
   ou en échec temporaire, et supprime les anciennes réunions restées actives. */
function retryZoomSyncs() {
  try { reprendreSuivi_(); } catch (e) { console.warn("reprise des événements : " + rptErrMsg_(e)); }
  const token = getFirestoreAccessToken_();
  const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }],
      where: { fieldFilter: { field: { fieldPath: "zoomSync.status" }, op: "IN",
        value: { arrayValue: { values: [{ stringValue: "pending" }, { stringValue: "retry" }] } } } } } }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) throw new Error("retryZoomSyncs : " + res.getContentText());
  const now = Date.now();
  (JSON.parse(res.getContentText()) || []).filter(r => r.document).forEach(r => {
    const id = r.document.name.split("/").pop();
    const zs = (firestoreFieldsToJs_(r.document.fields || {}).zoomSync) || {};
    const due = zs.status === "pending"
      ? now - new Date(zs.lastAttemptAt || zs.requestedAt || 0).getTime() > 2 * 60000
      : !zs.nextAttemptAt || new Date(zs.nextAttemptAt).getTime() <= now;
    if (due) rptSyncZoom_(id);
  });
  /* Nettoyage des anciennes réunions non supprimées */
  const res2 = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }],
      where: { fieldFilter: { field: { fieldPath: "zoomSync.cleanup" }, op: "EQUAL", value: { booleanValue: true } } } } }),
    muteHttpExceptions: true
  });
  if (res2.getResponseCode() >= 200 && res2.getResponseCode() < 300) {
    (JSON.parse(res2.getContentText()) || []).filter(r => r.document).forEach(r => {
      const id = r.document.name.split("/").pop();
      const zs = (firestoreFieldsToJs_(r.document.fields || {}).zoomSync) || {};
      if (zs.oldMeetingToDelete && rptDeleteOldMeeting_(zs.oldMeetingToDelete)) {
        rptPatch_(id, token, { zoomSync: Object.assign({}, zs, { oldMeetingToDelete: null, cleanup: false }) });
      }
    });
  }
}

/* Relance manuelle depuis l'espace enseignante. */
function handleRetryZoomSync(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    if (!data.slotId) throw new Error("slotId manquant");
    const token = getFirestoreAccessToken_();
    const slot = rptLoadSlot_(data.slotId, token);
    if (slot.zoomSync && slot.zoomSync.status === "error") {
      rptPatch_(data.slotId, token, { zoomSync: Object.assign({}, slot.zoomSync, { status: "retry", attempts: 0, nextAttemptAt: null }) });
    }
    const zr = rptSyncZoom_(data.slotId);
    return jsonResponse({ ok: zr.status === "ok", zoomStatus: zr.status, error: zr.error || null, joinUrl: zr.joinUrl || null });
  } catch (err) {
    return jsonResponse({ ok: false, error: rptErrMsg_(err) });
  }
}

/* ---------- 5. E-mails ---------- */
function sendProposalEmail_(slot, slotId, proposal, rappel) {
  const token = getFirestoreAccessToken_();
  const tz = getStudentTimezone_(fsBase_(), slot.reservedBy, token) || "America/Sao_Paulo";
  const oldStr = formatDateInTimezone_(new Date(slot.date), tz);
  const newStr = formatDateInTimezone_(new Date(proposal.proposedDate), tz);
  const acceptUrl = reminderActionUrl_("acceptproposal", slotId, proposal.emailToken);
  const refuseUrl = reminderActionUrl_("refuseproposal", slotId, proposal.emailToken);
  const prenom = slot.reservedName || "";
  const intro = slot.anomalie === true
    ? "Ta séance du " + oldStr + " n'a pas pu avoir lieu. Je te propose de la reporter au :"
    : "Je te propose de déplacer ton cours du " + oldStr + " au :";
  const corps =
    `Bonjour ${prenom},\n\n${intro}\n${newStr}\n\n` +
    `ACCEPTER CE NOUVEL HORAIRE :\n${acceptUrl}\n\nREFUSER :\n${refuseUrl}\n\n` +
    `Tu peux aussi répondre depuis ton espace de cours. Tant que tu n'as pas accepté, le cours n'est pas déplacé.\n\nÀ bientôt,\nMelissa`;
  const html =
    `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#20232b;max-width:620px;">` +
    `<p>Bonjour ${escapeHtml_(prenom)},</p><p>${escapeHtml_(intro)}</p>` +
    `<p style="font-size:17px;"><strong>${escapeHtml_(newStr)}</strong></p>` +
    actionButton_("Accepter ce nouvel horaire", acceptUrl, "#167c5a") +
    actionButton_("Refuser", refuseUrl, "#b4233d") +
    `<p style="font-size:13px;color:#666;">Tu peux aussi répondre depuis ton espace de cours. Tant que tu n'as pas accepté, le cours n'est pas déplacé.</p>` +
    `<p>À bientôt,<br>Melissa</p></div>`;
  const sujet = rappel ? "Rappel : réponds à la proposition de nouveau créneau" : "Nouveau créneau proposé pour ton cours";
  MailApp.sendEmail(slot.reservedEmail, sujet, rappel ? "(Rappel) " + corps : corps, { htmlBody: rappel ? `<p style="font-family:Arial,sans-serif;color:#8A5A12;"><strong>Rappel</strong> — tu n'as pas encore répondu à cette proposition.</p>` + html : html });
}
function sendTeacherProposalAnswerEmail_(slot, req, accepted, zoomStatus) {
  const name = slot.reservedName || "L'élève";
  const when = req && req.proposedDate ? formatDateFr_(new Date(req.proposedDate)) : "";
  const sujet = accepted ? `${name} a accepté le report` : `${name} a refusé le report proposé`;
  const zoomLine = accepted
    ? (zoomStatus === "ok" ? "La réunion Zoom a été synchronisée automatiquement." : "⚠️ Synchronisation Zoom en attente (" + (zoomStatus || "?") + ") : elle sera retentée automatiquement.")
    : "La séance reste dans les anomalies à traiter : tu peux proposer une autre date depuis ton espace.";
  MailApp.sendEmail(TEACHER_EMAIL, sujet,
    `Bonjour Melissa,\n\n${name} a ${accepted ? "accepté" : "refusé"} le créneau du ${when}.\n${zoomLine}\n\nLa plateforme FLE`);
}
function sendTeacherZoomErrorEmail_(slot, slotId, error) {
  MailApp.sendEmail(TEACHER_EMAIL, "⚠️ Synchronisation Zoom impossible — " + ((slot && slot.reservedName) || "séance"),
    `Bonjour Melissa,\n\nLa réunion Zoom de la séance du ${slot && slot.date ? formatDateFr_(new Date(slot.date)) : "?"} (${slot && slot.reservedName || ""}) n'a pas pu être synchronisée après plusieurs essais.\n` +
    `Erreur : ${error}\n\nLa date est bien enregistrée sur la plateforme, mais le lien Zoom n'est pas affiché à l'élève. ` +
    `Utilise le bouton « Relancer la synchronisation Zoom » dans ton espace (séance ${slotId}).\n\nLa plateforme FLE`);
}

/* ---------- 6. Page ouverte depuis les boutons de l'e-mail de proposition ---------- */
function renderProposalPage_(action, slotId, token) {
  const accept = action === "acceptproposal";
  const title = accept ? "Accepter le nouvel horaire" : "Refuser le nouvel horaire";
  const message = accept
    ? "Confirme que le nouvel horaire te convient. Ton cours sera déplacé et la réunion Zoom mise à jour automatiquement."
    : "Confirme que ce nouvel horaire ne te convient pas. Melissa te proposera une autre date.";
  const button = accept ? "Oui, j'accepte" : "Je refuse ce créneau";
  return HtmlService.createHtmlOutput(
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>` +
    `<body style="font-family:Arial,sans-serif;background:#f5f6fa;margin:0;padding:30px 15px;color:#1d2433;">` +
    `<div style="max-width:500px;margin:50px auto;background:#fff;border-radius:16px;padding:35px;box-shadow:0 8px 30px rgba(0,0,0,.08);">` +
    `<h1 style="font-size:24px;text-align:center;">${escapeHtml_(title)}</h1><p style="line-height:1.6;color:#555;">${escapeHtml_(message)}</p>` +
    `<button id="b" style="width:100%;margin-top:20px;padding:14px;border:0;border-radius:10px;background:${accept ? "#167c5a" : "#b4233d"};color:#fff;font-size:15px;font-weight:bold;cursor:pointer;" onclick="go()">${escapeHtml_(button)}</button>` +
    `<div id="r" style="margin-top:20px;text-align:center;"></div></div>` +
    `<script>function go(){var b=document.getElementById('b'),r=document.getElementById('r');b.disabled=true;b.textContent='Traitement…';` +
    `google.script.run.withSuccessHandler(function(m){b.style.display='none';r.innerHTML='<p><strong>'+m+'</strong></p>';})` +
    `.withFailureHandler(function(e){b.disabled=false;b.textContent=${JSON.stringify(button)};r.innerHTML='<p style="color:#b00020">'+e.message+'</p>';})` +
    `.processProposalAction(${JSON.stringify(action)},${JSON.stringify(slotId)},${JSON.stringify(token)});}</script></body></html>`);
}


/* ============================================================================
   RELANCES DES PROPOSITIONS DE REPORT
   - Manuelle (bouton « Relancer l'élève ») : au plus une toutes les 12 h.
   - Automatique (déclencheur relancerPropositionsAuto, une fois par jour) : après
     config/plateforme.relances.delaiJours jours sans réponse (2 par défaut), au plus
     relances.max fois (2 par défaut) ; désactivable avec relances.actif = false.
   Une relance renvoie le MÊME lien (même jeton) : aucune nouvelle proposition n'est créée.
   Une absence de réponse n'est jamais une acceptation. Le forfait n'est jamais modifié.
   ============================================================================ */
const RPT_RELANCE_MIN_MS_ = 12 * 3600 * 1000;
const RPT_RELANCE_TOTAL_MAX_ = 6;

function rptRelancer_(slotId, via) {
  return rptWithLock_(() => {
    const token = getFirestoreAccessToken_();
    const slot = rptLoadSlot_(slotId, token);
    const req = slot.rescheduleRequest || null;
    if (!req || req.by !== "teacher" || req.status !== "pending") throw new Error("Aucune proposition en attente de réponse pour ce cours.");
    if (!slot.reservedEmail) throw new Error("Pas d'adresse e-mail pour cet élève : relance impossible par e-mail.");
    if (req.expiresAt && new Date(req.expiresAt).getTime() <= Date.now()) throw new Error("Cette proposition a expiré : propose une nouvelle date.");
    const last = req.lastReminderAt ? new Date(req.lastReminderAt).getTime() : 0;
    if (last && Date.now() - last < RPT_RELANCE_MIN_MS_) throw new Error("Une relance a déjà été envoyée il y a moins de 12 heures.");
    const n = Number(req.reminders || 0);
    if (n >= RPT_RELANCE_TOTAL_MAX_) throw new Error("Nombre maximal de relances atteint pour cette proposition.");
    sendProposalEmail_(slot, slotId, req, true);
    const now = new Date().toISOString();
    const upd = Object.assign({}, req, { reminders: n + 1, lastReminderAt: now });
    if (via === "auto") upd.autoReminders = Number(req.autoReminders || 0) + 1;
    rptPatch_(slotId, token, {
      rescheduleRequest: upd,
      rescheduleHistory: rptHistory_(slot, { type: "reminder", via: via, proposalId: req.id || null, n: n + 1 })
    });
    return { ok: true, reminders: n + 1 };
  });
}
function handleRemindProposal(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    if (!data.slotId) throw new Error("slotId manquant");
    return jsonResponse(rptRelancer_(data.slotId, "manuel"));
  } catch (err) {
    return jsonResponse({ ok: false, error: rptErrMsg_(err) });
  }
}
function relancerPropositionsAuto() {
  const token = getFirestoreAccessToken_();
  let cfg = { actif: true, delaiJours: 2, max: 2 };
  try {
    const doc = getFirestoreDocument_(fsBase_(), "config", "plateforme", token);
    const r = (firestoreFieldsToJs_(doc.fields || {}).relances) || {};
    cfg = { actif: r.actif !== false, delaiJours: Math.max(1, Number(r.delaiJours) || 2), max: Math.max(0, Math.min(5, Number(r.max) || 2)) };
  } catch (e) { /* valeurs par défaut */ }
  if (!cfg.actif || !cfg.max) return { sent: 0 };
  const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }],
      where: { fieldFilter: { field: { fieldPath: "rescheduleRequest.status" }, op: "EQUAL", value: { stringValue: "pending" } } } } }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) throw new Error("relancerPropositionsAuto : " + res.getContentText());
  let sent = 0;
  const now = Date.now();
  (JSON.parse(res.getContentText()) || []).filter(r => r.document).forEach(r => {
    const id = r.document.name.split("/").pop();
    const slot = firestoreFieldsToJs_(r.document.fields || {});
    const req = slot.rescheduleRequest || {};
    if (req.by !== "teacher" || !slot.reservedEmail) return;
    if (Number(req.autoReminders || 0) >= cfg.max) return;
    if (req.expiresAt && new Date(req.expiresAt).getTime() <= now) return;
    const depuis = new Date(req.lastReminderAt || req.createdAt || 0).getTime();
    if (now - depuis < cfg.delaiJours * 86400000) return;
    try { rptRelancer_(id, "auto"); sent++; } catch (e) { console.warn("Relance automatique impossible pour " + id + " : " + rptErrMsg_(e)); }
  });
  return { sent: sent };
}


/* ============================================================================
   SUIVI DES COURS — SERVICE CENTRAL DES CHANGEMENTS DE STATUT
   Toutes les réponses (e-mail de rappel, espace élève, espace professeure,
   automatisations) passent par coursAction_ / coursAnnuler_ :
   - même contrôle et même résultat quel que soit le canal ;
   - verrou (LockService) + vérification de l'état : un double clic ou un
     événement reçu deux fois ne produit qu'une seule action ;
   - chaque action crée un ÉVÉNEMENT (collection evenementsCours, ajout seul,
     identifiant déterministe → jamais de doublon) et, pour les actions des
     élèves et des automatisations, une NOTIFICATION pour Melissa
     (collection notificationsProf) ;
   - « enregistré » n'est affiché que si Firestore a confirmé l'écriture de la
     séance ; si l'événement ne peut pas être écrit, il est mis en file et
     repris par le déclencheur retryZoomSyncs (toutes les 10 minutes).
   Le statut de suivi d'une séance est dans disponibilites/{id}.suivi :
     { statut, at, canal, par, eleveId, date }  — valable seulement pour la
     réservation en cours (même élève, même date).
   ============================================================================ */
const SUIVI_LIBELLES_ = {
  confirme: "Confirmé", annule: "Annulé", annule_tardif: "Annulé tardivement", annule_auto: "Annulé automatiquement (non confirmé)",
  deplacement_demande: "Déplacement demandé", en_attente: "En attente de réponse",
  report_propose: "Nouvelle date proposée", proposition_refusee: "Proposition refusée par l'élève"
};
function suiviHash_(s) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619) >>> 0; h2 = Math.imul(h2 ^ c, 2246822519) >>> 0; }
  return ("00000000" + h1.toString(16)).slice(-8) + ("00000000" + h2.toString(16)).slice(-8);
}
function suiviStatut_(slot) {
  const s = slot.suivi || {};
  const annule = String(s.statut || "").indexOf("annule") === 0;
  if (s.statut && s.eleveId === slot.reservedBy && s.date === slot.date && (!annule || slot.definitivelyCancelled || slot.experimentalCancelled)) return s.statut;
  if (slot.rescheduleRequest && slot.rescheduleRequest.by === "student" && slot.rescheduleRequest.status === "pending") return "deplacement_demande";
  return slot.confirmed === true ? "confirme" : "en_attente";
}
function suiviDocName_(coll, id) { return `projects/${FS_PROJECT_}/databases/(default)/documents/${coll}/${id}`; }
function suiviFields_(obj) { const f = {}; Object.keys(obj).forEach(k => f[k] = jsToFirestoreValue_(obj[k])); return f; }
/* Écrit l'événement (et la notification) en une seule opération ; un identifiant déjà
   présent signifie « déjà enregistré » (idempotence), pas une erreur. */
function suiviEcrire_(token, ev, notif) {
  const writes = [{ update: { name: suiviDocName_("evenementsCours", ev.id), fields: suiviFields_(ev) }, currentDocument: { exists: false } }];
  if (notif) writes.push({ update: { name: suiviDocName_("notificationsProf", notif.id), fields: suiviFields_(notif) }, currentDocument: { exists: false } });
  const res = UrlFetchApp.fetch(`${fsBase_()}:commit`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ writes: writes }), muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code >= 200 && code < 300) return { ok: true };
  if (code === 409 || /ALREADY_EXISTS|FAILED_PRECONDITION/.test(res.getContentText())) return { ok: true, doublon: true };
  throw new Error("Firestore commit " + code);
}
function suiviFile_() { return PropertiesService.getScriptProperties(); }
function suiviJournaliser_(token, ev, notif) {
  try { return suiviEcrire_(token, ev, notif); }
  catch (e) {
    console.warn("Événement mis en file pour reprise : " + rptErrMsg_(e));
    try {
      const p = suiviFile_();
      const file = JSON.parse(p.getProperty("SUIVI_A_REPRENDRE") || "[]");
      if (!file.some(x => x.ev.id === ev.id)) file.push({ ev: ev, notif: notif || null });
      p.setProperty("SUIVI_A_REPRENDRE", JSON.stringify(file.slice(-200)));
    } catch (e2) { console.warn("File de reprise indisponible : " + rptErrMsg_(e2)); }
    return { ok: false, enFile: true };
  }
}
function reprendreSuivi_() {
  let p, file;
  try { p = suiviFile_(); file = JSON.parse(p.getProperty("SUIVI_A_REPRENDRE") || "[]"); } catch (e) { return 0; }
  if (!file.length) return 0;
  const token = getFirestoreAccessToken_();
  const reste = [];
  file.forEach(x => { try { suiviEcrire_(token, x.ev, x.notif); } catch (e) { reste.push(x); } });
  p.setProperty("SUIVI_A_REPRENDRE", JSON.stringify(reste));
  return file.length - reste.length;
}
/* Construit l'événement normalisé (champs demandés) et, si utile, la notification. */
function suiviEvenement_(slotId, slot, type, auteur, canal, ancien, nouveau, details, cle) {
  const at = new Date().toISOString();
  const id = (type + "_" + suiviHash_([slotId, type, cle || "", slot.date || ""].join("|"))).slice(0, 120);
  return {
    id: id, type: type, at: at,
    eleveId: slot.reservedBy || (details && details.eleveId) || null,
    eleveNom: slot.reservedName || (details && details.eleveNom) || null,
    seanceId: slotId, packId: slot.packId || null, isPack: slot.isPack === true,
    coursDate: (details && details.coursDate) || slot.date || null,
    canal: canal, auteur: auteur,
    ancienStatut: ancien || null, nouveauStatut: nouveau || null,
    resultat: "ok",
    details: details ? JSON.stringify(details).slice(0, 1500) : ""
  };
}
function suiviNotification_(ev, message, actionRequise) {
  return { id: "n_" + ev.id, eventId: ev.id, type: ev.type, message: message, seanceId: ev.seanceId,
    eleveId: ev.eleveId, eleveNom: ev.eleveNom, coursDate: ev.coursDate, at: ev.at, lu: false, actionRequise: actionRequise === true };
}
function suiviDateFr_(iso) { try { return formatDateInTimezone_(new Date(iso), "Europe/Paris"); } catch (e) { return iso; } }

/* ---- Point d'entrée unique : confirmer, demander un déplacement, annuler ----
   actor = { role: "eleve" | "administratrice", uid, via: "email" | "plateforme", token } */
function coursAction_(slotId, type, actor, extra) {
  extra = extra || {};
  let r;
  try {
    r = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      let slot;
      try { slot = rptLoadSlot_(slotId, token); } catch (e) { throw new Error("Ce cours est introuvable ou le service est momentanément indisponible. Réessaie dans quelques minutes : rien n'a été modifié."); }
      const canal = actor.via === "email" ? "email" : "plateforme";
      /* Lien d'e-mail : jeton propre au rappel ET à la date du cours (un cours déplacé invalide l'ancien lien). */
      if (actor.via === "email") {
        const s = slot.suivi || {};
        if (s.token && s.token === actor.token && String(s.statut || "").indexOf("annule") === 0) return { ok: true, already: true, message: "Ce cours est déjà annulé. Ta réponse avait bien été enregistrée." };
        if (!slot.reminderActionToken || slot.reminderActionToken !== actor.token || (slot.reminderSentForDate && slot.reminderSentForDate !== slot.date)) {
          throw new Error("Ce lien n'est plus valide (le cours a peut-être été déplacé, annulé ou un rappel plus récent a été envoyé). Utilise le dernier e-mail reçu ou ton espace de cours.");
        }
      }
      if (!slot.reservedBy || slot.experimentalCancelled || slot.definitivelyCancelled) return { ok: true, already: true, message: "Ce cours est déjà annulé." };
      if (actor.role === "eleve" && actor.via !== "email" && slot.reservedBy !== actor.uid) throw new Error("Ce cours ne t'appartient pas.");
      const start = new Date(slot.date).getTime();
      if (!(start > Date.now())) throw new Error("Ce cours a déjà commencé ou est passé : il ne peut plus être modifié ici.");
      const hoursBefore = (start - Date.now()) / 3600000;
      const ancien = suiviStatut_(slot);
      const par = actor.role === "administratrice" ? "administratrice" : "eleve";
      const auteur = par === "administratrice" ? "administratrice" : "eleve";

      if (type === "confirm") {
        if (ancien === "confirme") return { ok: true, already: true, message: "Ton cours était déjà confirmé. À bientôt !" };
        const at = new Date().toISOString();
        rptPatch_(slotId, token, { confirmed: true, confirmedAt: at, suivi: { statut: "confirme", at: at, canal: canal, par: par, eleveId: slot.reservedBy, date: slot.date, token: actor.token || null } });
        const ev = suiviEvenement_(slotId, slot, par === "administratrice" ? "lesson_status_corrected" : "lesson_confirmed", auteur, canal, ancien, "confirme", null, "confirm|" + slot.reservedBy);
        suiviJournaliser_(token, ev, par === "eleve" ? suiviNotification_(ev, `${slot.reservedName || "Un élève"} a confirmé son cours du ${suiviDateFr_(slot.date)}.`, false) : null);
        return { ok: true, statut: "confirme", message: "Ton cours est bien confirmé. À bientôt !" };
      }

      if (type === "reschedule_request") {
        if (hoursBefore < 1) throw new Error("Le délai d'une heure est dépassé : il n'est plus possible de demander le déplacement de ce cours.");
        const req = slot.rescheduleRequest || {};
        if (req.status === "pending" && req.by === "student") return { ok: true, already: true, message: "Ta demande de déplacement avait déjà été envoyée. Melissa te répondra." };
        if (req.status === "pending" && req.by === "teacher") throw new Error("Melissa t'a déjà proposé une nouvelle date pour ce cours : réponds à sa proposition dans ton espace ou dans son e-mail.");
        let av = Array.isArray(extra.availability) ? extra.availability.map(v => String(v || "").trim()) : [];
        if (av.length !== 3 || av.some(v => !v)) throw new Error("Tu dois proposer exactement 3 disponibilités.");
        if (new Set(av).size !== 3) throw new Error("Les 3 disponibilités doivent être différentes.");
        av = av.map(v => { const d = new Date(v); if (isNaN(d.getTime())) throw new Error("Une des disponibilités n'est pas valide."); if (d.getTime() <= Date.now()) throw new Error("Les disponibilités proposées doivent être dans le futur."); return d.toISOString(); });
        if (new Set(av).size !== 3) throw new Error("Les 3 disponibilités doivent être différentes.");
        const at = new Date().toISOString();
        rptPatch_(slotId, token, {
          rescheduleRequested: true, rescheduleRequestedAt: at,
          rescheduleAvailability1: av[0], rescheduleAvailability2: av[1], rescheduleAvailability3: av[2],
          rescheduleRequest: { by: "student", status: "pending", availability1: av[0], availability2: av[1], availability3: av[2], proposedDate: null, proposedDuree: slot.duree || 45, requestedAt: at, via: canal },
          rescheduleHistory: rptHistory_(slot, { type: "student_request", via: canal, availability: av }),
          suivi: { statut: "deplacement_demande", at: at, canal: canal, par: par, eleveId: slot.reservedBy, date: slot.date, token: actor.token || null }
        });
        const ev = suiviEvenement_(slotId, slot, "lesson_reschedule_requested", auteur, canal, ancien, "deplacement_demande", { disponibilites: av }, "resched|" + av.join(","));
        suiviJournaliser_(token, ev, suiviNotification_(ev, `${slot.reservedName || "Un élève"} demande à déplacer son cours du ${suiviDateFr_(slot.date)} (3 disponibilités proposées).`, true));
        return { ok: true, statut: "deplacement_demande", slot: slot, av: av, message: "Ta demande de déplacement est enregistrée. Ton cours reste réservé tant que Melissa n'a pas validé un nouveau créneau." };
      }

      if (type === "cancel") {
        if (actor.via === "email" && hoursBefore < 1) throw new Error("Le délai d'une heure est dépassé. Le cours ne peut plus être annulé.");
        return coursAnnuler_(token, slotId, slot, par === "administratrice" ? "teacher" : "student", canal, { token: actor.token || null });
      }
      throw new Error("Action inconnue.");
    });
  } catch (err) {
    return { ok: false, error: rptErrMsg_(err) };
  }
  /* E-mails après le verrou (non bloquants). */
  try {
    if (r.statut === "deplacement_demande" && !r.already) suiviMailDeplacement_(r.slot, r.av);
    if (r.mailAnnulation) MailApp.sendEmail({ to: TEACHER_EMAIL, subject: "Cours annulé — " + (r.mailAnnulation.nom || "Élève"), htmlBody: `<p><strong>${escapeHtml_(r.mailAnnulation.nom || "Un élève")}</strong> a annulé son cours du ${escapeHtml_(suiviDateFr_(r.mailAnnulation.date))} (${escapeHtml_(r.mailAnnulation.canal)}).</p>` });
  } catch (e) { console.warn(e); }
  return r;
}
function suiviMailDeplacement_(slot, av) {
  const token = getFirestoreAccessToken_();
  const tz = getStudentTimezone_(fsBase_(), slot.reservedBy, token) || "America/Sao_Paulo";
  const f = iso => formatDateInTimezone_(new Date(iso), tz);
  MailApp.sendEmail({
    to: TEACHER_EMAIL, subject: "Demande de replanification — " + (slot.reservedName || "Élève"),
    htmlBody: `<p><strong>${escapeHtml_(slot.reservedName || "Un élève")}</strong> souhaite déplacer son cours.</p>` +
      `<p><strong>Cours actuel :</strong><br>${escapeHtml_(f(slot.date))}</p><p><strong>3 disponibilités proposées :</strong></p>` +
      `<ol>${av.map(x => "<li>" + escapeHtml_(f(x)) + "</li>").join("")}</ol><p>Réponds depuis ta plateforme (Cours › Confirmations et demandes).</p>`
  });
}

/* ---- Annulation (règle unique pour l'e-mail, la plateforme, la professeure et l'automatisation) ----
   Annulation à moins d'une heure (ou automatique faute de confirmation) = tardive : deux
   tolérances sur 30 jours glissants ; au-delà, la séance est décomptée si c'est l'élève
   (definitivelyCancelled + cancelledBy "student"), remboursement dû si c'est la professeure. */
function coursAnnuler_(token, slotId, slot, by, canal, opts) {
  opts = opts || {};
  const ancien = suiviStatut_(slot);
  const at = new Date().toISOString();
  const start = new Date(slot.date).getTime();
  const auto = opts.auto === true;
  const auteur = auto ? "automatisation" : (by === "teacher" ? "administratrice" : "eleve");
  if (slot.isExperimental === true) {
    patchFirestoreFields_(fsBase_(), "disponibilites", slotId, token, {
      experimentalCancelled: { booleanValue: true }, experimentalCancelledBy: { stringValue: by === "teacher" ? "teacher" : (slot.reservedBy || "") },
      confirmed: { booleanValue: false }, reminderActionToken: { nullValue: null }, zoomJoinUrl: { nullValue: null }, cancelledAt: { stringValue: at },
      suivi: jsToFirestoreValue_({ statut: "annule", at: at, canal: canal, par: auteur, eleveId: slot.reservedBy, date: slot.date, token: opts.token || null })
    });
    const ev = suiviEvenement_(slotId, slot, "lesson_cancelled", auteur, canal, ancien, "annule", { coursExperimental: true }, "cancel");
    suiviJournaliser_(token, ev, auteur === "administratrice" ? null : suiviNotification_(ev, `${slot.reservedName || "Un élève"} a annulé son cours expérimental du ${suiviDateFr_(slot.date)}.`, false));
    return { ok: true, statut: "annule", message: "Ton cours expérimental a bien été annulé.", excessive: false, refundDue: false, mailAnnulation: auteur === "eleve" ? { nom: slot.reservedName, date: slot.date, canal: canal } : null };
  }
  const studentDoc = getFirestoreDocument_(fsBase_(), "eleves", slot.reservedBy, token);
  const studentData = firestoreFieldsToJs_(studentDoc.fields || {});
  const log = Array.isArray(studentData.noShowLog) ? studentData.noShowLog : [];
  const isLate = auto || (Number.isFinite(start) && (start - Date.now()) < 3600000);
  let excessive = false, refundDue = false, recentCount = 0;
  if (isLate) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
    recentCount = log.filter(x => x && x.by === by && x.late === true && new Date(x.ts).getTime() >= thirtyDaysAgo).length;
    log.push({ ts: at, by: by, late: true, seance: slotId, coursDate: slot.date, motif: auto ? "non_confirme" : "annulation_tardive" });
    patchFirestoreFields_(fsBase_(), "eleves", slot.reservedBy, token, { noShowLog: jsToFirestoreValue_(log) });
    excessive = recentCount + 1 > 2;
  }
  const statut = auto ? "annule_auto" : (isLate ? "annule_tardif" : "annule");
  const suivi = { statut: statut, at: at, canal: canal, par: auteur, eleveId: slot.reservedBy, date: slot.date, token: opts.token || null };
  if (excessive) {
    const patch = { definitivelyCancelled: true, cancelledBy: by, cancelledAt: at, confirmed: false, reminderActionToken: null, zoomJoinUrl: null, suivi: suivi };
    if (by === "student") patch.consommation = { statut: "decomptee", motif: auto ? "Cours non confirmé à H-1, tolérances épuisées (2 sur 30 jours)" : "Annulation tardive, tolérances épuisées (2 sur 30 jours)", par: "automatisation", at: at, etatAvant: "programmee" };
    rptPatch_(slotId, token, patch);
    if (by === "teacher") {
      refundDue = true;
      patchFirestoreFields_(fsBase_(), "eleves", slot.reservedBy, token, { refundDue: { booleanValue: true } });
    }
  } else {
    patchFirestoreFields_(fsBase_(), "disponibilites", slotId, token, {
      reservedBy: { nullValue: null }, reservedName: { nullValue: null }, reservedEmail: { nullValue: null }, reservedPhone: { nullValue: null },
      zoomJoinUrl: { nullValue: null }, zoomTopic: { nullValue: null }, paymentStatus: { nullValue: null }, cpfNaNota: { nullValue: null },
      reminderSent: { booleanValue: false }, reminderSentForDate: { nullValue: null }, reminderActionToken: { nullValue: null }, reminderSentAt: { nullValue: null },
      clickedByStudent: { nullValue: null }, clickedByTeacher: { nullValue: null }, confirmed: { booleanValue: false },
      rescheduleRequest: { nullValue: null }, rescheduleRequested: { nullValue: null }, cancelledAt: { stringValue: at },
      packId: { nullValue: null }, isPack: { booleanValue: false }, consommation: { nullValue: null }, anomalie: { booleanValue: false },
      suivi: jsToFirestoreValue_(suivi)
    });
    if (slot.isPack === true) {
      const pack = studentData.pack && typeof studentData.pack === "object" ? studentData.pack : {};
      pack.used = Math.max(0, Number(pack.used || 0) - 1);
      patchFirestoreFields_(fsBase_(), "eleves", slot.reservedBy, token, { pack: jsToFirestoreValue_(pack) });
    }
  }
  const tolerances = isLate ? { utilisees: Math.min(2, recentCount + 1), restantes: Math.max(0, 2 - (recentCount + 1)) } : null;
  const details = { tardive: isLate, decomptee: excessive && by === "student", remboursementDu: refundDue, tolerances: tolerances, forfait: slot.isPack === true ? (excessive && by === "student" ? "séance décomptée" : "séance rendue au forfait") : null };
  const ev = suiviEvenement_(slotId, slot, auto ? "lesson_auto_cancelled" : "lesson_cancelled", auteur, auto ? "automatisation" : canal, ancien, statut, details, "cancel");
  const nom = slot.reservedName || "Un élève";
  const msg = auto
    ? `Le cours de ${nom} du ${suiviDateFr_(slot.date)} a été automatiquement annulé faute de confirmation${excessive ? " (tolérances épuisées : séance décomptée)" : ` (tolérance ${Math.min(2, recentCount + 1)}/2 utilisée)`}.`
    : `${nom} a annulé son cours du ${suiviDateFr_(slot.date)}${isLate ? " moins d'une heure avant" + (excessive ? " — tolérances épuisées, séance décomptée" : ` — tolérance ${Math.min(2, recentCount + 1)}/2 utilisée`) : ""}.`;
  suiviJournaliser_(token, ev, auteur === "administratrice" ? null : suiviNotification_(ev, msg, false));
  const message = excessive && by === "student"
    ? "Ton cours est annulé. Tu as déjà utilisé les 2 tolérances d'annulation tardive des 30 derniers jours : cette séance est décomptée de ton forfait."
    : "Ton cours a bien été annulé.";
  return { ok: true, statut: statut, excessive: excessive, refundDue: refundDue, message: message,
    mailAnnulation: auteur === "eleve" ? { nom: slot.reservedName, date: slot.date, canal: canal } : null };
}

/* ---- Annulation automatique à H-1 des cours non confirmés ----
   Déclencheur : annulerCoursNonConfirmes toutes les 10 minutes.
   Activée seulement si config/plateforme.confirmation.annulationAuto === true ;
   sinon, une notification « cours non confirmé » est créée (une seule fois).
   Jamais si : rappel non envoyé pour cette date, cours confirmé, déplacement demandé
   ou proposé, cours expérimental, anomalie. */
function annulerCoursNonConfirmes() {
  const token = getFirestoreAccessToken_();
  let actif = false;
  try {
    const doc = getFirestoreDocument_(fsBase_(), "config", "plateforme", token);
    const c = (firestoreFieldsToJs_(doc.fields || {}).confirmation) || {};
    actif = c.annulationAuto === true;
  } catch (e) { /* désactivée par défaut */ }
  const now = Date.now();
  const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "disponibilites" }], where: { compositeFilter: { op: "AND", filters: [
      { fieldFilter: { field: { fieldPath: "date" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: new Date(now).toISOString() } } },
      { fieldFilter: { field: { fieldPath: "date" }, op: "LESS_THAN_OR_EQUAL", value: { stringValue: new Date(now + 3600000).toISOString() } } }
    ] } } } }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) throw new Error("annulerCoursNonConfirmes : " + res.getContentText());
  const out = { annules: 0, signales: 0 };
  (JSON.parse(res.getContentText()) || []).filter(r => r.document).forEach(r => {
    const id = r.document.name.split("/").pop();
    const s = firestoreFieldsToJs_(r.document.fields || {});
    if (!s.reservedBy || s.isExperimental === true || s.experimentalCancelled || s.definitivelyCancelled || s.anomalie) return;
    if (s.reminderSentForDate !== s.date) return;
    const st = suiviStatut_(s);
    if (st !== "en_attente") return;
    if (s.rescheduleRequest && s.rescheduleRequest.status === "pending") return;
    if (!actif) {
      const ev = suiviEvenement_(id, s, "lesson_unconfirmed", "automatisation", "automatisation", st, st, { annulationAutomatique: "désactivée" }, "h-1");
      suiviJournaliser_(token, ev, suiviNotification_(ev, `${s.reservedName || "Un élève"} n'a pas confirmé son cours du ${suiviDateFr_(s.date)} (H-1). Annulation automatique désactivée : le cours est maintenu.`, false));
      out.signales++;
      return;
    }
    try {
      rptWithLock_(() => {
        const frais = rptLoadSlot_(id, token);
        if (frais.reservedBy !== s.reservedBy || frais.date !== s.date || suiviStatut_(frais) !== "en_attente") return null;
        const r2 = coursAnnuler_(token, id, frais, "student", "automatisation", { auto: true });
        if (frais.reservedEmail) { try { sendCancellationEmail(frais.reservedEmail, (frais.reservedName || "").split(" ")[0], suiviDateFr_(frais.date)); } catch (e) {} }
        return r2;
      });
      out.annules++;
    } catch (e) { console.warn("Annulation automatique impossible pour " + id + " : " + rptErrMsg_(e)); }
  });
  return out;
}

/* ---- Actions appelées depuis l'application ---- */
function handleLessonAction(data, authCtx) {
  try {
    if (!authCtx || !authCtx.uid) throw new Error("Authentification requise.");
    if (!data.slotId || !["confirm", "reschedule_request"].includes(data.type)) throw new Error("Action inconnue.");
    const actor = { role: isTeacherAuth_(authCtx) ? "administratrice" : "eleve", uid: authCtx.uid, via: "plateforme" };
    return jsonResponse(coursAction_(data.slotId, data.type, actor, { availability: data.availability }));
  } catch (err) { return jsonResponse({ ok: false, error: rptErrMsg_(err) }); }
}
/* Relance du rappel (même lien) — professeure, au plus une fois toutes les 6 h. */
function handleResendReminder(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    const res = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const s = rptLoadSlot_(data.slotId, token);
      if (!s.reservedBy || !s.reservedEmail) throw new Error("Pas d'élève ou pas d'e-mail pour ce cours.");
      if (new Date(s.date).getTime() - Date.now() < 3600000) throw new Error("Le cours commence dans moins d'une heure.");
      if (suiviStatut_(s) !== "en_attente") throw new Error("L'élève a déjà répondu (" + (SUIVI_LIBELLES_[suiviStatut_(s)] || suiviStatut_(s)) + ").");
      if (s.reminderLastResentAt && Date.now() - new Date(s.reminderLastResentAt).getTime() < 6 * 3600000) throw new Error("Un rappel a déjà été renvoyé il y a moins de 6 heures.");
      let actionToken = s.reminderSentForDate === s.date ? s.reminderActionToken : null;
      if (!actionToken) actionToken = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");
      const tz = getStudentTimezone_(fsBase_(), s.reservedBy, token) || "America/Sao_Paulo";
      sendReminderEmail(s.reservedEmail, (s.reservedName || "").split(" ")[0], formatDateInTimezone_(new Date(s.date), tz), data.slotId, actionToken);
      const at = new Date().toISOString();
      rptPatch_(data.slotId, token, { reminderSent: true, reminderSentForDate: s.date, reminderActionToken: actionToken, reminderSentAt: s.reminderSentAt || at, reminderLastResentAt: at, reminderResends: Number(s.reminderResends || 0) + 1 });
      const ev = suiviEvenement_(data.slotId, s, "lesson_reminder_resent", "administratrice", "email", "en_attente", "en_attente", null, "resend|" + at);
      suiviJournaliser_(token, ev, null);
      return { ok: true };
    });
    return jsonResponse(res);
  } catch (err) { return jsonResponse({ ok: false, error: rptErrMsg_(err) }); }
}


/* Clôt les notifications « intervention requise » d'une séance une fois que
   Melissa a traité la demande (proposition, acceptation ou refus). */
function suiviCloreDemandes_(token, slotId) {
  try {
    const res = UrlFetchApp.fetch(`${fsBase_()}:runQuery`, {
      method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
      payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "notificationsProf" }], where: { fieldFilter: { field: { fieldPath: "seanceId" }, op: "EQUAL", value: { stringValue: slotId } } } } }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) return;
    const at = new Date().toISOString();
    (JSON.parse(res.getContentText()) || []).filter(r => r.document).forEach(r => {
      const n = firestoreFieldsToJs_(r.document.fields || {});
      if (n.seanceId === slotId && n.actionRequise === true && !n.traiteeAt) {
        patchFirestoreFields_(fsBase_(), "notificationsProf", r.document.name.split("/").pop(), token, { actionRequise: { booleanValue: false }, traiteeAt: { stringValue: at } });
      }
    });
  } catch (e) { console.warn("suiviCloreDemandes_ : " + rptErrMsg_(e)); }
}

/* Refus, par Melissa, d'une demande de déplacement de l'élève : le cours reste
   à sa date d'origine (rien n'est décompté) et l'élève est prévenu(e). */
function handleRefuseRescheduleRequest(data, authCtx) {
  try {
    requireTeacher_(authCtx);
    if (!data.slotId) throw new Error("slotId manquant");
    const res = rptWithLock_(() => {
      const token = getFirestoreAccessToken_();
      const slot = rptLoadSlot_(data.slotId, token);
      const req = slot.rescheduleRequest || null;
      if (!req || req.by !== "student" || req.status !== "pending") return { ok: true, already: true };
      const at = new Date().toISOString();
      const motif = String(data.motif || "").slice(0, 300);
      const apres = slot.confirmed === true ? "confirme" : "en_attente";
      rptPatch_(data.slotId, token, {
        rescheduleRequest: Object.assign({}, req, { status: "refused", refusedAt: at, refusedBy: "teacher", motif: motif }),
        rescheduleRequested: false,
        rescheduleHistory: rptHistory_(slot, { type: "student_request_refused", by: "teacher", via: "plateforme" }),
        suivi: { statut: apres, at: at, canal: "plateforme", par: "administratrice", eleveId: slot.reservedBy, date: slot.date }
      });
      const ev = suiviEvenement_(data.slotId, slot, "lesson_reschedule_refused", "administratrice", "plateforme", "deplacement_demande", apres,
        { motif: motif || null, coursMaintenu: slot.date }, "refusdemande|" + (req.requestedAt || ""));
      suiviJournaliser_(token, ev, null);
      suiviCloreDemandes_(token, data.slotId);
      return { ok: true, slot: slot, motif: motif };
    });
    if (res.ok && res.slot && res.slot.reservedEmail) {
      try {
        const token = getFirestoreAccessToken_();
        const tz = getStudentTimezone_(fsBase_(), res.slot.reservedBy, token) || "America/Sao_Paulo";
        MailApp.sendEmail({ to: res.slot.reservedEmail, subject: "Ta demande de déplacement de cours",
          htmlBody: `<p>Bonjour ${escapeHtml_((res.slot.reservedName || "").split(" ")[0])},</p><p>Melissa n'a pas pu accepter le déplacement demandé. Ton cours reste prévu le <strong>${escapeHtml_(formatDateInTimezone_(new Date(res.slot.date), tz))}</strong>.</p>` +
            (res.motif ? `<p>Message de Melissa : ${escapeHtml_(res.motif)}</p>` : "") + `<p>Tu peux répondre depuis ton espace de cours.</p>` });
      } catch (e) { console.warn(e); }
    }
    return jsonResponse({ ok: true, already: res.already === true });
  } catch (err) { return jsonResponse({ ok: false, error: rptErrMsg_(err) }); }
}
